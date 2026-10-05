# ローカル用の単一HTML

設定 → バックアップ → 「ローカル用（単一HTMLファイル）」の **単一HTMLを保存する** で、アプリ全体を1つのHTMLファイル
（約7MB、`kanrinext-local_日付.html`）として保存します。ネットに繋がなくても開けます。

- 公開ページ（https）で押したときの、いまの版がそのまま保存されます（ビルドやサーバー処理は不要）。
- 保存したファイルは、ブラウザで開くだけで使えます（Chrome / Edge / Safari など）。
- 更新したいときは、公開ページの設定からもう一度保存し直します。

## ネットがないと使えない機能

| 機能 | 理由 |
|---|---|
| 地図の背景・天気 | 外部サービスから取得 |
| AIアシスタントの通信 | Vercel（`/api/ai`）経由。後述の `ALLOWED_ORIGIN` 設定が必要 |
| GitHub同期 | GitHub API |
| ファイル圧縮の「動画」 | 動画エンジン（約31MB）を初回だけCDNから取得 |
| 端末内音声（Piper-plus） | モデルをHugging Faceから取得 |

予定・タスク・カレンダー・AI画面の表示・全ツール（PDF整理、ファイル圧縮の画像/PDF/Excel、Excel画像抽出、図面計測、数量拾い、
配線ルート、電気計算、電気技術DB、交通費、現場書類）はネットなしで動きます。
PDF整理は、公開ページの offline 時に必要だった `pdf-lib` も同梱版を使うため、ローカル版のほうが確実に動きます。

## データの置き場所

予定・タスク・設定は、**そのファイルを開いたブラウザの中**に保存されます（公開ページとは別のデータです）。
公開ページ側のデータを持ち込むには、公開ページで「バックアップを書き出す」→ ローカル版で「バックアップから復元」。

## AIをローカル版から使う場合（任意）

ローカルのファイル（`file://`）から送られるリクエストの Origin は `null` になるため、Vercel の `ALLOWED_ORIGIN` に
`null` を追加しないと、AIのAPIは `ORIGIN_NOT_ALLOWED` で拒否します（既定では許可していません）。

```
ALLOWED_ORIGIN=https://iwamotoco-source.github.io,null
```

`null` を許可すると、`file://` などOriginを持たないページからもAPIを呼べるようになります。
APIは引き続き `X-App-Key`（`APP_ACCESS_TOKEN`）で守られますが、許可するかどうかは運用に合わせて判断してください。

## 仕組み（開発者向け）

実装は `assets/js/standalone-export.js`。ボタンを押すと、このブラウザで次を行います。

1. `index.html` を取得し、`<script src>` と `<link rel=stylesheet>` を本文に埋め込む。
   `ics.js` は `document.write` で本体JSを後から読むため、偽の `document` を渡して実行し、読み込む一覧（JS・CSS）を取り出して展開する。
2. `core.js` の `TOOLS` にあるツールHTMLと、そこから参照されるJS/CSS/ライブラリ、`KoujiAvatar.files()` の画像を集める。
   JS/HTML内の `assets/…` `tools/…` `icons/…`（と、ツール内の `./lib/…`）の文字列も辿って集める。
3. 本文に埋め込まなかったファイルは「仮想ファイル」として、テキストは文字列、画像は data URI で保存する。
4. 書き出したHTMLの中では実行時シム（`knRuntime`）が動き、相対パスで参照される `<img>`・`<script>`・`fetch`・`Worker`・
   ツールの `<iframe>` を仮想ファイルへ振り替える。ツールは `srcdoc` で開き、`?embed=1&theme=` は `location.search` の代わりに渡す。
   `defer` 付きのスクリプトは、元と同じく「ページを読み終えてから」実行する。
5. pdf.js は `file://` では標準のworker起動が拒否されるため、埋め込み済みworkerを直接起動して `workerPort` に渡す
   （起動できない環境ではpdf.js本来のメインスレッド処理に任せる）。

### 新しいファイルを足したとき

- `index.html` / `ics.js` のローダー / ツールHTML から参照される `<script src>`・`<link>`・`./assets/…` のような文字列は、自動で同梱されます。
- **ファイル名を文字列から組み立てて読む画像など**（例: アバター）は、一覧を返す関数が必要です（`KoujiAvatar.files()`）。
  同様の仕組みを増やしたら、書き出し側（`build()`）にもその一覧を渡してください。
- `document.write` や `document.currentScript.src` に依存するコードは、書き出し側で個別に対応が必要です（現状は `ics.js` と `assistant-piper.js`）。
- 同梱しないもの: `docs/` `scripts/` `workers/` `local-tts/` `api/` `data/kouji-next.json`（同期データ）、Piper関連、`manifest.json`。
- ツールが `./lib/` に置く前提のファイルが、別の場所にある場合は `ALIASES` に書く（現状は `tools/lib/pdf-lib.min.js`）。

### テスト

`NODE_PATH=<playwrightのあるnode_modules> TEST_CHROMIUM_PATH=/path/to/chromium node scripts/test-standalone.cjs`
（HTTPサーバーは内部で起動します）。実際に設定画面のボタンから保存し、そのファイルを **ネット遮断の `file://`** で開いて、
起動・タスクの保存と復元・同梱画像・全ツールの描画とライブラリ・pdf.js（worker）・PDF整理・電気技術DB検索を確認します。
iPhone Safari や、iPhoneの「ファイル」アプリ等で開いた場合の動作は未検証です。
