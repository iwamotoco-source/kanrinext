# 工事管理next AIプロキシ

GitHub PagesへAPIキーを置かずに外部AIを使うためのCloudflare Workers向けテンプレートです。

## 必要な環境変数 / Secret

- `OPENAI_API_KEY` — OpenAI APIキー。WorkerのSecretとして保存し、リポジトリには置かないこと。
- `OPENAI_MODEL` — Responses APIで利用するモデル名。
- `ALLOWED_ORIGIN` — 省略時は `https://iwamotoco-source.github.io`。必要に応じて変更。

## 工事管理next側

Workerを公開したら、工事管理next上部の `AI` → 歯車 → `AIプロキシURL` にWorker URLを入力し、外部AIを有効にします。

既定では、工事管理next自身で答えられる集計は端末内だけで処理します。外部AIへ送る場合も、タスク/予定のタイトル、日付、時刻、駅、優先度、カテゴリを中心に送信し、メモ本文は設定で明示的に許可した場合だけ送ります。

## セキュリティ

APIキーを `index.html` や `assets/js/*` に書かないでください。公開GitHub PagesのJavaScriptに置いた秘密情報は利用者から取得できます。
