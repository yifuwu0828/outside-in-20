# Outside in 20

A small browser-local outdoor activity chooser. Describe an English-language preference, set your available time and equipment, and take one short card away from the screen.

Created October 10, 2026 for the DEV Hacktoberfest Week 1 **Touch Grass** theme. The public repository and free hosted demo are live. The DEV contest article is saved as an unpublished draft; no prize or commission has been awarded.

[Live demo](https://yifuwu0828.github.io/outside-in-20/) · [Run validation](https://yifuwu0828.github.io/outside-in-20/validation.html) · [Source repository](https://github.com/yifuwu0828/outside-in-20)

## Run

Python 3.10 or newer, no Python packages required:

```sh
python serve.py
```

Open **http://127.0.0.1:8765/**. The server binds only to loopback. Use a modern Chromium browser with WebAssembly SIMD and ES module import maps. The measured run used Chromium 155 on Windows; other browsers and devices have not been validated.

The supplied `public/` contains the model and runtime. If you obtained source without these assets, run `python download_assets.py` followed by `python download_onnx.py` while connected to the internet. These scripts fetch only public model/runtime files, without accounts or API keys. They download data; they do not run model repository code. Check `public/assets-manifest.json` for recorded SHA-256 hashes. The model download is pinned to the tested revision below. Preserve the included manifest when reproducing this build.

For free static hosting, deploy **the contents of `public/`**, preserving paths. HTTPS or localhost is required for the optional service worker. There is no backend, API key, paid model API, telemetry, GPS or account. Do not put unrelated workspace files or private session transcripts into a public repository.

An optional GitHub Pages workflow is prepared at `.github/workflows/pages.yml`, using the actions versions in the [current official Pages instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). It publishes only `public/`. The [first public deployment](https://github.com/yifuwu0828/outside-in-20/actions/runs/38042224250) succeeded on October 10, 2026. Settings → Pages uses GitHub Actions. The public demo performed real inference and passed all twelve semantic fixtures plus 192 filter combinations with zero violations. That validation used warmed browser assets; it is not a first-download speed benchmark. `DEV_POST_DRAFT.md` now includes the verified links. Publishing the contest entry remains subject to the entrant's confirmation of the contest terms and accurate article disclosure.

## Open model at the core

- Model: `Xenova/all-MiniLM-L6-v2` ONNX export of `sentence-transformers/all-MiniLM-L6-v2` (Apache-2.0).
- Tested model revision: `751bff37182d3f1213fa05d7196b954e230abad9`.
- Transformers.js **3.8.1** (Apache-2.0).
- ONNX Runtime Web **1.22.0-dev.20250409-89f8206ba4** (MIT), matching the runtime dependency.
- Quantized `q8`, single-thread WebAssembly CPU inference; no WebGPU dependency.
- Mean-pool token embeddings, L2 normalize, then dot product = cosine similarity.

The model encodes 12 original activity descriptions once and encodes each query on demand. Explicit time, movement and equipment filters run before ranking. This lets paraphrases such as “a feathered visitor” retrieve bird watching, while a five-minute seated filter prevents a twenty-minute walking card from appearing. No model-generated instructions are displayed: the output cards are reviewed, fixed text.

The two import-map aliases use the same bundled ONNX module so Tensor/session classes share an identity. All runtime, WASM and model files are hosted on the same origin. `env.allowRemoteModels=false`; Content Security Policy restricts connections to that origin. The preference is only passed to the in-browser model and is never included in a request URL or request body.

## Actual validation

Open `/validation.html`, click **Run validation**, and download its JSON report.

- Twelve predefined paraphrase fixtures: **12/12 expected top-1**, 12/12 top-3.
- Real model output: twelve finite **384-dimensional** vectors; query vectors independently checked.
- **192** time/movement/equipment combinations: zero constraint violations; actual contradictory query also respected a five-minute seated/no-equipment filter.
- No eligible cards → `empty`; empty, numeric-only and overlong text → `invalid`.
- Unrelated SQL repair request and invented-word sentence → `uncertain` at the fixed 0.28 retrieval threshold.
- First successful model initialization: **482 ms**, complete fixture run **612 ms** on this machine using local assets. This is not a fresh remote website download benchmark; library requests had already occurred while repairing an import.
- Cached reload, with the loopback server stopped: **352 ms** initialization and **475 ms** full fixture run, 12/12 expected top-1, zero external asset requests. A separate socket probe returned connection-refused code 10061. This demonstrates the warmed cache in this browser, not guaranteed offline operation in every browser.

Reports are in `evidence/` in the release package. The fixture set is small and authored for this catalogue. It is not an unbiased accuracy estimate or proof of reliable intent understanding. No physical outdoor use or human trial has been performed.

## Offline behavior

The app pre-caches its static files, model and WASM. Wait until the privacy panel says **Offline pack ready**. A fresh user still needs to download approximately 37 MB of core assets. Cache availability depends on browser storage; clearing site data or eviction removes it. A service worker is an optional enhancement, not a condition for online/local-server inference. Change the cache version in `sw.js` whenever publishing modified cached files. Earlier version caches are not automatically deleted.

## Limits

- English preference retrieval; not a general conversational assistant.
- Similarity scores are not probabilities. The uncertainty threshold is a heuristic and can miss out-of-domain or negated requests.
- Twelve generic activities, no map, live weather, routes, health prescriptions or location-specific knowledge.
- “Seated only” describes the activity posture. It is not a wheelchair-accessible venue audit.
- Activity times are approximate. Choose an appropriate place and decide whether the activity suits your circumstances.
- “Take one card” opens a standalone card; the print/save button uses your browser's normal print dialog. No printing was sent to a physical device during development.

## Files

- `public/catalog.js` — original cards and hard eligibility rules.
- `public/engine.js` — real open-model loading and ranking.
- `public/app.js`, `index.html`, `style.css` — interface.
- `public/card.*` — a standalone printable card.
- `public/validation.*` — reproducible synthetic checks and original expectations.
- `public/sw.js` — optional offline asset cache.
- `download_*.py` — public asset preparation; `serve.py` — local preview.

Original code/cards/design: MIT. Third-party components retain their own licenses; see `THIRD_PARTY.md`. No partner prize category is claimed merely for including an unrelated logo or dependency.
