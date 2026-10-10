"""Loopback-only static demo server. No upload endpoint or remote model API."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from functools import partial
import mimetypes
mimetypes.add_type('application/javascript','.mjs')
mimetypes.add_type('application/wasm','.wasm')
root=Path(__file__).resolve().parent/'public'
handler=partial(SimpleHTTPRequestHandler,directory=str(root))
print('Outside in 20: http://127.0.0.1:8765 (loopback only)',flush=True)
ThreadingHTTPServer(('127.0.0.1',8765),handler).serve_forever()
