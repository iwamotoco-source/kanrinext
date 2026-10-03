# 工事管理next アバター素材パック

添付されたオリジナル設定画像を基準に制作した、Webアプリ用の独立した透過素材です。本体アプリの変更は含みません。アバターの表示・状態遷移・瞬き・口パクにGemini APIは使用しません。

## 内容と仕様

- `avatars/`：20状態、各1024×1024px、透過・ロスレスWebP。共通の腰上構図。
- `icons/`：顔〜肩の10種、各512×512px、透過・ロスレスWebP。同じ範囲をクロップしたマスター。
- `animation/`：口3種・目3種、各1024×1024pxの透過PNG。**顔全体ではなく、元のアバターに重ねる同位置パーツ**です。見えている部分は小さく、残りは透過。
- `avatar-manifest.json`：状態名とパス、アイコン、アニメーション対応状態、共通キャンバス情報。
- `avatar-runtime.js` / `avatar.css`：通信不要の表示・動作サンプル。
- `preview/avatar-preview.html`：状態切替、瞬き、口パク、ブラウザ標準読み上げ、背景色と表示サイズの確認。
- `preview/*-contact-sheet.jpg`：比較用画像。これらはプレビュー用で、実装には各独立ファイルを使用します。
- `preview/asset-validation.json`：サイズ・透過・独立ファイルの検証結果。
- `preview/runtime-validation.json`：状態切替・口パク停止・瞬き・タイマー解放の処理テスト結果。

元の生成画像を共通の880×880pxに縮小し、1024pxキャンバスの(72,72)に配置しています。全状態で画像全体を同じサイズの領域に表示してください。状態ごとの透明部分に合わせて再トリミングすると位置が飛びます。キャンバス中心を共通基準とし、髪・顔・衣装の縮尺を固定しています。

## 状態と用途

| 状態 | ファイル | 用途 |
|---|---|---|
| idle | avatars/01_idle.webp | 通常・待機 |
| smile | avatars/02_smile.webp | 軽い会話・笑顔 |
| thinking | avatars/03_thinking.webp | Geminiの回答待ち・思考 |
| speaking | avatars/04_speaking.webp | 説明・回答・読み上げ |
| listening | avatars/05_listening.webp | 音声入力の聞き取り |
| analyzing | avatars/06_analyzing.webp | ファイル解析 |
| success | avatars/07_success.webp | 登録・解析の成功 |
| warning | avatars/08_warning.webp | 確認を求める・注意 |
| error | avatars/09_error.webp | API・解析エラー |
| local | avatars/10_local.webp | 端末内処理 |
| calendar | avatars/11_calendar.webp | 予定の確認・登録 |
| task | avatars/12_task.webp | タスクの登録・完了 |
| document | avatars/13_document.webp | PDF・図面・書類 |
| image | avatars/14_image.webp | 現場写真・画像解析 |
| voice | avatars/15_voice.webp | 音声会話・読み上げ |
| sleep | avatars/16_sleep.webp | 無操作時の軽い居眠り |
| greeting | avatars/17_greeting.webp | 起動直後の挨拶 |
| pointing | avatars/18_pointing.webp | 回答内の重要箇所を示す |
| serious | avatars/19_serious.webp | 期限・重要事項の説明 |
| celebrate | avatars/20_celebrate.webp | 大きな完了の祝福 |

顔アイコンの状態名は `idle / smile / thinking / speaking / listening / analyzing / success / warning / error / sleep`。`icons/icon_状態名.webp`をヘッダーやチャット履歴に使用します。

## 推奨表示サイズ

| 場所 | CSS表示幅 |
|---|---|
| 新規チャット・待機 | 240〜320px |
| 会話開始後のアバター | 96〜128px |
| 最新回答付近 | 64〜96px |
| ヘッダーの顔アイコン | 32〜48px |
| チャット履歴の顔アイコン | 32〜40px |

アバターのためにチャット本文の高さを固定・縮小せず、待機画面から会話画面へ移る際に表示幅を縮小します。顔アイコンは512pxのマスターをCSSで縮小できます。配信容量を優先するなら128/256px版を別途作成してください。

## プレビューを開く

ZIPを展開し、`preview/avatar-preview.html`をブラウザで開いてください。プレビューはJSONをfetchせず、同梱の`manifest-preview.js`を使用するため、通常はファイルから直接開けます。iOSのファイルプレビューはJavaScript実行に制限があるため、Webサーバー配信でSafariから確認してください。

PCではパックのフォルダで `python3 -m http.server 8080` を実行し、`http://localhost:8080/preview/avatar-preview.html` を開けます。開発時のローカル配信だけで動作し、AI APIキーは不要です。

## CSS / JavaScriptで切り替える

静止画だけなら `img.src` をmanifestのパスに変更します。初回切替前に読み込みを済ませるとちらつきを防げます。`object-fit:contain`と正方形の固定枠を使用してください。

```html
<link rel="stylesheet" href="/assets/kanrinext-avatar-pack/avatar.css">
<div id="assistant" style="width:96px"></div>
<script src="/assets/kanrinext-avatar-pack/avatar-runtime.js"></script>
```

