(function () {
  "use strict";

  const els = {
    topbar: document.querySelector(".topbar"),
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
  const MONOCHROME_COLOR_DISTANCE = 18;

  const state = {
    image: null,
    sourceName: "image",
    sourceWidth: 0,
    sourceHeight: 0,
    svg: "",
    palette: [],
    processing: false,
    needsProcess: false,
    pendingTimer: 0
  };

  const EMPTY_PREVIEW_CLASS = "is-empty";
  els.svgPreview.classList.add(EMPTY_PREVIEW_CLASS);

  bindEvents();
  syncControlLabels();

  function bindEvents() {
    updateStickyOffset();
    window.addEventListener("resize", updateStickyOffset);

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

  function updateStickyOffset() {
    if (!els.topbar) return;
    const topbarHeight = els.topbar.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--preview-sticky-top", `${Math.ceil(topbarHeight + 14)}px`);
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
    if (state.processing) {
      state.needsProcess = true;
      return;
    }
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
    if (!state.image) return;
    if (state.processing) {
      state.needsProcess = true;
      return;
    }

    state.processing = true;
    state.needsProcess = false;
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
        els.colorCount.textContent = String(uniquePalette(result.palette).length);
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
        if (state.needsProcess) {
          state.needsProcess = false;
          queueProcess(0);
        }
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
    const colorProfile = analyzeVisibleColors(data, options);
    if (options.matte === "transparent" && (options.paletteSize <= 2 || colorProfile.isMonochrome)) {
      return buildAlphaTraceResult(data, width, height, options, colorProfile);
    }

    const quantized = quantizeImage(data, width, height, options);
    const paths = [];
    const traceTolerance = options.simplify * Math.max(1, options.precision);

    for (let colorIndex = 0; colorIndex < quantized.palette.length; colorIndex += 1) {
      const color = quantized.palette[colorIndex];
      const d = buildTracePath(quantized.indexMap, width, height, colorIndex, traceTolerance);
      if (!d) continue;
      const opacity = color.opacity < 0.995 ? ` fill-opacity="${trimNumber(color.opacity)}"` : "";
      paths.push(`<path${fillAttr(color.hex)}${opacity} fill-rule="evenodd" d="${d}"/>`);
    }

    return {
      paths,
      palette: quantized.palette,
      activePixels: quantized.activePixels
    };
  }

  function buildAlphaTraceResult(data, width, height, options, colorProfile) {
    const threshold = traceAlphaThreshold(options.alphaThreshold);
    const tolerance = options.simplify * Math.max(1, options.precision);
    const color = colorProfile || analyzeVisibleColors(data, options);
    const loops = traceAlphaContours(data, width, height, threshold);
    const parts = [];
    let cursor = { x: 0, y: 0 };
    let pointCount = 0;

    for (let i = 0; i < loops.length; i += 1) {
      let points = removeCollinear(removeDuplicatePoints(loops[i]));
      pointCount += points.length;
      if (tolerance > 0) points = simplifyClosed(points, tolerance);
      if (points.length < 3) continue;
      parts.push(tolerance > 0 ? pointsToSmoothPath(points, cursor) : pointsToPath(points, cursor));
      cursor = tolerance > 0 ? smoothStartPoint(points) : points[0];
    }

    return {
      paths: parts.length ? [`<path${fillAttr(color.hex)} fill-rule="evenodd" d="${parts.join("")}"/>`] : [],
      palette: [{ hex: color.hex, opacity: 1, count: color.count }],
      activePixels: color.count,
      sourcePoints: pointCount
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
      if (scratch.a <= options.alphaThreshold) return null;
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
          const nextKey = scratch.a <= options.alphaThreshold ? null : `${scratch.r},${scratch.g},${scratch.b},${scratch.a}`;
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
      paths.push(`<path${fillAttr(style.hex)}${opacity} d="${style.segments.join("")}"/>`);
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

  function traceAlphaThreshold(alphaThreshold) {
    if (alphaThreshold >= 240) return 128;
    return Math.max(1, Math.min(254, alphaThreshold));
  }

  function analyzeVisibleColors(data, options) {
    let r = 0;
    let g = 0;
    let b = 0;
    let weight = 0;
    let count = 0;
    let minR = 255;
    let minG = 255;
    let minB = 255;
    let maxR = 0;
    let maxG = 0;
    let maxB = 0;
    const scratch = { r: 0, g: 0, b: 0, a: 0 };

    for (let index = 0; index < data.length / 4; index += 1) {
      readColor(data, index, options, scratch);
      if (scratch.a === 0) continue;
      r += scratch.r * scratch.a;
      g += scratch.g * scratch.a;
      b += scratch.b * scratch.a;
      weight += scratch.a;
      count += 1;
      minR = Math.min(minR, scratch.r);
      minG = Math.min(minG, scratch.g);
      minB = Math.min(minB, scratch.b);
      maxR = Math.max(maxR, scratch.r);
      maxG = Math.max(maxG, scratch.g);
      maxB = Math.max(maxB, scratch.b);
    }

    if (!weight) return { hex: "#000000", count: 0, isMonochrome: true };
    return {
      hex: rgbToHex(Math.round(r / weight), Math.round(g / weight), Math.round(b / weight)),
      count,
      isMonochrome: Math.max(maxR - minR, maxG - minG, maxB - minB) <= MONOCHROME_COLOR_DISTANCE
    };
  }

  function traceAlphaContours(data, width, height, threshold) {
    const segments = [];
    const starts = new Map();

    function alphaAt(x, y) {
      if (x < 0 || x >= width || y < 0 || y >= height) return 0;
      return data[(y * width + x) * 4 + 3];
    }

    function interp(a, b) {
      if (a === b) return 0.5;
      return Math.max(0, Math.min(1, (threshold - a) / (b - a)));
    }

    function addSegment(a, b) {
      if (!a || !b || pointDistanceSq(a, b) < 0.000001) return;
      const segment = { a, b, used: false };
      segments.push(segment);
      addSegmentEndpoint(starts, a, segment);
      addSegmentEndpoint(starts, b, segment);
    }

    for (let y = -1; y < height; y += 1) {
      for (let x = -1; x < width; x += 1) {
        const tl = alphaAt(x, y);
        const tr = alphaAt(x + 1, y);
        const br = alphaAt(x + 1, y + 1);
        const bl = alphaAt(x, y + 1);
        const inside = [
          tl >= threshold,
          tr >= threshold,
          br >= threshold,
          bl >= threshold
        ];
        const code = (inside[0] ? 1 : 0) | (inside[1] ? 2 : 0) | (inside[2] ? 4 : 0) | (inside[3] ? 8 : 0);
        if (code === 0 || code === 15) continue;

        const top = { x: x + interp(tl, tr), y };
        const right = { x: x + 1, y: y + interp(tr, br) };
        const bottom = { x: x + interp(bl, br), y: y + 1 };
        const left = { x, y: y + interp(tl, bl) };

        switch (code) {
          case 1:
            addSegment(left, top);
            break;
          case 2:
            addSegment(top, right);
            break;
          case 3:
            addSegment(left, right);
            break;
          case 4:
            addSegment(right, bottom);
            break;
          case 5:
            addSegment(left, bottom);
            addSegment(top, right);
            break;
          case 6:
            addSegment(top, bottom);
            break;
          case 7:
            addSegment(left, bottom);
            break;
          case 8:
            addSegment(bottom, left);
            break;
          case 9:
            addSegment(top, bottom);
            break;
          case 10:
            addSegment(top, left);
            addSegment(right, bottom);
            break;
          case 11:
            addSegment(right, bottom);
            break;
          case 12:
            addSegment(right, left);
            break;
          case 13:
            addSegment(top, right);
            break;
          case 14:
            addSegment(left, top);
            break;
        }
      }
    }

    return segmentsToLoops(segments, starts);
  }

  function addSegmentEndpoint(starts, point, segment) {
    const key = pointKey(point.x, point.y);
    let bucket = starts.get(key);
    if (!bucket) {
      bucket = [];
      starts.set(key, bucket);
    }
    bucket.push(segment);
  }

  function segmentsToLoops(segments, starts) {
    const loops = [];

    for (let i = 0; i < segments.length; i += 1) {
      const first = segments[i];
      if (first.used) continue;

      first.used = true;
      const start = first.a;
      let current = first.b;
      const points = [start, current];
      let guard = 0;

      while (pointDistanceSq(current, start) > 0.000001 && guard < segments.length + 4) {
        const next = findConnectedSegment(starts.get(pointKey(current.x, current.y)));
        if (!next) break;
        next.used = true;
        current = pointDistanceSq(next.a, current) <= pointDistanceSq(next.b, current) ? next.b : next.a;
        points.push(current);
        guard += 1;
      }

      if (points.length > 3 && pointDistanceSq(points[points.length - 1], start) <= 0.000001) {
        points.pop();
        loops.push(points);
      }
    }

    return loops;
  }

  function findConnectedSegment(candidates) {
    if (!candidates) return null;
    for (let i = 0; i < candidates.length; i += 1) {
      if (!candidates[i].used) return candidates[i];
    }
    return null;
  }

  function removeDuplicatePoints(points) {
    const result = [];
    for (let i = 0; i < points.length; i += 1) {
      const previous = result[result.length - 1];
      if (!previous || pointDistanceSq(previous, points[i]) > 0.000001) {
        result.push(points[i]);
      }
    }
    if (result.length > 1 && pointDistanceSq(result[0], result[result.length - 1]) <= 0.000001) {
      result.pop();
    }
    return result;
  }

  function pointDistanceSq(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
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
    const label = escapedName ? ` aria-label="${escapedName}"` : "";
    const viewBox = input.width === input.sourceWidth && input.height === input.sourceHeight
      ? ""
      : ` viewBox="0 0 ${input.width} ${input.height}"`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${input.sourceWidth}" height="${input.sourceHeight}"${viewBox}${label} shape-rendering="geometricPrecision">${input.paths.join("")}</svg>`;
  }

  function fillAttr(hex) {
    return hex === "#000" ? "" : ` fill="${hex}"`;
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
    let cursor = { x: 0, y: 0 };
    for (let i = 0; i < loops.length; i += 1) {
      let points = removeCollinear(loops[i]);
      const originalPointCount = points.length;
      if (tolerance > 0) {
        points = simplifyClosed(points, tolerance);
      }
      if (points.length < 3) continue;
      if (tolerance > 0 && originalPointCount > 12) {
        parts.push(pointsToSmoothPath(points, cursor));
        cursor = smoothStartPoint(points);
      } else {
        parts.push(pointsToPath(points, cursor));
        cursor = points[0];
      }
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

  function pointsToPath(points, cursor) {
    const origin = cursor || { x: 0, y: 0 };
    const commands = [`m${nums(points[0].x - origin.x, points[0].y - origin.y)}`];
    let pendingCommand = "";
    let pendingX = 0;
    let pendingY = 0;
    let pendingPairs = [];
    let canUseImplicitLine = true;

    function flushPending() {
      if (!pendingCommand) return;
      if (pendingCommand === "h") {
        commands.push(`h${num(pendingX)}`);
      } else if (pendingCommand === "v") {
        commands.push(`v${num(pendingY)}`);
      } else {
        if (canUseImplicitLine) {
          commands[commands.length - 1] += numsArray(pendingPairs);
        } else {
          commands.push(`l${numsArray(pendingPairs)}`);
        }
      }
      canUseImplicitLine = false;
      pendingCommand = "";
      pendingX = 0;
      pendingY = 0;
      pendingPairs = [];
    }

    function queueSegment(command, dx, dy) {
      if (nearlyZero(dx) && nearlyZero(dy)) return;
      if (command === "l") {
        if (pendingCommand !== "l") {
          flushPending();
          pendingCommand = "l";
        }
        const lastIndex = pendingPairs.length - 2;
        if (lastIndex >= 0 && sameLineDirection(pendingPairs[lastIndex], pendingPairs[lastIndex + 1], dx, dy)) {
          pendingPairs[lastIndex] += dx;
          pendingPairs[lastIndex + 1] += dy;
        } else {
          pendingPairs.push(dx, dy);
        }
        return;
      }
      if (pendingCommand === command) {
        pendingX += dx;
        pendingY += dy;
        return;
      }
      flushPending();
      pendingCommand = command;
      pendingX = dx;
      pendingY = dy;
    }

    for (let i = 1; i < points.length; i += 1) {
      const previous = points[i - 1];
      const point = points[i];
      const dx = point.x - previous.x;
      const dy = point.y - previous.y;
      if (nearlyZero(dy)) {
        queueSegment("h", dx, 0);
      } else if (nearlyZero(dx)) {
        queueSegment("v", 0, dy);
      } else {
        queueSegment("l", dx, dy);
      }
    }
    flushPending();
    commands.push("Z");
    return commands.join("");
  }

  function sameLineDirection(ax, ay, bx, by) {
    const cross = ax * by - ay * bx;
    const dot = ax * bx + ay * by;
    return nearlyZero(cross) && dot > 0;
  }

  function pointsToSmoothPath(points, previousCursor) {
    const commands = [];
    const lastIndex = points.length - 1;
    const start = midpoint(points[lastIndex], points[0]);
    const origin = previousCursor || { x: 0, y: 0 };
    commands.push(`m${nums(start.x - origin.x, start.y - origin.y)}`);
    let cursor = start;

    for (let i = 0; i < points.length; i += 1) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      const mid = midpoint(current, next);
      commands.push(`q${nums(current.x - cursor.x, current.y - cursor.y, mid.x - cursor.x, mid.y - cursor.y)}`);
      cursor = mid;
    }

    commands.push("Z");
    return commands.join("");
  }

  function smoothStartPoint(points) {
    return midpoint(points[points.length - 1], points[0]);
  }

  function midpoint(a, b) {
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2
    };
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
    const colors = uniquePalette(palette);
    for (let i = 0; i < colors.length; i += 1) {
      const swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.setProperty("--swatch", colors[i].hex);
      swatch.title = colors[i].hex;
      els.swatches.appendChild(swatch);
    }
  }

  function uniquePalette(palette) {
    const merged = new Map();
    for (let i = 0; i < palette.length; i += 1) {
      const color = palette[i];
      const existing = merged.get(color.hex);
      if (existing) {
        existing.count += color.count || 0;
        existing.opacity = Math.max(existing.opacity, color.opacity);
      } else {
        merged.set(color.hex, {
          hex: color.hex,
          opacity: color.opacity,
          count: color.count || 0
        });
      }
    }
    return Array.from(merged.values()).sort(function (a, b) {
      return b.count - a.count;
    });
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
    const long = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    if (long[1] === long[2] && long[3] === long[4] && long[5] === long[6]) {
      return `#${long[1]}${long[3]}${long[5]}`;
    }
    return long;
  }

  function toHex(value) {
    return clampByte(value).toString(16).padStart(2, "0");
  }

  function clampByte(value) {
    return Math.max(0, Math.min(255, value));
  }

  function trimNumber(value) {
    return Number.parseFloat(Number(value).toFixed(2)).toString();
  }

  function num(value) {
    let rounded = trimNumber(value);
    if (rounded === "-0") rounded = "0";
    return rounded.replace(/^(-?)0\./, "$1.");
  }

  function nums() {
    return numsArray(arguments);
  }

  function numsArray(values) {
    let result = "";
    let previous = "";
    for (let i = 0; i < values.length; i += 1) {
      const value = num(values[i]);
      result += needsNumberSeparator(previous, value) ? ` ${value}` : value;
      previous = value;
    }
    return result;
  }

  function needsNumberSeparator(previous, current) {
    if (!previous || current.startsWith("-")) return false;
    return !(current.startsWith(".") && previous.includes("."));
  }

  function nearlyZero(value) {
    return Math.abs(value) < 0.0005;
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
