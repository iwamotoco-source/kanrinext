#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
BUILD_DIR=$(mktemp -d)
trap 'rm -rf "$BUILD_DIR"' EXIT
npm install --prefix "$BUILD_DIR" --no-audit --no-fund piper-plus@0.7.0 @piper-plus/g2p@0.4.2 onnxruntime-web@1.24.3 esbuild@0.25.12
NODE_PATH="$BUILD_DIR/node_modules" "$BUILD_DIR/node_modules/.bin/esbuild" workers/piper-tts-source.mjs --bundle --format=esm --minify '--external:../assets/vendor/piper-plus/*' --outfile=workers/piper-tts-worker.mjs
cp "$BUILD_DIR/node_modules/piper-plus/dist/rust-wasm/piper_plus_wasm.js" assets/vendor/piper-plus/phonemizer.mjs
cp "$BUILD_DIR/node_modules/onnxruntime-web/dist/ort.wasm.min.mjs" assets/vendor/piper-plus/
cp "$BUILD_DIR/node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs" assets/vendor/piper-plus/
cp "$BUILD_DIR/node_modules/piper-plus/LICENSE.md" assets/vendor/piper-plus/LICENSE-piper.md
cp "$BUILD_DIR/node_modules/piper-plus/THIRD-PARTY-LICENSES.md" assets/vendor/piper-plus/
cp "$BUILD_DIR/node_modules/@piper-plus/g2p/LICENSE.md" assets/vendor/piper-plus/LICENSE-g2p.md
