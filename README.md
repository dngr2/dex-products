# DEX fleet — static site

Dependency-free static bundle. Landing at `index.html`; one dir per product at
`<product>/index.html`. No build step, no framework, no server — drop it on any host.

Preview from a cold checkout — the repo ROOT *is* the bundle (there is no nested site/):

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

Every address on the landing is copied from a record file (never retyped).
