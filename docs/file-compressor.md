# ファイル圧縮

ツール一覧の「ファイル圧縮」。画像・動画・PDF・Excelを複数選択し、順に端末内で処理する。
元ファイルは変更せず、個別保存・一括ZIP保存・停止に対応。
ファイル内容のアップロードやAIへの送信は行わない。

## 画質と内容

既定は見た目優先・高品質。JPEG/WebPはquality=0.95、動画はH.264 CRF18。
バランスは0.90/CRF22、サイズ優先は0.82/CRF26。
解像度を下げない。動画の音声と他トラックは再圧縮せずコピー。
JPEG/WebPの再保存ではEXIF・位置情報・ICC等のメタデータは保持しない。
PNGはIDATのzlib圧縮だけを詰め直し、画素・透過・他チャンクを保持する。
印刷・色校正の原本には元ファイルを使用する。
送付サイズの目安は結果の超過判定であり、画質を落として強制的に目標以下にはしない。

画質・内容を変えないモードでは、画像・動画などは原本をZIPで包む。
PDF・Excelは画像を再圧縮せず、構造のみ圧縮。
いずれも小さくならなければ元ファイルを採用。

## 対応範囲

- JPEG、PNG、WebP: 同形式で再保存。PNGは透過と画素を維持。
- GIF、アニメーションPNG/WebP、SVG、HEIC/HEIF: 元ファイルを保持。
- MP4、MOV、M4V: 単一スレッドFFmpegで先頭映像トラックだけ再圧縮。
  解像度・フレームレートを維持。全トラックをmapし、音声・他トラックはcopy。
  HDR（BT.2020/PQ/HLG）は再圧縮しない。コーデックの非対応・タイムアウト時は原本を保持。
- PDF: オブジェクトストリームで再保存。8bit DeviceRGBのDCTDecode JPEGのみ再圧縮。
  マスク・Decode・OC付き画像は変更しない。文字・図形・ページ・フォームをラスタライズしない。
  署名（ByteRange）・暗号化ファイルは変更しない。
- XLSX/XLSM: ZIP内部を展開してDEFLATE9で再圧縮。
  見た目優先ではxl/media内のJPEG/PNGのみ処理。
  その他のXML・数式・書式・VBA・リンク・内部ファイルはバイト単位で保持。
  _xmlsignatures・vbaProjectSignature付きは変更しない。旧XLS・パスワード付きは原本を保持。

## メモリ・オフライン

最大20件・合計250 MiB。文書/画像は各50 MiB、動画は各100 MiB。
展開後Excelは200 MiB/10000エントリー、画像は2400万画素まで。
動画エンジン約31 MBは動画処理の初回だけCDNから取得し、CacheStorageへ保存。
GitHub PagesでSharedArrayBuffer/COOP/COEPを必要としない単一スレッド版を使用。
動画処理後はWASMメモリを解放する。10分で処理が終わらなければ原本を保持。
処理済み結果はブラウザのメモリ内のみ。画面を離れる前に保存する。
実機の利用可能メモリによってはこれらの上限内でも処理できない場合がある。

## 依存ライブラリ

pako 2.1.0 (MIT)、JSZip 3.10.1 (MITを選択)、pdf-lib 1.17.1 (MIT)、@ffmpeg/ffmpeg 0.12.15 (MIT)。
同梱のライセンスはassets/vendor/compression内。
@ffmpeg/core 0.12.10 (GPL-2.0-or-later)は次のURLからブラウザが直接取得する。
https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js
https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm
ソース/ビルド情報: https://github.com/ffmpegwasm/ffmpeg.wasm

## 検証

scripts/test-compression.cjs: 実ブラウザでJPEG・透過PNG・PDF・XLSX/XLSM・MP4を圧縮。
署名ファイルの原本保持、停止、選択・一括ZIP保存、スマホ幅を確認。
PDF文字/フォーム、Excel数式/書式/VBA、画像画素/透過、動画寸法/フレーム/音声は
生成結果を外部のPDF/Excel/映像解析ツールでも照合する。
iPhone実機の動画処理は未検証。

再実行例（テスト用の生成ファイルだけを使用）:

```sh
python scripts/verify-compression.py --prepare
# /tmp/compression-testへ上記のffmpeg-core.js/.wasmを取得
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" TEST_CHROMIUM_PATH=/path/to/chromium node scripts/test-compression.cjs
python scripts/verify-compression.py
```
