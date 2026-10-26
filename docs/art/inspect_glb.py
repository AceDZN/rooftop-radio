"""Inspect an acquired GLB without browser state or network access."""
from pathlib import Path
import hashlib
import json
import struct
import sys

for name in sys.argv[1:]:
    path = Path(name)
    data = path.read_bytes()
    magic, version, declared = struct.unpack_from('<4sII', data)
    if magic != b'glTF':
        raise ValueError(f'{path}: not a GLB')
    offset = 12
    document = None
    while offset < len(data):
        size, kind = struct.unpack_from('<II', data, offset)
        offset += 8
        chunk = data[offset:offset + size]
        offset += size
        if kind == 0x4E4F534A:
            document = json.loads(chunk)
    if document is None:
        raise ValueError(f'{path}: no JSON chunk')
    accessors = document.get('accessors', [])
    animations = []
    for animation in document.get('animations', []):
        seconds = 0
        for sampler in animation.get('samplers', []):
            a = accessors[sampler['input']]
            if a.get('max'):
                seconds = max(seconds, a['max'][0])
        animations.append({'name': animation.get('name', '(unnamed)'), 'channels': len(animation.get('channels', [])), 'duration_seconds': seconds})
    print(json.dumps({
        'path': str(path), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
        'version': version, 'valid_declared_length': declared == len(data),
        'meshes': len(document.get('meshes', [])),
        'skins': [{'name': s.get('name', '(unnamed)'), 'joints': len(s.get('joints', []))} for s in document.get('skins', [])],
        'animations': animations,
        'materials': len(document.get('materials', [])),
        'images': len(document.get('images', [])),
        'extensions': document.get('extensionsUsed', []),
        'generator': document.get('asset', {}).get('generator')
    }, indent=2))
