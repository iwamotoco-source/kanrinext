# キャラクター音声を、PCなし（iPhoneだけ）で使う方法

自分用の Hugging Face Space（mikuTTS の複製）を作り、アプリから呼び出します。無料です。

```
工事管理next → Vercel（/api/tts） → あなた専用のHugging Face Space → 音声(WAV) → 再生＋口パク
```

- Hugging Face のトークンは Vercel にだけ置きます（ブラウザには出ません）。
- 読み上げのために Gemini へ追加リクエストは送りません。
- 読み上げる文章は、あなた専用（非公開）の Space に送られます。

## 注意（先に読んでください）

- 変換モデルは `NoCrypt/miku_RVC` から、Space が起動時に自動で取得します。このモデルはライセンス記載がなく、再配布の許諾を確認できていません。**個人利用の範囲にとどめ、Space は必ず非公開にしてください。**
- 無料の CPU 版は遅めです（1文あたり十数秒〜数十秒）。しばらく使わないと Space が休止し、再開に1〜2分かかります。この間はブラウザの声で読み上げます。
- Space が使えないときは、自動でブラウザの声に切り替わります（設定「利用できない場合はブラウザ音声」が ON のとき）。

## 手順

### 1. Hugging Face のアカウントを作る
1. https://huggingface.co/join を開き、メールアドレスとパスワードで登録（無料）。

### 2. Space を複製する
1. https://huggingface.co/spaces/John6666/mikuTTS を開く。
2. 右上の「︙」→「Duplicate this Space」。
3. 次のように設定して「Duplicate Space」。
   - Space name: `mikutts`（好きな名前で可）
   - **Visibility: Private**（非公開）
   - Hardware: `CPU basic`（無料）
4. 数分でビルドが終わり、「Running」になります。画面で文章を入れて生成し、ミクの声が出ることを確認してください。

### 3. Space の URL を控える
- 通常は `https://あなたのユーザー名-mikutts.hf.space` です（「︙」→「Embed this Space」の Direct URL でも確認できます）。

### 4. アクセストークンを作る
1. https://huggingface.co/settings/tokens → 「Create new token」。
2. Type は **Read**。名前は `kouji-next` など。作成して `hf_...` をコピー（再表示されないので注意）。

### 5. Vercel に2つ登録する
Vercel のプロジェクト → Settings → Environment Variables:

| Name | Value |
|---|---|
| `HF_TTS_SPACE` | 手順3のURL（または `ユーザー名/mikutts`） |
| `HF_TOKEN` | 手順4のトークン（`hf_...`） |

登録後、Deployments → 最新の「︙」→ **Redeploy**（環境変数は再デプロイで反映されます）。

### 6. アプリで設定する
1. AI設定 → 読み上げ音声 → **キャラクター音声**。
2. 「TTSサーバーのURL」は**空欄のまま**。
3. 「音声サーバーの接続テスト」→「接続できました」と出たら、「試し聞き」。
4. AIの回答の🔊を押す。

## うまくいかないとき

| 症状 | 対処 |
|---|---|
| 「HF_TTS_SPACE が未設定」 | 手順5を行い、再デプロイしたか確認 |
| 「音声Spaceが起動中です」 | 休止から復帰中。1〜2分待って再度 |
| 「音声Spaceにアクセスできません」 | `HF_TOKEN` の貼り間違い・期限切れ・Spaceが非公開なのにトークン未設定 |
| 音が出ずブラウザの声になる | 上記のどれかが原因。接続テストのメッセージを確認 |
| 声が思った声と違う | 設定の「詳細設定 → モデル名」にモデルフォルダ名を入れる（Spaceの Model 一覧と同じ名前）。既定は `1a_miku_default_rvc_(aple)` |

## 仕様メモ

- Space の API: `POST /gradio_api/call/tts`（入力順: model_name, speed, volume, pitch(Hz), tts_text, tts_voice, f0_up_key, f0_method, index_rate, protect）。Space の `app.py` で確認した形式です。
- 既定値は mikuTTS Space の初期値（Tune=6、rmvpe、Index Rate=1、Protect=0.33、話者 `ja-JP-NanamiNeural`）。
- 1回の文章は400文字まで。アプリが文ごとに分割して送ります。
- PC をお持ちの場合は `local-tts/README.md`（自分のPCで動かす方法）も使えます。
