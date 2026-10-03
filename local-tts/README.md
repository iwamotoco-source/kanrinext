# ローカルTTSサーバー（キャラクター音声）

AI Workspace の「🔊 読み上げ」を、**Edge TTS → RVC** のキャラクター音声で再生するための、あなたのPC上で動かす小さなサーバーです。

```
Gemini の回答テキスト（すでに表示されている文字列）
   ↓ 工事管理next（TTS Router）
   ├ キャラクター音声 → このサーバー POST /tts → Edge TTS → RVC → WAV → 再生＋口パク
   └ ブラウザ音声     → speechSynthesis（従来どおり）
```

- **読み上げのために Gemini へ追加リクエストは送りません。**（テキストはあなたのTTSサーバーにだけ送られます）
- RVCモデル（.pth / .index）は **このリポジトリに含まれません**。`.gitignore` で除外済みです。

## 公開リポジトリに入っているもの / ローカルだけのもの

| GitHub（公開） | あなたのPCだけ（コミット禁止） |
|---|---|
| `assets/js/assistant-tts.js`（TTS Router・再生・口パク・フォールバック） | RVCモデル `local-tts/models/*/*.pth` |
| AI設定の「読み上げ音声」UI | `*.index`（検索インデックス） |
| `local-tts/server.py`（サーバー本体・モデル無し） | `local-tts/token.txt`（アクセスキー） |
| `local-tts/README.md` ほか | Python仮想環境 `local-tts/.venv/` |

## モデルのライセンスについて（調査結果）

- 参考にした Space `John6666/mikuTTS`（`NoCrypt/mikuTTS` の複製）は、`NoCrypt/miku_RVC` から `.pth` / `.index` を取得して動きます。
- `NoCrypt/miku_RVC` には**ライセンスの記載がなく**、モデルカードは配布元（Google Drive）へのリンクのみで、再配布の許諾を確認できませんでした。
- そのためモデルは **同梱・再配布していません**。ご自身で入手・配置してください。個人利用の範囲にとどめ、公開しないでください。
- 声のモデルは、元になった声・キャラクターの権利にも注意が必要です（商用・公開利用は特に）。
- `rvc-python`（RVC推論）は MIT ライセンスです。`edge-tts` は Microsoft Edge の「読み上げ」オンライン機能を非公式に利用するもので、公式APIではありません（個人利用の範囲で、サービス側の変更で使えなくなる可能性があります）。

## セットアップ（Windows）

1. **Python 3.10** と **ffmpeg** を入れる（`winget install Gyan.FFmpeg`）。
2. モデルを置く: `local-tts\models\好きな名前\xxxx.pth`（`.index` があれば同じフォルダへ）。
   - 名前順の先頭が既定モデルです（Space と同じ挙動）。
3. `local-tts\start-tts.cmd` をダブルクリック（初回は仮想環境と依存ライブラリを自動で入れます）。
4. 画面に表示される **TTSアクセスキー** をコピー。
5. 工事管理next → AI設定 → 「読み上げ音声」→ キャラクター音声
   - URL: `http://localhost:8765`（同じPCで使うとき）
   - TTSアクセスキー: 手順4の値
   - 「音声サーバーの接続テスト」→「試し聞き」

GPUがある場合は `--device cuda:0`（`start-tts.cmd --device cuda:0`）。まず `--dry-run` で通信だけ確認することもできます（合成音が鳴ります）。

### 既定の音声設定（mikuTTS Space の初期値）

| 項目 | 値 |
|---|---|
| Edge TTS 話者 | `ja-JP-NanamiNeural` |
| Tune（f0_up_key） | 6 |
| ピッチ抽出 | rmvpe |
| Index Rate | 1.0 |
| Protect | 0.33 |
| Filter Radius | 3 |
| RMS Mix Rate | 0.25 |
| 速度 / 音量 / Edgeピッチ | 0 |

Spaceでご自身が選んだモデルが既定（先頭）と違う場合は、設定の「詳細設定 → モデル名」にフォルダ名を入れてください。

## iPhone / 別端末から使う

iPhone でRVCは動かしません。PC のサーバーが音声を作り、iPhone は再生するだけです。
iPhone の Safari は `https` のページから `http` のサーバーへ接続できないため、**https の URL** が必要です。

- 推奨: **Tailscale**（PCとiPhoneを同じtailnetへ）。`tailscale serve` でPCの8765番を https 公開すると `https://PC名.xxxx.ts.net` が得られます（tailnet内の端末だけが到達可能）。
- 代替: Cloudflare Tunnel など。**公開URLにする場合は必ずアクセスキー認証を維持**し、`--origins` を自分のアプリのオリジンだけにしてください。
- `--host 0.0.0.0` でLANに直接公開するのは推奨しません（https化できないため iPhone では使えません）。

読み上げはユーザー操作（🔊ボタンや送信ボタン）の中で音声を解錠してから再生するので、iOS の自動再生制限でも動きます。

## セキュリティ

- 既定では `127.0.0.1`（そのPCだけ）で待ち受けます。
- `/tts` と `/status` は `Authorization: Bearer <キー>` が必須（`token.txt` に保存。環境変数 `TTS_TOKEN` でも指定可）。
- CORS は許可したオリジンだけ（既定: `https://iwamotoco-source.github.io`、`http://localhost:8080`、`http://127.0.0.1:8080`）。`--origins` で変更。Chrome の Private Network Access にも対応。
- 本文は保存・ログ出力しません（文字数のみ）。ブラウザ側の音声キャッシュはメモリ内・8分・最大24件だけで、永続保存しません。
- 1回のテキストは400文字まで（アプリ側で文ごとに分割して送ります）。

## API

```
GET  /health          → {"ok":true}（認証不要）
GET  /status          → モデル一覧・RVC準備状況（要認証）
POST /tts             要認証。JSON:
  { "text":"お疲れさまです。", "voice":"character", "pitch":6, "speed":0,
    "model":"", "tts_voice":"ja-JP-NanamiNeural", "f0_method":"rmvpe",
    "index_rate":1, "protect":0.33, "filter_radius":3, "rms_mix_rate":0.25 }
  → audio/wav（X-TTS-Engine: rvc | edge | dry-run）
```

`voice:"edge"` にすると RVC を通さず Edge TTS のみ（audio/mpeg）。RVCが未準備のときは `503 rvc_not_ready` を返し、アプリはブラウザ音声へ切り替えます。

## うまくいかないとき

| 症状 | 確認 |
|---|---|
| 接続テストで「応答がありません」 | サーバー起動・URL・ファイアウォール |
| 「キーが違います」 | 起動画面のTTSアクセスキーを貼り直す |
| iPhoneで接続できない | URLが `https` か（上記「iPhone」） |
| 「RVC 未準備」 | モデルの配置、`pip install rvc-python`、ffmpeg |
| 声が出ずブラウザ音声になる | 設定「利用できない場合はブラウザ音声」が動作中。サーバーのログを確認 |
