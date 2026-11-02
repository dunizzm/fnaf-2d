from pathlib import Path
import shutil

root = Path(__file__).resolve().parent.parent
web = root / 'ios' / 'WebGame'
if web.exists():
    shutil.rmtree(web)
shutil.copytree(root / 'dist', web)
notices = web / 'licenses'
notices.mkdir()
for name in ['LICENSE', 'THIRD_PARTY_NOTICES.md', 'CONTRIBUTORS.md']:
    shutil.copy2(root / name, notices / name)
print('Prepared offline iOS game resources.')
