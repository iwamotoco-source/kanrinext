#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
工事管理next ローカルTTSサーバー（キャラクター音声: Edge TTS → RVC）

・あなたのPCで動かす小さなHTTPサーバーです。RVCモデル(.pth/.index)はこのリポジトリに含まれません。
  `local-tts/models/<モデル名>/xxx.pth (+ xxx.index)` にご自身で配置してください（Gitには入らない設定です）。
・処理は Hugging Face Space「John6666/mikuTTS」と同じ流れです:
    テキスト → edge-tts(ja-JP-NanamiNeural) → RVC(rmvpe, Tune=6, index_rate=1.0, protect=0.33, filter_radius=3, rms_mix_rate=0.25)
・認証: Authorization: Bearer <トークン>（初回起動時に token.txt を自動生成。表示されます）
・CORS: 許可したオリジン（既定: https://iwamotoco-source.github.io と localhost:8080）以外は拒否
・Gemini や外部AIへは一切通信しません。本文は保存・ログ出力しません（文字数のみ）。

  python server.py                 # 127.0.0.1:8765 で起動
  python server.py --dry-run       # モデル無しで通信確認（合成音を返す）
  python server.py --host 0.0.0.0  # LAN公開（非推奨。https化・認証付きの方法は README 参照）
"""
import argparse, asyncio, hmac, json, os, re, secrets, shutil, struct, subprocess, sys, tempfile, threading, time, wave, math
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_ORIGINS = ["https://iwamotoco-source.github.io", "http://localhost:8080", "http://127.0.0.1:8080"]
MAX_TEXT = 400
MAX_BODY = 32 * 1024
VOICE_RE = re.compile(r"^[a-z]{2,3}-[A-Z]{2}-[A-Za-z0-9]+Neural$")

# mikuTTS Space の既定値（app.py で確認）
DEFAULTS = dict(pitch=6, f0_method="rmvpe", index_rate=1.0, protect=0.33, filter_radius=3, rms_mix_rate=0.25,
                resample_sr=0, speed=0, volume=0, tts_voice="ja-JP-NanamiNeural")

LOCK = threading.Lock()   # 推論は1件ずつ（CPU/GPU保護）


def clamp(v, lo, hi, d):
    try:
        v = float(v)
    except Exception:
        return d
    if v != v:
        return d
    return min(hi, max(lo, v))


class Backend:
    """Edge TTS + RVC。重いライブラリは最初に使うときだけ読み込む。"""

    def __init__(self, models_dir, default_model, device, dry_run):
        self.models_dir = models_dir
        self.default_model = default_model
        self.device = device
        self.dry_run = dry_run
        self._rvc = None
        self._rvc_model = None
        self.rvc_error = None
        self.ffmpeg = shutil.which("ffmpeg")

    # ---- モデル一覧（Space と同じ: モデル用フォルダ直下の各ディレクトリ。名前順の先頭が既定） ----
    def models(self):
        try:
            return sorted(d for d in os.listdir(self.models_dir)
                          if os.path.isdir(os.path.join(self.models_dir, d)) and self._pth(d))
        except FileNotFoundError:
            return []

    def _pth(self, name):
        d = os.path.join(self.models_dir, name)
        try:
            return [os.path.join(d, f) for f in sorted(os.listdir(d)) if f.lower().endswith(".pth")]
        except Exception:
            return []

    def _index(self, name):
        d = os.path.join(self.models_dir, name)
        try:
            return [os.path.join(d, f) for f in sorted(os.listdir(d)) if f.lower().endswith(".index")]
        except Exception:
            return []

    def resolve_model(self, requested):
        ms = self.models()
        if requested:
            return requested if requested in ms else None   # 一覧にある名前だけ（パス指定は不可）
        if self.default_model and self.default_model in ms:
            return self.default_model
        return ms[0] if ms else None

    def rvc_ready(self):
        if self.dry_run:
            return True
        if not self.models():
            return False
        try:
            import rvc_python.infer  # noqa: F401
            return True
        except Exception as e:
            self.rvc_error = str(e)[:200]
            return False

    # ---- 合成 ----
    def synth(self, p):
        """p: 検証済みパラメータ。戻り値 (bytes, content_type, engine名)"""
        if self.dry_run:
            return self._tone(p["text"], p["speed"], p["pitch"]), "audio/wav", "dry-run"
        with tempfile.TemporaryDirectory() as td:
            mp3 = os.path.join(td, "edge.mp3")
            self._edge(p, mp3)
            if p["voice"] == "edge":
                with open(mp3, "rb") as f:
                    return f.read(), "audio/mpeg", "edge"
            wav_in = os.path.join(td, "in.wav")
            self._to_wav(mp3, wav_in)
            out = os.path.join(td, "out.wav")
            self._rvc_convert(p, wav_in, out)
            with open(out, "rb") as f:
                return f.read(), "audio/wav", "rvc"

    def _edge(self, p, path):
        import edge_tts  # pip install edge-tts
        sp = "+%d%%" % p["speed"] if p["speed"] >= 0 else "%d%%" % p["speed"]
        vo = "+%d%%" % p["volume"] if p["volume"] >= 0 else "%d%%" % p["volume"]
        pi = "+%dHz" % p["edge_pitch"] if p["edge_pitch"] >= 0 else "%dHz" % p["edge_pitch"]
        asyncio.run(edge_tts.Communicate(p["text"], p["tts_voice"], rate=sp, volume=vo, pitch=pi).save(path))

    def _to_wav(self, src, dst):
        if not self.ffmpeg:
            raise RuntimeError("ffmpeg が見つかりません（RVC変換に必要）")
        subprocess.run([self.ffmpeg, "-y", "-loglevel", "error", "-i", src, "-ac", "1", "-ar", "16000", dst], check=True, timeout=60)

    def _rvc_convert(self, p, src, dst):
        name = p["model"]
        if self._rvc is None:
            from rvc_python.infer import RVCInference  # pip install rvc-python（MIT）
            self._rvc = RVCInference(device=self.device)
        if self._rvc_model != name:
            pth = self._pth(name)[0]
            idx = self._index(name)
            try:
                self._rvc.load_model(pth, index_path=idx[0]) if idx else self._rvc.load_model(pth)
            except TypeError:
                self._rvc.load_model(pth)   # 古い rvc-python は index_path 引数なし
            self._rvc_model = name
        # Space の vc.pipeline 引数に相当: f0_up_key / f0_method / index_rate / protect / filter_radius / rms_mix_rate / resample_sr
        self._rvc.set_params(f0up_key=p["pitch"], f0method=p["f0_method"], index_rate=p["index_rate"], protect=p["protect"],
                             filter_radius=p["filter_radius"], resample_sr=p["resample_sr"], rms_mix_rate=p["rms_mix_rate"])
        self._rvc.infer_file(src, dst)

    @staticmethod
    def _tone(text, speed, pitch, sr=22050):
        """--dry-run 用: 文字数に応じた長さの合成音（モデル不要で通信・再生・口パクを確認できる）"""
        n = max(6, min(len(text), 120))
        dur = n * 0.11 * (100.0 / (100 + speed))
        frames = bytearray()
        base = 220.0 * (2 ** (pitch / 12.0))
        for i in range(int(sr * dur)):
            t = i / sr
            env = 0.5 * (1 + math.sin(2 * math.pi * 4.5 * t))   # 4.5Hz の抑揚（口パク確認用）
            v = int(9000 * env * math.sin(2 * math.pi * base * t))
            frames += struct.pack("<h", v)
        import io
        buf = io.BytesIO()
        with wave.open(buf, "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(bytes(frames))
        return buf.getvalue()


def load_token(path):
    t = os.environ.get("TTS_TOKEN", "").strip()
    if t:
        return t
    if os.path.exists(path):
        t = open(path, encoding="utf-8").read().strip()
        if t:
            return t
    t = secrets.token_urlsafe(24)
    with open(path, "w", encoding="utf-8") as f:
        f.write(t)
    try:
        os.chmod(path, 0o600)
    except Exception:
        pass
    return t


def make_handler(backend, token, origins):
    class H(BaseHTTPRequestHandler):
        server_version = "kouji-tts/1"

        def log_message(self, fmt, *a):   # 本文・クエリは出さない
            sys.stderr.write("%s %s\n" % (self.address_string(), fmt % a))

        # ---- 共通 ----
        def _origin_ok(self):
            o = self.headers.get("Origin")
            return (o is None) or (o in origins)

        def _cors(self):
            o = self.headers.get("Origin")
            if o and o in origins:
                self.send_header("Access-Control-Allow-Origin", o)
                self.send_header("Vary", "Origin")
                self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
                self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                self.send_header("Access-Control-Max-Age", "600")
                if self.headers.get("Access-Control-Request-Private-Network", "").lower() == "true":
                    self.send_header("Access-Control-Allow-Private-Network", "true")   # Chrome の Private Network Access

        def _json(self, code, obj):
            b = json.dumps(obj, ensure_ascii=False).encode("utf-8")
            self.send_response(code)
            self._cors()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(b)))
            self.end_headers()
            self.wfile.write(b)

        def _auth(self):
            h = self.headers.get("Authorization", "")
            got = h[7:].strip() if h.lower().startswith("bearer ") else ""
            if got and hmac.compare_digest(got.encode(), token.encode()):
                return True
            time.sleep(0.4)   # 総当たり対策
            self._json(401, {"ok": False, "error": "unauthorized"})
            return False

        # ---- メソッド ----
        def do_OPTIONS(self):
            if not self._origin_ok():
                return self._json(403, {"ok": False, "error": "origin_not_allowed"})
            self.send_response(204)
            self._cors()
            self.send_header("Content-Length", "0")
            self.end_headers()

        def do_GET(self):
            if not self._origin_ok():
                return self._json(403, {"ok": False, "error": "origin_not_allowed"})
            path = self.path.split("?")[0]
            if path == "/health":
                return self._json(200, {"ok": True, "service": "kouji-next-tts"})
            if path == "/status":
                if not self._auth():
                    return
                return self._json(200, {"ok": True, "service": "kouji-next-tts", "dryRun": backend.dry_run,
                                        "rvc": backend.rvc_ready(), "rvcError": backend.rvc_error, "ffmpeg": bool(backend.ffmpeg),
                                        "models": backend.models(), "defaultModel": backend.resolve_model(""),
                                        "defaults": DEFAULTS, "maxText": MAX_TEXT})
            self._json(404, {"ok": False, "error": "not_found"})

        def do_POST(self):
            if not self._origin_ok():
                return self._json(403, {"ok": False, "error": "origin_not_allowed"})
            if self.path.split("?")[0] != "/tts":
                return self._json(404, {"ok": False, "error": "not_found"})
            if not self._auth():
                return
            try:
                n = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                n = 0
            if n <= 0 or n > MAX_BODY:
                return self._json(413, {"ok": False, "error": "bad_body_size"})
            try:
                req = json.loads(self.rfile.read(n).decode("utf-8"))
                assert isinstance(req, dict)
            except Exception:
                return self._json(400, {"ok": False, "error": "bad_json"})
            text = str(req.get("text", "")).strip()
            if not text:
                return self._json(400, {"ok": False, "error": "empty_text"})
            if len(text) > MAX_TEXT:
                return self._json(413, {"ok": False, "error": "text_too_long", "max": MAX_TEXT})
            voice = "edge" if req.get("voice") == "edge" else "character"
            tv = str(req.get("tts_voice") or DEFAULTS["tts_voice"])
            if not VOICE_RE.match(tv):
                return self._json(400, {"ok": False, "error": "bad_tts_voice"})
            f0 = "pm" if req.get("f0_method") == "pm" else "rmvpe"
            p = dict(text=text, voice=voice, tts_voice=tv, f0_method=f0,
                     pitch=int(round(clamp(req.get("pitch"), -24, 24, DEFAULTS["pitch"]))),
                     speed=int(round(clamp(req.get("speed"), -100, 100, 0))),
                     volume=int(round(clamp(req.get("volume"), -100, 100, 0))),
                     edge_pitch=int(round(clamp(req.get("edge_pitch"), -50, 50, 0))),
                     index_rate=clamp(req.get("index_rate"), 0, 1, DEFAULTS["index_rate"]),
                     protect=clamp(req.get("protect"), 0, 0.5, DEFAULTS["protect"]),
                     filter_radius=int(round(clamp(req.get("filter_radius"), 0, 7, DEFAULTS["filter_radius"]))),
                     rms_mix_rate=clamp(req.get("rms_mix_rate"), 0, 1, DEFAULTS["rms_mix_rate"]),
                     resample_sr=0)
            if voice == "character":
                if not backend.rvc_ready():
                    return self._json(503, {"ok": False, "error": "rvc_not_ready", "detail": backend.rvc_error or "モデル未配置、または rvc-python 未導入"})
                m = backend.resolve_model(str(req.get("model") or ""))
                if not m and not backend.dry_run:
                    return self._json(404, {"ok": False, "error": "model_not_found"})
                p["model"] = m
            self.log_message("tts chars=%d voice=%s", len(text), voice)
            try:
                with LOCK:
                    data, ctype, eng = backend.synth(p)
            except Exception as e:
                sys.stderr.write("synth error: %s\n" % repr(e)[:300])
                return self._json(500, {"ok": False, "error": "synth_failed", "detail": str(e)[:160]})
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", ctype)
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-TTS-Engine", eng)
            self.send_header("Access-Control-Expose-Headers", "X-TTS-Engine")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

    return H


def main():
    ap = argparse.ArgumentParser(description="工事管理next ローカルTTSサーバー")
    ap.add_argument("--host", default=os.environ.get("TTS_HOST", "127.0.0.1"))
    ap.add_argument("--port", type=int, default=int(os.environ.get("TTS_PORT", "8765")))
    ap.add_argument("--origins", default=os.environ.get("TTS_ORIGINS", ",".join(DEFAULT_ORIGINS)), help="許可するオリジン（カンマ区切り）")
    ap.add_argument("--models-dir", default=os.environ.get("TTS_MODELS_DIR", os.path.join(HERE, "models")))
    ap.add_argument("--default-model", default=os.environ.get("TTS_DEFAULT_MODEL", ""))
    ap.add_argument("--device", default=os.environ.get("TTS_DEVICE", "cpu:0"), help="cpu:0 / cuda:0")
    ap.add_argument("--token-file", default=os.path.join(HERE, "token.txt"))
    ap.add_argument("--dry-run", action="store_true", help="モデル無しで通信確認（合成音）")
    a = ap.parse_args()
    origins = {o.strip().rstrip("/") for o in a.origins.split(",") if o.strip()}
    token = load_token(a.token_file)
    be = Backend(a.models_dir, a.default_model, a.device, a.dry_run)
    srv = ThreadingHTTPServer((a.host, a.port), make_handler(be, token, origins))
    print("=" * 60)
    print(" 工事管理next ローカルTTSサーバー%s" % ("（テストモード）" if a.dry_run else ""))
    print(" 待受: http://%s:%d" % (a.host, a.port))
    print(" 許可オリジン:", ", ".join(sorted(origins)))
    print(" TTSアクセスキー:", token, "  ← アプリの設定に貼り付け")
    print(" モデル:", ", ".join(be.models()) or "（未配置）", "| ffmpeg:", "あり" if be.ffmpeg else "なし")
    if a.host not in ("127.0.0.1", "localhost", "::1"):
        print(" ⚠ 外部から到達できる設定です。https化と認証付きの経路（README参照）を使ってください。")
    print("=" * 60, flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
