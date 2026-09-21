"""Apply reviewed source deltas only when all before/after hashes match.
One-use transfer to the explicitly authorized feature branch; removes itself afterward.
"""
import hashlib, json
from pathlib import Path
updates=[]
for item in json.loads(Path('tools/access-edits.json').read_text(encoding='utf-8')):
    path=Path(item['path'])
    assert path.is_relative_to('prototype'), str(path)
    before=path.read_bytes()
    assert hashlib.sha256(before).hexdigest()==item['before'], 'Changed base: '+str(path)
    lines=before.decode('utf-8').splitlines(keepends=True)
    for start,end,text in reversed(item['edits']):
        lines[start:end]=text.splitlines(keepends=True)
    after=''.join(lines).encode('utf-8')
    assert hashlib.sha256(after).hexdigest()==item['after'], 'Result mismatch: '+str(path)
    updates.append((path,after))
for path,after in updates:
    path.write_bytes(after)
    print('HASH VERIFIED',path)
Path('tools/access-edits.json').unlink()
Path(__file__).unlink()
