from pathlib import Path
import urllib.request, tarfile, io, json, hashlib
root=Path(__file__).resolve().parent/'public'
version='1.22.0-dev.20250409-89f8206ba4'
url=f'https://registry.npmjs.org/onnxruntime-web/-/onnxruntime-web-{version}.tgz'
with urllib.request.urlopen(url, timeout=90) as r: package=r.read()
manifest=json.loads((root/'assets-manifest.json').read_text())
with tarfile.open(fileobj=io.BytesIO(package), mode='r:gz') as archive:
    for member in archive.getmembers():
        if member.name.startswith('package/dist/') and (member.name.endswith('.wasm') or member.name.endswith('.mjs') and (member.name.endswith('ort.wasm.min.mjs') or member.name.endswith('ort.wasm.bundle.min.mjs') or 'ort-wasm-simd-threaded' in member.name)) or member.name=='package/LICENSE':
            relative='vendor/onnx/'+member.name.split('/')[-1]
            data=archive.extractfile(member).read()
            path=root/relative
            path.parent.mkdir(parents=True,exist_ok=True)
            path.write_bytes(data)
            manifest['assets']=[a for a in manifest['assets'] if a['path']!=relative]
            manifest['assets'].append({'path':relative,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'source':url})
            print(relative,len(data),flush=True)
manifest['onnxruntime_web_version']=version
(root/'assets-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
