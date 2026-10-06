"""Build only files needed by the static PWA, never sync/backups/server files."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / '_public_site'
if DEST.exists():
    shutil.rmtree(DEST)
DEST.mkdir()
for name in ('index.html', 'manifest.json', 'service-worker.js', '.nojekyll'):
    shutil.copy2(ROOT / name, DEST / name)
for name in ('assets', 'icons', 'tools', 'workers'):
    shutil.copytree(ROOT / name, DEST / name)
(DEST / 'data').mkdir()
for name in ('electrical-laws.json', 'electrical-knowledge.json'):
    shutil.copy2(ROOT / 'data' / name, DEST / 'data' / name)
assert not (DEST / 'data/kouji-next.json').exists()
assert not (DEST / 'api').exists()
print('Static site built; sync data, backups and backend sources excluded.')
