# Contributing

Thanks for helping improve Bulk Images to SVG.

## What To Contribute

Useful contributions include:

- Conversion accuracy improvements.
- SVG output size optimizations.
- Browser compatibility fixes.
- Accessibility and responsive layout improvements.
- Clear bug reports with sample images and conversion settings.

## Development

This is a static frontend project. You can run it by opening `index.html` in a
browser, or by serving the repository folder with any local static server.

Before submitting changes, please check:

- The app loads without console errors.
- Image upload still supports PNG, JPG, JPEG, GIF, WebP, and AVIF.
- SVG download, Copy SVG, and Download All SVGs still work.
- Preview zoom and responsive layouts still behave correctly.

For JavaScript changes, run:

```bash
node --check app.js
```

## Pull Requests

When opening a pull request:

- Describe the user-facing change.
- Mention any sample images used for testing.
- Include screenshots or before/after file sizes when relevant.
- Keep unrelated refactors out of the same pull request.
