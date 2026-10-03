'use strict';
/* 廃止（2026-10-03）: 以前は window.fetch を書き換えて X-App-Key を後付けしていたが、
 * X-App-Key は assistant.js の postAi() で明示的に付与する方式へ一本化した。
 * 古いキャッシュの ics.js がこのファイルを読み込んでも何もしないよう、空のまま残している。 */
