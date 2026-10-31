# IG MASK

IG MASK is a browser-based public Instagram profile clue finder for ZYVORA.

## Features

- Upload an image locally
- OCR visible text in the browser
- Detect visible `@usernames` and hashtags
- Generate direct public Instagram profile links for detected usernames
- Generate web verification searches for other public clues
- Responsive mobile/desktop UI
- No server or database required
- No face recognition and no private-account discovery

## Local setup

No build step is required. Serve the folder with any static web server:

```bash
python -m http.server 8080
```

Open `http://127.0.0.1:8080` in your browser.

The OCR library is loaded from jsDelivr, so the first scan requires internet access. The uploaded image is passed to the browser OCR runtime rather than an IG MASK server.

## GitHub Pages

Enable GitHub Pages for the repository's `main` branch and root directory. The site is a static app and can be hosted directly.

## Scope

IG MASK searches public clues that are visibly present in the image. It does not infer a person's identity from their face or attempt to discover private accounts.
