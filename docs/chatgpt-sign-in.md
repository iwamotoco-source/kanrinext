# ChatGPT選択肢の準備（未開通）

既定はGemini。AI設定にChatGPT（連携待ち）を追加した。
ChatGPTを選んで保存できるが、接続テストと送信はCHATGPT_NOT_CONNECTEDで止める。
Geminiや有料OpenAI APIへは自動転送しない。認証・推論接続は未実装。

## 開通を妨げている条件

2026-10-06に確認した公式資料では、公開OSSクライアントの動的登録は
127.0.0.1のHTTPコールバックとローカルのリスナーを必要とする。
iPhoneのGitHub Pages/PWAだけではリスナーを起動できない。
この方式のredirect_uriをGitHub PagesやVercelのHTTPS URLへ変更して使わない。

Web用はOpenAIから発行されたクライアントID・登録済みコールバック・
必要ならクライアント秘密鍵が必要。本人確認の許可だけではAI推論の権限にならない。
Web用登録とChatGPT利用枠の権限が許可されるか確認してから認証を実装する。

## OpenAIへの登録時に確認する内容

- アプリ名: 工事管理next / kanrinext
- リポジトリ: https://github.com/iwamotoco-source/kanrinext
- フロント: https://iwamotoco-source.github.io/kanrinext/
- バックエンド: https://kanrinext.vercel.app
- 用途: 日本語での対話、施工管理の予定・タスク、添付資料の解析
- 必要な権限: 本人確認に加え、ユーザー自身のChatGPTプランでのResponses API利用
- 実行環境: iPhone Safari/PWA + Vercel。端末内のHTTPリスナーなし
- 登録コールバック: 許可されるフローの確定後に実装・登録する

## 許可後に必要な実装

1. PKCE/state/nonce、期限・一回限りのトランザクション、IDトークン署名検証。
2. ユーザーごとの安全なセッション保存、トークン更新、連携解除。
3. サーバーが返す利用可能モデル一覧によるモデル選択。
4. Responses APIをstore:false/stream:trueで呼び、response.completedまで確認。
5. 履歴・資料・承認制の操作候補とPiper-plusへの接続。
6. 認証実機テスト後、フロントとバックエンドの未開通ガードを置き換える。

## 公式資料

- https://developers.openai.com/siwc/website
- https://developers.openai.com/siwc/request-client-id
- https://developers.openai.com/siwc/token-sharing-open-source/sign-in
- https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference
- https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations
