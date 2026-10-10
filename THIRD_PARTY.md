# Third-party notices

The project's MIT license applies to its original source, written cards and design. It does not relicense model weights or vendored libraries.

- **Hugging Face Transformers.js 3.8.1**: Apache-2.0. Included license: `public/vendor/LICENSE`. [Official repository](https://github.com/huggingface/transformers.js).
- **Xenova/all-MiniLM-L6-v2**: Apache-2.0, according to its included model card. ONNX export of **sentence-transformers/all-MiniLM-L6-v2**. [Export model card](https://huggingface.co/Xenova/all-MiniLM-L6-v2), [original model card](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2). Full Apache-2.0 license text is retained at `public/vendor/LICENSE`; model-specific provenance is in its model README and `assets-manifest.json`.
- **Microsoft ONNX Runtime Web 1.22.0-dev.20250409-89f8206ba4**: MIT. Copyright Microsoft Corporation. License text is retained at `public/vendor/onnx/LICENSE`; distributed module files also preserve original headers. [Official repository](https://github.com/microsoft/onnxruntime).

Exact downloaded asset URLs, sizes and SHA-256 hashes are in `public/assets-manifest.json`. Runtime artifacts are sourced from the official npm registry; model data is sourced from the versioned Hugging Face repository. No third-party service receives preference text.
