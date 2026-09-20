"""Recover the exact hash-verified source edits staged in the prior session.
Feature-branch only. Already materialized files are left unchanged on reruns.
"""
import hashlib
import json
from pathlib import Path
spec = json.loads(Path('tools/floorplan-stage.json').read_text(encoding='utf-8'))
updates = []
for item in spec['files']:
    path = Path(item['path'])
    assert path.is_relative_to('prototype/src'), 'Unexpected patch target'
    before = path.read_bytes()
    digest = hashlib.sha256(before).hexdigest()
    if digest == item['after']:
        continue
    assert digest == item['before'], f'Base changed: {path}'
    lines = before.decode('utf-8').splitlines(keepends=True)
    for start, end, replacement in reversed(item['edits']):
        lines[start:end] = replacement.splitlines(keepends=True)
    after = ''.join(lines).encode('utf-8')
    assert hashlib.sha256(after).hexdigest() == item['after'], f'Result mismatch: {path}'
    updates.append((path, after))
for path, after in updates:
    path.write_bytes(after)
    print('HASH-VERIFIED', path)
