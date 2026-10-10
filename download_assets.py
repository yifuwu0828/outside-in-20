"""Fetch only public, version-pinned browser runtime and model assets."""
from pathlib import Path
import urllib.request, json, tarfile, io, hashlib

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / 'public'
PUBLIC.mkdir(exist_ok=True)
def get(url):
    with urllib.request.urlopen(url, timeout=90) as response:
        return response.read()
revision = '751bff37182d3f1213fa05d7196b954e230abad9'
assets = []
def save(relative, data, source):
    path = PUBLIC / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    assets.append({'path':relative, 'bytes':len(data), 'sha256':hashlib.sha256(data).hexdigest(), 'source':source})
    print(relative, len(data), flush=True)
package_url = 'https://registry.npmjs.org/@huggingface/transformers/-/transformers-3.8.1.tgz'
with tarfile.open(fileobj=io.BytesIO(get(package_url)), mode='r:gz') as archive:
    for name in ['package/dist/transformers.web.js','package/LICENSE','package/package.json']:
        output = 'vendor/' + name.split('/')[-1]
        save(output, archive.extractfile(name).read(), package_url)
for name in ['config.json','tokenizer.json','tokenizer_config.json','special_tokens_map.json','onnx/model_quantized.onnx','README.md']:
    url = f'https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/{revision}/{name}'
    save('models/Xenova/all-MiniLM-L6-v2/' + name, get(url), url)
manifest = {'model_id':'Xenova/all-MiniLM-L6-v2','model_revision':revision,'runtime_version':'3.8.1','assets':assets}
(PUBLIC / 'assets-manifest.json').write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf-8')
print('PUBLIC_ASSETS_READY', revision)
