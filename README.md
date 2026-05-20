# PNG to SVG Converter

A standalone PNG to SVG converter built with pure browser JavaScript. It runs fully client-side: image loading, pixel reading, color quantization, path generation, preview, copy, and download all happen in the browser.

## Use

Open `index.html` in a browser, then drop in a PNG or choose a file.

Controls:

- `Trace`: groups flat color regions into SVG paths for cleaner output.
- `Exact`: exports pixel-accurate horizontal runs for maximum fidelity.
- `Color`: limits the generated palette size.
- `Alpha cutoff`: ignores pixels below the selected opacity.
- `Resolution`: controls the raster size used for tracing.
- `Simplify`: smooths traced paths by removing detail.
- `Matte`: composites transparent pixels against transparent, white, or black output.

## Files

- `index.html`: static app shell.
- `styles.css`: responsive interface styling.
- `app.js`: pure JavaScript PNG raster processing and SVG export.

No build step or server is required.