```js
const baseUrl = '/assets/kanrinext-avatar-pack/';
const manifest = await fetch(baseUrl + 'avatar-manifest.json').then(r => {
  if (!r.ok) throw new Error('manifest読み込み失敗');
  return r.json();
});
const avatar = new KanriNextAvatar({
  root: document.getElementById('assistant'), manifest, baseUrl
});
await avatar.ready;
await avatar.setState('thinking');
// AI処理の完了後
await avatar.setState('speaking');
// ヘッダーは独立したアイコンを使う
headerIcon.src = baseUrl + manifest.icons.speaking;
```

状態は実際の処理イベントに結び付けます。例：音声認識開始→`listening`、外部推論開始→`thinking`、画像解析開始→`image`、予定登録開始→`calendar`、登録成功→`success`、登録失敗→`error`。処理種別はアプリ側が判断し、その判断のためにAI APIを呼びません。

サンプルは全アバターを先読みします。本体へ組み込む際、モバイル通信ではidle・speaking・listening・errorなど頻用素材を優先し、その他は必要時に読み込む方法も選べます。`setState`は先読み完了後に切り替え、短時間に複数の要求が来た場合は最後の要求を反映します。

## 口パク

`mouth_closed.png / mouth_half.png / mouth_open.png`を**元アバターの上に重ね、全レイヤーを同じ1024pxキャンバスとして縮小**します。口の見える部分だけを再トリミングして配置しないでください。

```js
await avatar.setState('speaking');
avatar.setSpeaking(true);  // 110〜200ms間隔で3段階を切替
avatar.setSpeaking(false); // 読み上げ終了・中断・失敗で必ず停止
```

ブラウザ標準読み上げでは、`SpeechSynthesisUtterance.onstart`で開始し、`onend / onerror`で停止します。再生済みの音声ファイルを使う場合は`audio.play / pause / ended`などに対応させます。上の方式は発話中らしく見せる簡易口パクで、音素に厳密に同期する方式ではありません。より精密にする場合は、アプリ内のAudioContextで音声の振幅を読み、振幅に応じてclosed/half/openを切り替えられます。新しいAPI通信は不要です。

## 瞬き

`eyes_open.png / eyes_half.png / eyes_closed.png`を同位置で重ねます。サンプルの順番は open→half(55ms)→closed(85ms)→half(55ms)→open。openではオーバーレイを隠し、元の目に戻します。通常は3〜6.5秒おきです。口と目は独立したレイヤーなので同時に動きます。

```js
avatar.blink();
```

顔パーツの対応状態はmanifestの`animation.compatibleStates`に記載しています。思考・エラー・居眠りなど顔に手が近い状態、専用表情を保ちたい状態には自動で重ねません。口パクはspeaking/voiceを推奨します。**顔アイコンには1024pxのアニメーションレイヤーをそのまま重ねないでください**。アイコンは独立した静止素材です。

## 組み込み時の注意

- このパックにはGemini接続処理や予定登録処理は含みません。既存処理の状態通知を`setState`に渡します。
- `baseUrl`は末尾に`/`を付けてください。manifestの各パスはパックのルートからの相対パスです。
- 呼吸は上下2px、思考は0.4度、成功・祝福は一回の軽い跳ね。`prefers-reduced-motion`ではCSS動作を停止します。
- 髪は本体と一体の画像です。髪だけの独立レイヤーは含みません。呼吸・傾きで控えめに動かし、不自然な変形を避けます。
- ページを隠した際はタイマーを止めます。画面を破棄する際は`avatar.dispose()`を呼んでイベントとタイマーを解放します。
- ボタン操作時の確認を視覚だけに依存せず、状態テキスト・aria-liveも併用してください。
- プレビューの読み上げはブラウザ/OSの機能です。アバター制御はネットワークを使いませんが、読み上げ音声の提供方式はブラウザやOSに依存します。
- 顔・衣装・色・縮尺は比較画像で目視確認し、全36素材の寸法と透過を機械検証しています。状態切替とアニメーション制御はNode.js上の簡易DOMによる処理テストを通過しています。
- **実ブラウザでのプレビュー動作確認は未完了です。** この実行環境にはローカルブラウザ実行ファイルがなく、確認用クラウドブラウザもローカルHTMLへのアクセスを拒否しました。実ブラウザの描画・ボタンクリック、読み上げ音声、iPhone Safariでの表示は確認済みとしていません。ZIPを展開してプレビューで確認できる構成にしています。

## 制作方法

内蔵画像生成で基準アバターを制作し、各差分をその基準画像から個別に編集しました。共通指示は「同じ顔・目・前髪・長いシアンのツインテール・黒/ピンクのヘッドデバイス・白/黒のジャケットとシアンのハーネスを維持し、顔と頭の位置・縮尺・カメラを固定、指定した表情と腕・小道具だけを変更、透過背景、文字なし」。目と口はそれぞれ該当部分のみを変更した生成画像から、同位置の透過パーツとして書き出しています。
