from pathlib import Path
import urllib.request
url='https://raw.githubusercontent.com/microsoft/onnxruntime/v1.22.0/LICENSE'
with urllib.request.urlopen(url,timeout=30) as response:data=response.read()
if b'MIT License' not in data or b'Microsoft' not in data:raise ValueError('Unexpected license')
path=Path(__file__).resolve().parent/'public/vendor/onnx/LICENSE'
path.write_bytes(data)
print('ONNX_MIT_LICENSE_SAVED',len(data))
