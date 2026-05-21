# Bulk Image to SVG

Bulk Image to SVG is a standalone browser converter for turning PNG, JPG, JPEG, GIF, WebP, and AVIF files into optimized SVG vectors. It is built with pure JavaScript and runs fully client-side: image loading, pixel reading, color quantization, path generation, preview, copy, and download all happen in the browser.

GitHub description:

`Browser-based Bulk Image to SVG converter for PNG, JPG, JPEG, GIF, WebP, and AVIF files with client-side conversion and SVG optimization.`

## Use

Open `index.html` in a browser, then drop in a PNG, JPG, JPEG, GIF, WebP, or AVIF file.

Controls:

- `Trace`: groups flat color regions into SVG paths for cleaner output.
- `Exact`: exports pixel-accurate horizontal runs for maximum fidelity.
- `Color`: limits the generated palette size in Trace mode.
- `Alpha cutoff`: ignores pixels below the selected opacity.
- `Resolution`: controls the raster size used for tracing.
- `Precision`: supersamples the source before conversion. `10x` analyzes 100 times more pixels than the base raster and reduces visible stair-stepping, at the cost of larger SVG files.
- `Simplify`: smooths traced paths by removing detail and lightly rounding traced contours.
- `Seam fix`: adds a small same-color overlap to Trace paths to hide light gaps between adjacent colored regions.
- `Number precision`: rounds SVG path coordinates from `1` to `8` decimal places. `1` is compact and usually visually stable for icons; higher values preserve more subpixel detail and increase SVG size.
- `Matte`: composites transparent pixels against transparent, white, or black output.

For compact icon-like images, start with `Trace`, `Precision 4x` or `10x`, and `Simplify 2-3`. Monochrome transparent images are detected automatically and traced as a single curved compound path when possible, which keeps files small and avoids pixel stair-steps.

Animated GIFs are converted from the browser-rendered image frame, so the exported SVG is static.

For the closest visual match, use `Exact`. Exact mode preserves per-pixel RGB and opacity instead of reducing the image to the selected palette, but it can produce larger SVGs when many semi-transparent edge pixels are kept. Raise `Alpha cutoff` to reduce file size.

The generated SVG is minified automatically with compact markup, shortened colors, compact numbers, and relative path commands. For additional build-time optimization outside the app, SVGO is the standard Node.js optimizer.

## Files

- `index.html`: static app shell.
- `styles.css`: responsive interface styling.
- `app.js`: pure JavaScript raster image processing and SVG export.

No build step or server is required.
