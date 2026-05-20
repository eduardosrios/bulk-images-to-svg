(function () {
  "use strict";

  const els = {
    fileInput: document.getElementById("fileInput"),
    dropZone: document.getElementById("dropZone"),
    fileName: document.getElementById("fileName"),
    sampleButton: document.getElementById("sampleButton"),
    downloadButton: document.getElementById("downloadButton"),
    copyButton: document.getElementById("copyButton"),
    originalCanvas: document.getElementById("originalCanvas"),
    svgPreview: document.getElementById("svgPreview"),
    statusText: document.getElementById("statusText"),
    sourceStat: document.getElementById("sourceStat"),
    traceStat: document.getElementById("traceStat"),
    sizeStat: document.getElementById("sizeStat"),
    colorCount: document.getElementById("colorCount"),
    swatches: document.getElementById("swatches"),
    originalBadge: document.getElementById("originalBadge"),
    outputBadge: document.getElementById("outputBadge"),
    paletteSize: document.getElementById("paletteSize"),
    paletteValue: document.getElementById("paletteValue"),
    alphaThreshold: document.getElementById("alphaThreshold"),
    alphaValue: document.getElementById("alphaValue"),
    maxDimension: document.getElementById("maxDimension"),
    resolutionValue: document.getElementById("resolutionValue"),
    precision: document.getElementById("precision"),
    precisionValue: document.getElementById("precisionValue"),
    simplify: document.getElementById("simplify"),
    simplifyValue: document.getElementById("simplifyValue"),
    matte: document.getElementById("matte")
  };

  const MAX_PROCESSING_DIMENSION = 6144;
  const MAX_EXACT_SWATCHES = 256;

  const state = {
    image: null,
    sourceName: "image",
    sourceWidth: 0,
    sourceHeight: 0,
    svg: "",
    palette: [],
    processing: false,
    pendingTimer: 0
  };

  const EMPTY_PREVIEW_CLASS = "is-empty";
  els.svgPreview.classList.add(EMPTY_PREVIEW_CLASS);

  bindEvents();
  syncControlLabels();

  function bindEvents() {
    els.fileInput.addEventListener("change", function () {
      const file = els.fileInput.files && els.fileInput.files[0];
      if (file) loadFile(file);
    });

    ["dragenter", "dragover"].forEach(function (name) {
      els.dropZone.addEventListener(name, function (event) {
        event.preventDefault();
        els.dropZone.classList.add("is-over");
      });
    });

    ["dragleave", "drop"].forEach(function (name) {
      els.dropZone.addEventListener(name, function (event) {
        event.preventDefault();
        els.dropZone.classList.remove("is-over");
      });
    });

    els.dropZone.addEventListener("drop", function (event) {
      const file = event.dataTransfer.files && event.dataTransfer.files[0];
      if (file) loadFile(file);
    });

    document.querySelectorAll("input[name='mode']").forEach(function (input) {
      input.addEventListener("change", queueProcess);
    });

    [els.paletteSize, els.alphaThreshold, els.maxDimension, els.precision, els.simplify, els.matte].forEach(function (control) {
      control.addEventListener("input", function () {
        syncControlLabels();
        queueProcess();
      });
      control.addEventListener("change", function () {
        syncControlLabels();
        queueProcess();
      });
    });

    els.sampleButton.addEventListener("click", loadSample);
    els.downloadButton.addEventListener("click", downloadSvg);
    els.copyButton.addEventListener("click", copySvg);
  }

  function syncControlLabels() {
    els.paletteValue.textContent = els.paletteSize.value;
    els.alphaValue.textContent = els.alphaThreshold.value;
    els.resolutionValue.textContent = els.maxDimension.value;
    els.precisionValue.textContent = `${els.precision.value}x`;
    els.simplifyValue.textContent = Number(els.simplify.value).toFixed(1);
  }

  function setStatus(message) {
    els.statusText.textContent = message;
  }

  function loadFile(file) {
    if (!file.type.startsWith("image/")) {
      setStatus("That file is not an image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function () {
      loadImage(String(reader.result), file.name);
    };
    reader.onerror = function () {
      setStatus("The image could not be read.");
    };
    setStatus("Reading image...");
    reader.readAsDataURL(file);
  }

  function loadImage(src, name) {
    const image = new Image();
    image.onload = function () {
      state.image = image;
      state.sourceName = name || "image";
      state.sourceWidth = image.naturalWidth || image.width;
      state.sourceHeight = image.naturalHeight || image.height;
      els.fileName.textContent = state.sourceName;
      els.sourceStat.textContent = `${state.sourceWidth} x ${state.sourceHeight}`;
      els.originalBadge.textContent = "Loaded";
      renderOriginalPreview(image);
      queueProcess(0);
    };
    image.onerror = function () {
      setStatus("The image could not be decoded.");
    };
    image.src = src;
  }

  function renderOriginalPreview(image) {
    const maxPreview = 1200;
    const scale = Math.min(1, maxPreview / Math.max(state.sourceWidth, state.sourceHeight));
    const width = Math.max(1, Math.round(state.sourceWidth * scale));
    const height = Math.max(1, Math.round(state.sourceHeight * scale));
    const canvas = els.originalCanvas;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: false });
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    canvas.classList.add("has-image");
  }

  function queueProcess(delay) {
    window.clearTimeout(state.pendingTimer);
    if (!state.image) return;
    state.pendingTimer = window.setTimeout(processCurrentImage, typeof delay === "number" ? delay : 160);
  }

  function readOptions() {
    const modeInput = document.querySelector("input[name='mode']:checked");
    return {
      mode: modeInput ? modeInput.value : "trace",
      paletteSize: Number(els.paletteSize.value),
      alphaThreshold: Number(els.alphaThreshold.value),
      maxDimension: Number(els.maxDimension.value),
      precision: Number(els.precision.value),
      simplify: Number(els.simplify.value),
      matte: els.matte.value
    };
  }

  function processCurrentImage() {
    if (!state.image || state.processing) return;

    state.processing = true;
    setStatus("Tracing image...");
    els.outputBadge.textContent = "Working";
    els.downloadButton.disabled = true;
    els.copyButton.disabled = true;

    window.requestAnimationFrame(function () {
      try {
        const options = readOptions();
        const raster = rasterizeForProcessing(state.image, options);
        const result = options.mode === "runs"
          ? buildExactResult(raster.imageData.data, raster.width, raster.height, options)
          : buildTraceResult(raster.imageData.data, raster.width, raster.height, options);
        const svg = buildSvg({
          width: raster.width,
          height: raster.height,
          sourceWidth: state.sourceWidth,
          sourceHeight: state.sourceHeight,
          sourceName: state.sourceName,
          paths: result.paths,
          options
        });

        state.svg = svg;
        state.palette = result.palette;
        renderSvgPreview(svg);
        renderPalette(result.palette);

        const bytes = new Blob([svg]).size;
        els.traceStat.textContent = raster.wasCapped
          ? `${raster.width} x ${raster.height} capped`
          : `${raster.width} x ${raster.height}`;
        els.sizeStat.textContent = formatBytes(bytes);
        els.colorCount.textContent = String(result.palette.length);
        els.outputBadge.textContent = result.activePixels ? "Ready" : "Empty";
        els.downloadButton.disabled = !svg;
        els.copyButton.disabled = !svg;
        setStatus(result.activePixels ? precisionStatus(raster, result, options) : "No visible pixels were found.");
      } catch (error) {
        console.error(error);
        setStatus(error && error.message ? error.message : "Conversion failed.");
        els.outputBadge.textContent = "Error";
      } finally {
        state.processing = false;
      }
    });
  }

  function rasterizeForProcessing(image, options) {
    const sourceMax = Math.max(state.sourceWidth, state.sourceHeight);
    const baseDimension = Math.min(sourceMax, options.maxDimension);
    const requestedDimension = Math.max(1, Math.round(baseDimension * options.precision));
    const cappedDimension = Math.min(requestedDimension, MAX_PROCESSING_DIMENSION);
    const scale = cappedDimension / sourceMax;
    const width = Math.max(1, Math.round(state.sourceWidth * scale));
    const height = Math.max(1, Math.round(state.sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.imageSmoothingEnabled = scale !== 1;
    context.imageSmoothingQuality = "high";
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return {
      width,
      height,
      imageData: context.getImageData(0, 0, width, height),
      wasCapped: cappedDimension < requestedDimension
    };
  }

  function buildTraceResult(data, width, height, options) {
    const quantized = quantizeImage(data, width, height, options);
    const paths = [];

    for (let colorIndex = 0; colorIndex < quantized.palette.length; colorIndex += 1) {
      const color = quantized.palette[colorIndex];
      const d = buildTracePath(quantized.indexMap, width, height, colorIndex, options.simplify);
      if (!d) continue;
      const opacity = color.opacity < 0.995 ? ` fill-opacity="${trimNumber(color.opacity)}"` : "";
      paths.push(`  <path fill="${color.hex}"${opacity} fill-rule="evenodd" d="${d}"/>`);
    }

    return {
      paths,
      palette: quantized.palette,
      activePixels: quantized.activePixels
    };
  }

  function buildExactResult(data, width, height, options) {
    const styles = new Map();
    const styleOrder = [];
    const counts = new Map();
    const scratch = { r: 0, g: 0, b: 0, a: 0 };
    let activePixels = 0;

    function getStyle(index) {
      readColor(data, index, options, scratch);
      if (scratch.a === 0) return null;
      const key = `${scratch.r},${scratch.g},${scratch.b},${scratch.a}`;
      counts.set(key, (counts.get(key) || 0) + 1);
      activePixels += 1;

      if (!styles.has(key)) {
        styles.set(key, {
          hex: rgbToHex(scratch.r, scratch.g, scratch.b),
          opacity: options.matte === "transparent" ? scratch.a / 255 : 1,
          segments: []
        });
        styleOrder.push(key);
      }
      return key;
    }

    for (let y = 0; y < height; y += 1) {
      let x = 0;
      while (x < width) {
        const key = getStyle(y * width + x);
        if (!key) {
          x += 1;
          continue;
        }

        const start = x;
        x += 1;
        while (x < width) {
          const nextOffset = y * width + x;
          readColor(data, nextOffset, options, scratch);
          const nextKey = scratch.a === 0 ? null : `${scratch.r},${scratch.g},${scratch.b},${scratch.a}`;
          if (nextKey !== key) break;
          counts.set(key, (counts.get(key) || 0) + 1);
          activePixels += 1;
          x += 1;
        }

        styles.get(key).segments.push(`M${start} ${y}H${x}V${y + 1}H${start}Z`);
      }
    }

    const sortedKeys = styleOrder.sort(function (a, b) {
      return (counts.get(b) || 0) - (counts.get(a) || 0);
    });
    const paths = [];
    const palette = [];

    for (let i = 0; i < sortedKeys.length; i += 1) {
      const key = sortedKeys[i];
      const style = styles.get(key);
      const opacity = style.opacity < 0.995 ? ` fill-opacity="${trimNumber(style.opacity)}"` : "";
      paths.push(`  <path fill="${style.hex}"${opacity} d="${style.segments.join("")}"/>`);
      if (palette.length < MAX_EXACT_SWATCHES) {
        palette.push({
          hex: style.hex,
          opacity: style.opacity,
          count: counts.get(key) || 0
        });
      }
    }

    return { paths, palette, activePixels };
  }

  function quantizeImage(data, width, height, options) {
    const total = width * height;
    const indexMap = new Int16Array(total);
    indexMap.fill(-1);

    const activeIndices = [];
    const buckets = new Map();
    const scratch = { r: 0, g: 0, b: 0, a: 0 };

    for (let index = 0; index < total; index += 1) {
      readColor(data, index, options, scratch);
      if (scratch.a <= options.alphaThreshold) continue;

      activeIndices.push(index);
      const key = ((scratch.r >> 4) << 8) | ((scratch.g >> 4) << 4) | (scratch.b >> 4);
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = { count: 0, r: 0, g: 0, b: 0 };
        buckets.set(key, bucket);
      }
      bucket.count += 1;
      bucket.r += scratch.r;
      bucket.g += scratch.g;
      bucket.b += scratch.b;
    }

    if (!activeIndices.length) {
      return { indexMap, palette: [], activePixels: 0 };
    }

    const bucketList = Array.from(buckets.values()).sort(function (a, b) {
      return b.count - a.count;
    });

    const colorCount = Math.max(1, Math.min(options.paletteSize, bucketList.length));
    const centers = [];
    for (let i = 0; i < colorCount; i += 1) {
      const bucket = bucketList[i];
      centers.push({
        r: bucket.r / bucket.count,
        g: bucket.g / bucket.count,
        b: bucket.b / bucket.count
      });
    }

    const sample = createSample(activeIndices, data, options);
    for (let pass = 0; pass < 7; pass += 1) {
      const sums = centers.map(function () {
        return { count: 0, r: 0, g: 0, b: 0 };
      });

      for (let i = 0; i < sample.length; i += 1) {
        const color = sample[i];
        const nearest = nearestCenter(color.r, color.g, color.b, centers);
        const sum = sums[nearest];
        sum.count += 1;
        sum.r += color.r;
        sum.g += color.g;
        sum.b += color.b;
      }

      for (let i = 0; i < centers.length; i += 1) {
        if (!sums[i].count) continue;
        centers[i].r = sums[i].r / sums[i].count;
        centers[i].g = sums[i].g / sums[i].count;
        centers[i].b = sums[i].b / sums[i].count;
      }
    }

    const sums = centers.map(function () {
      return { count: 0, r: 0, g: 0, b: 0, a: 0 };
    });

    for (let i = 0; i < activeIndices.length; i += 1) {
      const index = activeIndices[i];
      readColor(data, index, options, scratch);
      const nearest = nearestCenter(scratch.r, scratch.g, scratch.b, centers);
      indexMap[index] = nearest;
      const sum = sums[nearest];
      sum.count += 1;
      sum.r += scratch.r;
      sum.g += scratch.g;
      sum.b += scratch.b;
      sum.a += options.matte === "transparent" ? scratch.a : 255;
    }

    const remap = new Int16Array(centers.length);
    remap.fill(-1);
    const palette = [];
    for (let i = 0; i < sums.length; i += 1) {
      const sum = sums[i];
      if (!sum.count) continue;
      remap[i] = palette.length;
      const r = clampByte(Math.round(sum.r / sum.count));
      const g = clampByte(Math.round(sum.g / sum.count));
      const b = clampByte(Math.round(sum.b / sum.count));
      const opacity = Math.max(0, Math.min(1, sum.a / sum.count / 255));
      palette.push({
        hex: rgbToHex(r, g, b),
        opacity,
        count: sum.count
      });
    }

    for (let i = 0; i < indexMap.length; i += 1) {
      const value = indexMap[i];
      if (value >= 0) indexMap[i] = remap[value];
    }

    return { indexMap, palette, activePixels: activeIndices.length };
  }

  function createSample(indices, data, options) {
    const maxSamples = 14000;
    const stride = Math.max(1, Math.floor(indices.length / maxSamples));
    const result = [];
    const scratch = { r: 0, g: 0, b: 0, a: 0 };
    for (let i = 0; i < indices.length; i += stride) {
      readColor(data, indices[i], options, scratch);
      result.push({
        r: scratch.r,
        g: scratch.g,
        b: scratch.b
      });
    }
    return result;
  }

  function readColor(data, index, options, out) {
    const offset = index * 4;
    let r = data[offset];
    let g = data[offset + 1];
    let b = data[offset + 2];
    let a = data[offset + 3];

    if (options.matte !== "transparent") {
      const matteValue = options.matte === "white" ? 255 : 0;
      const alpha = a / 255;
      r = Math.round(r * alpha + matteValue * (1 - alpha));
      g = Math.round(g * alpha + matteValue * (1 - alpha));
      b = Math.round(b * alpha + matteValue * (1 - alpha));
      a = 255;
    }

    out.r = r;
    out.g = g;
    out.b = b;
    out.a = a;
  }

  function nearestCenter(r, g, b, centers) {
    let bestIndex = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < centers.length; i += 1) {
      const center = centers[i];
      const dr = r - center.r;
      const dg = g - center.g;
      const db = b - center.b;
      const distance = dr * dr + dg * dg + db * db;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }
    return bestIndex;
  }

  function buildSvg(input) {
    const escapedName = escapeXml(input.sourceName.replace(/\.[^.]+$/, "") || "converted");

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<svg xmlns="http://www.w3.org/2000/svg" width="${input.sourceWidth}" height="${input.sourceHeight}" viewBox="0 0 ${input.width} ${input.height}" shape-rendering="geometricPrecision" role="img" aria-label="${escapedName}">`,
      `  <title>${escapedName}</title>`,
      input.paths.join("\n"),
      "</svg>"
    ].filter(Boolean).join("\n");
  }

  function buildRunPath(indexMap, width, height, colorIndex) {
    const segments = [];

    for (let y = 0; y < height; y += 1) {
      let x = 0;
      while (x < width) {
        const offset = y * width + x;
        if (indexMap[offset] !== colorIndex) {
          x += 1;
          continue;
        }

        const start = x;
        x += 1;
        while (x < width && indexMap[y * width + x] === colorIndex) {
          x += 1;
        }
        segments.push(`M${start} ${y}H${x}V${y + 1}H${start}Z`);
      }
    }

    return segments.join("");
  }

  function buildTracePath(indexMap, width, height, colorIndex, tolerance) {
    const mask = new Uint8Array(width * height);
    let filled = 0;
    for (let i = 0; i < indexMap.length; i += 1) {
      if (indexMap[i] === colorIndex) {
        mask[i] = 1;
        filled += 1;
      }
    }
    if (!filled) return "";

    const loops = traceMask(mask, width, height);
    const parts = [];
    for (let i = 0; i < loops.length; i += 1) {
      let points = removeCollinear(loops[i]);
      if (tolerance > 0) {
        points = simplifyClosed(points, tolerance);
        points = smoothClosed(points, Math.min(3, Math.max(1, Math.ceil(tolerance))), 0.22);
      }
      if (points.length < 3) continue;
      parts.push(pointsToPath(points));
    }
    return parts.join("");
  }

  function traceMask(mask, width, height) {
    const edges = [];
    const starts = new Map();

    function isFilled(x, y) {
      return x >= 0 && x < width && y >= 0 && y < height && mask[y * width + x] === 1;
    }

    function addEdge(sx, sy, ex, ey, direction) {
      const edge = { sx, sy, ex, ey, direction, used: false };
      edges.push(edge);
      const key = pointKey(sx, sy);
      let bucket = starts.get(key);
      if (!bucket) {
        bucket = [];
        starts.set(key, bucket);
      }
      bucket.push(edge);
    }

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (!isFilled(x, y)) continue;
        if (!isFilled(x, y - 1)) addEdge(x, y, x + 1, y, 0);
        if (!isFilled(x + 1, y)) addEdge(x + 1, y, x + 1, y + 1, 1);
        if (!isFilled(x, y + 1)) addEdge(x + 1, y + 1, x, y + 1, 2);
        if (!isFilled(x - 1, y)) addEdge(x, y + 1, x, y, 3);
      }
    }

    const loops = [];
    for (let i = 0; i < edges.length; i += 1) {
      const first = edges[i];
      if (first.used) continue;

      const startX = first.sx;
      const startY = first.sy;
      const points = [{ x: startX, y: startY }, { x: first.ex, y: first.ey }];
      first.used = true;

      let currentX = first.ex;
      let currentY = first.ey;
      let direction = first.direction;
      let guard = 0;
      const maxSteps = edges.length + 4;

      while ((currentX !== startX || currentY !== startY) && guard < maxSteps) {
        const next = chooseNextEdge(starts.get(pointKey(currentX, currentY)), direction);
        if (!next) break;
        next.used = true;
        points.push({ x: next.ex, y: next.ey });
        currentX = next.ex;
        currentY = next.ey;
        direction = next.direction;
        guard += 1;
      }

      if (points.length > 3 && currentX === startX && currentY === startY) {
        points.pop();
        loops.push(points);
      }
    }

    return loops;
  }

  function chooseNextEdge(candidates, previousDirection) {
    if (!candidates) return null;
    const usable = candidates.filter(function (edge) {
      return !edge.used;
    });
    if (!usable.length) return null;
    if (usable.length === 1) return usable[0];

    const order = [
      (previousDirection + 1) % 4,
      previousDirection,
      (previousDirection + 3) % 4,
      (previousDirection + 2) % 4
    ];

    for (let i = 0; i < order.length; i += 1) {
      const match = usable.find(function (edge) {
        return edge.direction === order[i];
      });
      if (match) return match;
    }

    return usable[0];
  }

  function pointKey(x, y) {
    return `${x},${y}`;
  }

  function removeCollinear(points) {
    if (points.length <= 3) return points.slice();
    const result = [];
    for (let i = 0; i < points.length; i += 1) {
      const previous = points[(i - 1 + points.length) % points.length];
      const current = points[i];
      const next = points[(i + 1) % points.length];
      const dx1 = current.x - previous.x;
      const dy1 = current.y - previous.y;
      const dx2 = next.x - current.x;
      const dy2 = next.y - current.y;
      if (dx1 * dy2 !== dy1 * dx2) result.push(current);
    }
    return result;
  }

  function simplifyClosed(points, tolerance) {
    if (points.length <= 4 || tolerance <= 0) return points.slice();

    const anchor = findAnchor(points);
    const rotated = points.slice(anchor).concat(points.slice(0, anchor));
    rotated.push(rotated[0]);
    const simplified = simplifyOpen(rotated, tolerance);
    simplified.pop();
    return simplified.length >= 3 ? simplified : points.slice();
  }

  function findAnchor(points) {
    let best = 0;
    for (let i = 1; i < points.length; i += 1) {
      if (points[i].x < points[best].x || (points[i].x === points[best].x && points[i].y < points[best].y)) {
        best = i;
      }
    }
    return best;
  }

  function simplifyOpen(points, tolerance) {
    if (points.length <= 2) return points.slice();

    const keep = new Uint8Array(points.length);
    keep[0] = 1;
    keep[points.length - 1] = 1;
    const stack = [[0, points.length - 1]];
    const toleranceSq = tolerance * tolerance;

    while (stack.length) {
      const pair = stack.pop();
      const first = pair[0];
      const last = pair[1];
      let maxDistance = 0;
      let maxIndex = -1;

      for (let i = first + 1; i < last; i += 1) {
        const distance = pointLineDistanceSq(points[i], points[first], points[last]);
        if (distance > maxDistance) {
          maxDistance = distance;
          maxIndex = i;
        }
      }

      if (maxDistance > toleranceSq && maxIndex !== -1) {
        keep[maxIndex] = 1;
        stack.push([first, maxIndex], [maxIndex, last]);
      }
    }

    const result = [];
    for (let i = 0; i < points.length; i += 1) {
      if (keep[i]) result.push(points[i]);
    }
    return result;
  }

  function pointLineDistanceSq(point, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    if (dx === 0 && dy === 0) {
      const px = point.x - start.x;
      const py = point.y - start.y;
      return px * px + py * py;
    }

    let t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));
    const x = start.x + t * dx;
    const y = start.y + t * dy;
    const px = point.x - x;
    const py = point.y - y;
    return px * px + py * py;
  }

  function smoothClosed(points, iterations, ratio) {
    if (points.length < 3 || iterations <= 0) return points.slice();
    let result = points.slice();

    for (let pass = 0; pass < iterations; pass += 1) {
      const next = [];
      for (let i = 0; i < result.length; i += 1) {
        const current = result[i];
        const following = result[(i + 1) % result.length];
        next.push({
          x: current.x * (1 - ratio) + following.x * ratio,
          y: current.y * (1 - ratio) + following.y * ratio
        });
        next.push({
          x: current.x * ratio + following.x * (1 - ratio),
          y: current.y * ratio + following.y * (1 - ratio)
        });
      }
      result = next;
    }

    return result;
  }

  function pointsToPath(points) {
    const commands = [`M${trimNumber(points[0].x)} ${trimNumber(points[0].y)}`];
    for (let i = 1; i < points.length; i += 1) {
      const previous = points[i - 1];
      const point = points[i];
      if (point.y === previous.y) {
        commands.push(`H${trimNumber(point.x)}`);
      } else if (point.x === previous.x) {
        commands.push(`V${trimNumber(point.y)}`);
      } else {
        commands.push(`L${trimNumber(point.x)} ${trimNumber(point.y)}`);
      }
    }
    commands.push("Z");
    return commands.join("");
  }

  function renderSvgPreview(svg) {
    els.svgPreview.classList.remove(EMPTY_PREVIEW_CLASS);
    els.svgPreview.replaceChildren();
    const template = document.createElement("template");
    template.innerHTML = svg.replace(/^<\?xml[^>]*>\s*/i, "");
    els.svgPreview.appendChild(template.content.cloneNode(true));
  }

  function renderPalette(palette) {
    els.swatches.replaceChildren();
    for (let i = 0; i < palette.length; i += 1) {
      const swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.setProperty("--swatch", palette[i].hex);
      swatch.title = palette[i].hex;
      els.swatches.appendChild(swatch);
    }
  }

  function downloadSvg() {
    if (!state.svg) return;
    const blob = new Blob([state.svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeFileStem(state.sourceName)}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 500);
  }

  async function copySvg() {
    if (!state.svg) return;
    try {
      await navigator.clipboard.writeText(state.svg);
      setStatus("SVG copied.");
    } catch (error) {
      setStatus("Clipboard access was blocked.");
    }
  }

  function loadSample() {
    const canvas = document.createElement("canvas");
    canvas.width = 220;
    canvas.height = 180;
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = context.createLinearGradient(26, 24, 190, 160);
    gradient.addColorStop(0, "#009b9a");
    gradient.addColorStop(0.62, "#3157d7");
    gradient.addColorStop(1, "#ff5c35");

    context.fillStyle = gradient;
    roundedRect(context, 28, 28, 164, 124, 20);
    context.fill();

    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(74, 88, 28, 0, Math.PI * 2);
    context.fill();
    context.globalCompositeOperation = "source-over";

    context.fillStyle = "#c7ef35";
    context.beginPath();
    context.moveTo(126, 48);
    context.lineTo(156, 48);
    context.lineTo(140, 82);
    context.lineTo(168, 82);
    context.lineTo(118, 140);
    context.lineTo(132, 98);
    context.lineTo(106, 98);
    context.closePath();
    context.fill();

    context.strokeStyle = "#171915";
    context.lineWidth = 8;
    context.lineJoin = "round";
    context.strokeRect(28, 28, 164, 124);

    loadImage(canvas.toDataURL("image/png"), "sample-badge.png");
  }

  function roundedRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  function rgbToHex(r, g, b) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function toHex(value) {
    return clampByte(value).toString(16).padStart(2, "0");
  }

  function clampByte(value) {
    return Math.max(0, Math.min(255, value));
  }

  function trimNumber(value) {
    return Number.parseFloat(Number(value).toFixed(3)).toString();
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  function precisionStatus(raster, result, options) {
    const mode = options.mode === "runs" ? "Exact RGBA" : "Trace";
    const cap = raster.wasCapped ? " Processing was capped to protect browser memory." : "";
    return `${mode} SVG ready: ${result.activePixels.toLocaleString()} pixels, ${result.paths.length.toLocaleString()} paths.${cap}`;
  }

  function escapeXml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function safeFileStem(name) {
    const stem = (name || "converted").replace(/\.[^.]+$/, "");
    return stem.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "converted";
  }
}());
