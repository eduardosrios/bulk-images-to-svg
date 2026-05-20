# PNG to SVG Converter

A standalone PNG to SVG converter built with pure browser JavaScript. It runs fully client-side: image loading, pixel reading, color quantization, path generation, preview, copy, and download all happen in the browser.

## Use

Open `index.html` in a browser, then drop in a PNG or choose a file.

Controls:

- `Trace`: groups flat color regions into SVG paths for cleaner output.
- `Exact`: exports pixel-accurate horizontal runs for maximum fidelity.
- `Color`: limits the generated palette size in Trace mode.
- `Alpha cutoff`: ignores pixels below the selected opacity.
- `Resolution`: controls the raster size used for tracing.
- `Precision`: supersamples the source before conversion. `10x` analyzes 100 times more pixels than the base raster and reduces visible stair-stepping, at the cost of larger SVG files.
- `Simplify`: smooths traced paths by removing detail and lightly rounding traced contours.
- `Matte`: composites transparent pixels against transparent, white, or black output.

For the closest visual match, use `Exact` with a high `Precision` value. Exact mode preserves per-pixel RGB and opacity instead of reducing the image to the selected palette. For cleaner vector shapes, use `Trace` with `Simplify` above `0`.

## Files

- `index.html`: static app shell.
- `styles.css`: responsive interface styling.
- `app.js`: pure JavaScript PNG raster processing and SVG export.

No build step or server is required.
