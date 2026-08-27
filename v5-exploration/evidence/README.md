# Design evidence

- `concept-a/` through `concept-f/`: first-round evidence.
- `finalist-1/`: refined System Brief evidence.
- `finalist-2/`: refined Architecture Dossiers evidence.
- `finalist-3/`: refined Assurance Loop evidence.
- `render-audit.json`: real Chrome measurements for six concepts × two themes × two viewports.

Finalist PNGs are reproducible with:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File v5-exploration/scripts/render-evidence.ps1
```

These are design-decision artifacts only. They are not production profile assets and are not referenced by the repository root README.
