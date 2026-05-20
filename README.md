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
- `Number precision`: rounds SVG path coordinates from `1` to `8` decimal places. `1` is compact and usually visually stable for icons; higher values preserve more subpixel detail and increase SVG size.
- `Matte`: composites transparent pixels against transparent, white, or black output.

For compact icon-like PNGs, start with `Trace`, `Precision 4x` or `10x`, and `Simplify 2-3`. Monochrome transparent PNGs are detected automatically and traced as a single curved compound path when possible, which keeps files small and avoids pixel stair-steps.

For the closest visual match, use `Exact`. Exact mode preserves per-pixel RGB and opacity instead of reducing the image to the selected palette, but it can produce larger SVGs when many semi-transparent edge pixels are kept. Raise `Alpha cutoff` to reduce file size.

The generated SVG is minified automatically with compact markup, shortened colors, compact numbers, and relative path commands. For additional build-time optimization outside the app, SVGO is the standard Node.js optimizer.

## Files

- `index.html`: static app shell.
- `styles.css`: responsive interface styling.
- `app.js`: pure JavaScript PNG raster processing and SVG export.

No build step or server is required.
