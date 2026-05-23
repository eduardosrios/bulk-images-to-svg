(function () {
  "use strict";

  const els = {
    appShell: document.querySelector(".app-shell"),
    topbar: document.querySelector(".topbar"),
    fileInput: document.getElementById("fileInput"),
    dropZone: document.getElementById("dropZone"),
    fileName: document.getElementById("fileName"),
    imagePosition: document.getElementById("imagePosition"),
    activeImageName: document.getElementById("activeImageName"),
    previousImageButton: document.getElementById("previousImageButton"),
    nextImageButton: document.getElementById("nextImageButton"),
    brandResetButton: document.getElementById("brandResetButton"),
    resetButton: document.getElementById("resetButton"),
    resetModal: document.getElementById("resetModal"),
    cancelResetButton: document.getElementById("cancelResetButton"),
    confirmResetButton: document.getElementById("confirmResetButton"),
    sampleButton: document.getElementById("sampleButton"),
    downloadButton: document.getElementById("downloadButton"),
    downloadAllButton: document.getElementById("downloadAllButton"),
    copyButton: document.getElementById("copyButton"),
    originalCanvas: document.getElementById("originalCanvas"),
    svgPreview: document.getElementById("svgPreview"),
    previewStages: document.querySelectorAll(".checker"),
    statusText: document.getElementById("statusText"),
    sourceStat: document.getElementById("sourceStat"),
    traceStat: document.getElementById("traceStat"),
    originalSizeStat: document.getElementById("originalSizeStat"),
    sizeStat: document.getElementById("sizeStat"),
    detailStat: document.getElementById("detailStat"),
    colorCount: document.getElementById("colorCount"),
    swatches: document.getElementById("swatches"),
    originalBadge: document.getElementById("originalBadge"),
    outputBadge: document.getElementById("outputBadge"),
    originalSizeBadge: document.getElementById("originalSizeBadge"),
    svgSizeBadge: document.getElementById("svgSizeBadge"),
    paletteSize: document.getElementById("paletteSize"),
    paletteValue: document.getElementById("paletteValue"),
    mergeColors: document.getElementById("mergeColors"),
    mergeColorsValue: document.getElementById("mergeColorsValue"),
    alphaThreshold: document.getElementById("alphaThreshold"),
    alphaValue: document.getElementById("alphaValue"),
    maxDimension: document.getElementById("maxDimension"),
    resolutionValue: document.getElementById("resolutionValue"),
    precision: document.getElementById("precision"),
    precisionValue: document.getElementById("precisionValue"),
    simplify: document.getElementById("simplify"),
    simplifyValue: document.getElementById("simplifyValue"),
    curveFit: document.getElementById("curveFit"),
    curveFitValue: document.getElementById("curveFitValue"),
    arcCorrection: document.getElementById("arcCorrection"),
    arcCorrectionValue: document.getElementById("arcCorrectionValue"),
    shapeDetect: document.getElementById("shapeDetect"),
    shapeDetectValue: document.getElementById("shapeDetectValue"),
    minRegion: document.getElementById("minRegion"),
    minRegionValue: document.getElementById("minRegionValue"),
    seamFix: document.getElementById("seamFix"),
    seamFixValue: document.getElementById("seamFixValue"),
    numberPrecision: document.getElementById("numberPrecision"),
    numberPrecisionValue: document.getElementById("numberPrecisionValue"),
    matte: document.getElementById("matte")
  };
  const MAX_PROCESSING_DIMENSION = 6144;
  const MAX_EXACT_SWATCHES = 256;
  const MONOCHROME_COLOR_DISTANCE = 18;
  const SUPPORTED_IMAGE_LABEL = "PNG, JPG, JPEG, GIF, WebP, or AVIF";
  const SUPPORTED_IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/pjpeg", "image/gif", "image/webp", "image/avif"]);
  const SUPPORTED_IMAGE_EXTENSION = /\.(png|jpe?g|gif|webp|avif)$/i;
  const DEFAULT_COLOR_LIMIT = 256;
  const SAMPLE_IMAGE_NAME = "181505.png";
  const SAMPLE_IMAGE_BYTES = 16057;
  const ALPHA_TRACE_OPTIMIZE_TOLERANCE = 0.25;
  const SAMPLE_IMAGE_DATA_URL = "data:image/png;base64,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";
  let outputNumberPrecision = 1;

  const state = {
    image: null,
    sourceName: "image",
    sourceWidth: 0,
    sourceHeight: 0,
    sourceBytes: 0,
    svg: "",
    palette: [],
    requestedPaletteSize: Number(els.paletteSize.value),
    images: [],
    activeImageId: "",
    nextImageId: 1,
    processing: false,
    downloadingAll: false,
    loadedFromSample: false,
    needsProcess: false,
    pendingTimer: 0,
    svgPreviewBaseViewBox: null,
    svgPreviewCurrentViewBox: null,
    svgPreviewAnimation: 0,
    svgPreviewPreserveAspectRatio: null,
    previewZoomResetTimer: 0
  };

  const EMPTY_PREVIEW_CLASS = "is-empty";
  els.svgPreview.classList.add(EMPTY_PREVIEW_CLASS);

  bindEvents();
  syncControlLabels();

  function bindEvents() {
    updateStickyOffset();
    window.addEventListener("resize", updateStickyOffset);
    els.previewStages.forEach(function (stage) {
      stage.addEventListener("pointermove", handlePreviewZoomMove);
      stage.addEventListener("pointerleave", resetPreviewZoom);
    });

    els.fileInput.addEventListener("change", function () {
      if (els.fileInput.files && els.fileInput.files.length) {
        loadFiles(els.fileInput.files, { replace: true });
      }
    });

    document.addEventListener("paste", function (event) {
      const file = pastedImageFile(event);
      if (!file) return;
      event.preventDefault();
      loadFiles([file], { replace: state.images.length === 0 });
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
      if (event.dataTransfer.files && event.dataTransfer.files.length) {
        loadFiles(event.dataTransfer.files, { replace: true });
      }
    });

    document.querySelectorAll("input[name='mode']").forEach(function (input) {
      input.addEventListener("change", function () {
        syncControlLabels();
        queueProcess();
      });
    });

    [
      els.paletteSize,
      els.mergeColors,
      els.alphaThreshold,
      els.maxDimension,
      els.precision,
      els.simplify,
      els.curveFit,
      els.arcCorrection,
      els.shapeDetect,
      els.minRegion,
      els.seamFix,
      els.numberPrecision,
      els.matte
    ].forEach(function (control) {
      control.addEventListener("input", function () {
        if (control === els.paletteSize) state.requestedPaletteSize = Number(els.paletteSize.value);
        syncControlLabels();
        queueProcess();
      });
      control.addEventListener("change", function () {
        if (control === els.paletteSize) state.requestedPaletteSize = Number(els.paletteSize.value);
        syncControlLabels();
        queueProcess();
      });
    });

    els.sampleButton.addEventListener("click", loadSample);
    els.brandResetButton.addEventListener("click", openResetModal);
    els.resetButton.addEventListener("click", openResetModal);
    els.cancelResetButton.addEventListener("click", closeResetModal);
    els.confirmResetButton.addEventListener("click", confirmReset);
    els.resetModal.addEventListener("click", function (event) {
      if (event.target === els.resetModal) closeResetModal();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !els.resetModal.hidden) closeResetModal();
    });
    els.downloadButton.addEventListener("click", downloadSvg);
    els.downloadAllButton.addEventListener("click", downloadAllSvgs);
    els.copyButton.addEventListener("click", copySvg);
    els.previousImageButton.addEventListener("click", function () {
      moveActiveImage(-1);
    });
    els.nextImageButton.addEventListener("click", function () {
      moveActiveImage(1);
    });
  }

  function handlePreviewZoomMove(event) {
    if (!state.image) return;
    const position = previewPointerPosition(event);
    const wasZooming = els.appShell.classList.contains("is-preview-zooming");
    window.clearTimeout(state.previewZoomResetTimer);
    els.appShell.classList.add("is-preview-zooming");
    els.appShell.classList.remove("is-preview-zoom-resetting");
    els.appShell.style.setProperty("--preview-zoom-x", `${(position.x * 100).toFixed(2)}%`);
    els.appShell.style.setProperty("--preview-zoom-y", `${(position.y * 100).toFixed(2)}%`);
    els.appShell.style.setProperty("--preview-zoom-scale", "2");
    zoomSvgPreview(position.x, position.y, 2, wasZooming ? 0 : 900);
  }

  function resetPreviewZoom() {
    window.clearTimeout(state.previewZoomResetTimer);
    els.appShell.classList.remove("is-preview-zooming");
    els.appShell.classList.add("is-preview-zoom-resetting");
    els.appShell.style.setProperty("--preview-zoom-scale", "1");
    resetSvgPreviewZoom(420);
    state.previewZoomResetTimer = window.setTimeout(function () {
      els.appShell.classList.remove("is-preview-zoom-resetting");
      restoreSvgPreviewAspectRatio();
    }, 430);
  }

  function previewPointerPosition(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
    };
  }

  function pastedImageFile(event) {
    const items = event.clipboardData && event.clipboardData.items;
    if (!items) return null;
    for (const item of items) {
      if (!item.type || !item.type.startsWith("image/")) continue;
      const file = item.getAsFile();
      if (file) return file;
    }
    return null;
  }

  function syncControlLabels() {
    const exactMode = isExactMode();
    syncControlAvailability(exactMode);
    syncPreviewBackground();
    els.paletteValue.textContent = exactMode ? "N/A" : els.paletteSize.value;
    els.mergeColorsValue.textContent = exactMode ? "N/A" : els.mergeColors.value;
    els.alphaValue.textContent = els.alphaThreshold.value;
    els.resolutionValue.textContent = els.maxDimension.value;
    els.precisionValue.textContent = `${els.precision.value}x`;
    els.simplifyValue.textContent = exactMode ? "N/A" : Number(els.simplify.value).toFixed(1);
    els.curveFitValue.textContent = exactMode ? "N/A" : Number(els.curveFit.value).toFixed(2);
    els.arcCorrectionValue.textContent = exactMode ? "N/A" : optionLabel(els.arcCorrection.value);
    els.shapeDetectValue.textContent = exactMode ? "N/A" : optionLabel(els.shapeDetect.value);
    els.minRegionValue.textContent = exactMode ? "N/A" : `${els.minRegion.value} px`;
    els.seamFixValue.textContent = exactMode ? "N/A" : Number(els.seamFix.value).toFixed(2);
    els.numberPrecisionValue.textContent = exactMode ? "N/A" : els.numberPrecision.value;
  }

  function updatePaletteSizeLimit(totalColors) {
    const previousValue = els.paletteSize.value;
    const max = Math.max(1, Math.round(Number(totalColors) || DEFAULT_COLOR_LIMIT));
    const min = max <= 1 ? 1 : 2;
    els.paletteSize.min = String(min);
    els.paletteSize.max = String(max);
    els.paletteSize.value = String(Math.max(min, Math.min(max, state.requestedPaletteSize)));
    syncControlLabels();
    return els.paletteSize.value !== previousValue;
  }

  function syncControlAvailability(exactMode) {
    setControlDisabled(els.paletteSize, exactMode);
    setControlDisabled(els.mergeColors, exactMode);
    setControlDisabled(els.simplify, exactMode);
    setControlDisabled(els.curveFit, exactMode);
    setControlDisabled(els.arcCorrection, exactMode);
    setControlDisabled(els.shapeDetect, exactMode);
    setControlDisabled(els.minRegion, exactMode);
    setControlDisabled(els.seamFix, exactMode);
    setControlDisabled(els.numberPrecision, exactMode);
  }

  function syncPreviewBackground() {
    const background = els.matte.value;
    els.previewStages.forEach(function (stage) {
      stage.classList.toggle("is-transparent-background", background === "transparent");
      stage.classList.toggle("is-black-background", background === "black");
    });
  }

  function setControlDisabled(control, disabled) {
    control.disabled = disabled;
    const group = control.closest(".control-group");
    if (group) {
      group.hidden = disabled;
      group.classList.toggle("is-disabled", disabled);
    }
  }

  function isExactMode() {
    const modeInput = document.querySelector("input[name='mode']:checked");
    return Boolean(modeInput && modeInput.value === "runs");
  }

  function setStatus(message) {
    els.statusText.textContent = message;
  }

  function setOutputBadge(status) {
    els.outputBadge.textContent = `SVG : ${status}`;
  }

  function imageTypeLabel(fileName) {
    const match = String(fileName || "").match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toUpperCase() : "IMAGE";
  }

  function setOriginalBadge(status, fileName) {
    els.originalBadge.textContent = `${imageTypeLabel(fileName)} : ${status}`;
  }

  function setOriginalSizeBadge(bytes) {
    const hasSize = Number.isFinite(bytes) && bytes > 0;
    els.originalSizeBadge.hidden = !hasSize;
    els.originalSizeBadge.textContent = hasSize ? formatBytes(bytes) : "-";
  }

  function setSvgSizeBadge(sizeText) {
    const hasSize = Boolean(sizeText && sizeText !== "-");
    els.svgSizeBadge.hidden = !hasSize;
    els.svgSizeBadge.textContent = hasSize ? sizeText : "-";
  }

  function openResetModal() {
    if (!state.images.length || state.loadedFromSample || (els.appShell && els.appShell.classList.contains("is-empty"))) {
      resetToInitialState();
      return;
    }
    els.resetModal.hidden = false;
    els.cancelResetButton.focus();
  }

  function closeResetModal() {
    els.resetModal.hidden = true;
  }

  function confirmReset() {
    closeResetModal();
    resetToInitialState();
  }

  function resetToInitialState() {
    resetBatch();
    if (els.fileInput) els.fileInput.value = "";
    if (els.appShell) els.appShell.classList.add("is-empty");
    els.fileName.textContent = "Drop or browse";
    els.activeImageName.textContent = "Drop or browse";
    els.imagePosition.textContent = "Image 0 of 0";
    setStatus(`Load a ${SUPPORTED_IMAGE_LABEL} image to begin.`);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  function updateStickyOffset() {
    if (!els.topbar) return;
    const topbarHeight = els.topbar.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--topbar-height", `${Math.ceil(topbarHeight)}px`);
    document.documentElement.style.setProperty("--preview-sticky-top", `${Math.ceil(topbarHeight + 14)}px`);
  }

  async function loadFiles(fileList, options) {
    const files = Array.prototype.slice.call(fileList || []).filter(isSupportedImageFile);
    if (!files.length) {
      setStatus(`Use a ${SUPPORTED_IMAGE_LABEL} image.`);
      return;
    }

    if (options && options.replace) {
      resetBatch();
    }
    state.loadedFromSample = false;

    setStatus(`Reading ${formatImageCount(files.length)}...`);
    let loaded = 0;
    let firstLoadedId = "";

    for (const file of files) {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        const image = await decodeImage(dataUrl);
        const record = createImageRecord({
          name: file.name || "image",
          sourceBytes: file.size || 0,
          dataUrl,
          image
        });
        state.images.push(record);
        loaded += 1;
        if (!firstLoadedId) firstLoadedId = record.id;
        if (!state.activeImageId) {
          activateImage(record.id);
        } else {
          renderImageNavigator();
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (!loaded) {
      setStatus("The selected images could not be read.");
      renderImageNavigator();
      return;
    }

    if (firstLoadedId && (!state.activeImageId || options && options.replace)) {
      activateImage(firstLoadedId);
    }
    setStatus(`${formatImageCount(loaded)} loaded.`);
  }

  function isSupportedImageFile(file) {
    const type = (file.type || "").toLowerCase();
    return SUPPORTED_IMAGE_MIME_TYPES.has(type) || SUPPORTED_IMAGE_EXTENSION.test(file.name || "");
  }

  async function loadImage(src, name, sourceBytes, revokeAfterLoad, isSample) {
    try {
      const image = await decodeImage(src);
      resetBatch();
      state.loadedFromSample = Boolean(isSample);
      const record = createImageRecord({
        name: name || "image",
        sourceBytes: sourceBytes || 0,
        dataUrl: src,
        image
      });
      state.images.push(record);
      activateImage(record.id);
      setStatus(`${record.name} loaded.`);
    } catch (error) {
      setStatus("The image could not be decoded.");
    } finally {
      if (revokeAfterLoad) URL.revokeObjectURL(src);
    }
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(String(reader.result));
      };
      reader.onerror = function () {
        reject(new Error("The image could not be read."));
      };
      reader.readAsDataURL(file);
    });
  }

  function decodeImage(src) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = function () {
        reject(new Error("The image could not be decoded."));
      };
      image.src = src;
    });
  }

  function createImageRecord(details) {
    const image = details.image;
    return {
      id: `image-${state.nextImageId++}`,
      name: details.name || "image",
      sourceBytes: details.sourceBytes || 0,
      dataUrl: details.dataUrl,
      image,
      sourceWidth: image.naturalWidth || image.width,
      sourceHeight: image.naturalHeight || image.height,
      svg: "",
      palette: [],
      sourceColorCount: 0,
      traceText: "-",
      svgSizeText: "-",
      detailText: "-",
      colorCount: 0,
      status: "Loaded"
    };
  }

  function resetBatch() {
    window.clearTimeout(state.pendingTimer);
    window.clearTimeout(state.previewZoomResetTimer);
    state.images = [];
    state.activeImageId = "";
    state.image = null;
    state.sourceName = "image";
    state.sourceWidth = 0;
    state.sourceHeight = 0;
    state.sourceBytes = 0;
    state.svg = "";
    state.palette = [];
    state.loadedFromSample = false;
    state.needsProcess = false;
    els.downloadButton.disabled = true;
    els.copyButton.disabled = true;
    els.downloadAllButton.hidden = true;
    els.downloadAllButton.disabled = true;
    updatePaletteSizeLimit(DEFAULT_COLOR_LIMIT);
    setOutputBadge("Idle");
    setOriginalBadge("Waiting", state.sourceName);
    setOriginalSizeBadge(0);
    setSvgSizeBadge("-");
    els.sourceStat.textContent = "-";
    els.traceStat.textContent = "-";
    els.originalSizeStat.textContent = "-";
    els.sizeStat.textContent = "-";
    els.detailStat.textContent = "-";
    els.colorCount.textContent = "0";
    els.swatches.replaceChildren();
    els.svgPreview.replaceChildren();
    els.svgPreview.classList.add(EMPTY_PREVIEW_CLASS);
    resetSvgPreviewState(null);
    els.originalCanvas.classList.remove("has-image");
    renderImageNavigator();
  }

  function activateImage(id) {
    const record = imageRecordById(id);
    if (!record) return;
    state.activeImageId = record.id;
    state.image = record.image;
    state.sourceName = record.name;
    state.sourceWidth = record.sourceWidth;
    state.sourceHeight = record.sourceHeight;
    state.sourceBytes = record.sourceBytes;
    state.svg = record.svg || "";
    state.palette = record.palette || [];
    els.fileName.textContent = state.sourceName;
    els.activeImageName.textContent = state.sourceName;
    els.sourceStat.textContent = `${state.sourceWidth} x ${state.sourceHeight}`;
    els.originalSizeStat.textContent = state.sourceBytes ? formatBytes(state.sourceBytes) : "-";
    setOriginalSizeBadge(state.sourceBytes);
    setOriginalBadge("Loaded", state.sourceName);
    updatePaletteSizeLimit(record.sourceColorCount || DEFAULT_COLOR_LIMIT);
    els.traceStat.textContent = record.traceText || "-";
    els.sizeStat.textContent = record.svgSizeText || "-";
    setSvgSizeBadge(els.sizeStat.textContent);
    els.detailStat.textContent = record.detailText || "-";
    els.colorCount.textContent = String(record.colorCount || 0);
    renderOriginalPreview(record.image);
    renderImageNavigator();
    if (els.appShell) els.appShell.classList.remove("is-empty");
    queueProcess(0);
  }

  function imageRecordById(id) {
    return state.images.find(function (record) {
      return record.id === id;
    });
  }

  function formatImageCount(count) {
    return `${count} image${count === 1 ? "" : "s"}`;
  }

  function activeImageIndex() {
    return state.images.findIndex(function (record) {
      return record.id === state.activeImageId;
    });
  }

  function moveActiveImage(direction) {
    if (!state.images.length) return;
    const currentIndex = Math.max(0, activeImageIndex());
    const nextIndex = Math.max(0, Math.min(state.images.length - 1, currentIndex + direction));
    if (nextIndex === currentIndex) return;
    activateImage(state.images[nextIndex].id);
  }

  function renderImageNavigator() {
    const count = state.images.length;
    const index = activeImageIndex();
    const displayIndex = index >= 0 ? index + 1 : 0;
    const controlsLocked = state.processing || state.downloadingAll;
    els.imagePosition.textContent = `Image ${displayIndex} of ${count}`;
    els.activeImageName.textContent = state.sourceName || "Drop or browse";
    els.previousImageButton.disabled = controlsLocked || count < 2 || index <= 0;
    els.nextImageButton.disabled = controlsLocked || count < 2 || index < 0 || index >= count - 1;
    els.downloadAllButton.hidden = count < 2;
    els.downloadAllButton.disabled = count < 2 || controlsLocked;
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
      mergeColors: Number(els.mergeColors.value),
      alphaThreshold: Number(els.alphaThreshold.value),
      maxDimension: Number(els.maxDimension.value),
      precision: Number(els.precision.value),
      simplify: Number(els.simplify.value),
      curveFit: Number(els.curveFit.value),
      arcCorrection: els.arcCorrection.value,
      shapeDetect: els.shapeDetect.value,
      minRegion: Number(els.minRegion.value),
      seamFix: Number(els.seamFix.value),
      numberPrecision: Number(els.numberPrecision.value),
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
    const processingImageId = state.activeImageId;
    const processingRecord = imageRecordById(processingImageId);
    if (processingRecord) {
      processingRecord.status = "Working";
      renderImageNavigator();
    }
    setStatus("Tracing image...");
    setOutputBadge("Working");
    els.downloadButton.disabled = true;
    els.copyButton.disabled = true;

    window.requestAnimationFrame(function () {
      try {
        const options = readOptions();
        const conversion = convertImageRecord(processingRecord || {
          image: state.image,
          sourceWidth: state.sourceWidth,
          sourceHeight: state.sourceHeight,
          name: state.sourceName
        }, options);
        const raster = conversion.raster;
        const result = conversion.result;
        const svg = conversion.svg;
        const sourceColorCount = detectedSourceColorCount(result);
        const paletteSizeChanged = updatePaletteSizeLimit(sourceColorCount);

        if (options.mode === "trace" && paletteSizeChanged && Number(els.paletteSize.value) !== options.paletteSize) {
          const pendingRecord = imageRecordById(processingImageId);
          if (pendingRecord) pendingRecord.sourceColorCount = sourceColorCount;
          state.needsProcess = true;
          setStatus("Updating color limit...");
          return;
        }

        state.svg = svg;
        state.palette = result.palette;
        renderSvgPreview(svg);
        renderPalette(result.palette);

        const bytes = new Blob([svg]).size;
        els.traceStat.textContent = raster.wasCapped
          ? `${raster.width} x ${raster.height} capped`
          : `${raster.width} x ${raster.height}`;
        els.sizeStat.textContent = formatSvgSize(bytes, state.sourceBytes);
        setSvgSizeBadge(els.sizeStat.textContent);
        els.detailStat.textContent = result.activePixels ? conversionDetails(result) : "-";
        els.colorCount.textContent = String(uniquePalette(result.palette).length);
        setOutputBadge(result.activePixels ? "Converted" : "Empty");
        els.downloadButton.disabled = !svg;
        els.copyButton.disabled = !svg;
        const finishedRecord = imageRecordById(processingImageId);
        if (finishedRecord) {
          finishedRecord.svg = svg;
          finishedRecord.palette = result.palette;
          finishedRecord.sourceColorCount = sourceColorCount;
          finishedRecord.traceText = els.traceStat.textContent;
          finishedRecord.svgSizeText = els.sizeStat.textContent;
          finishedRecord.detailText = els.detailStat.textContent;
          finishedRecord.colorCount = uniquePalette(result.palette).length;
          finishedRecord.status = result.activePixels ? "Converted" : "Empty";
          renderImageNavigator();
        }
        setStatus(result.activePixels ? precisionStatus(raster, result, options) : "No visible pixels were found.");
      } catch (error) {
        console.error(error);
        setStatus(error && error.message ? error.message : "Conversion failed.");
        setOutputBadge("Error");
        const erroredRecord = imageRecordById(processingImageId);
        if (erroredRecord) {
          erroredRecord.status = "Error";
          renderImageNavigator();
        }
      } finally {
        state.processing = false;
        renderImageNavigator();
        if (state.needsProcess) {
          state.needsProcess = false;
          queueProcess(0);
        }
      }
    });
  }

  function convertImageRecord(record, options) {
    outputNumberPrecision = clampNumberPrecision(options.numberPrecision);
    const raster = rasterizeForProcessing(record.image, options, record.sourceWidth, record.sourceHeight);
    const result = options.mode === "runs"
      ? buildExactResult(raster.imageData.data, raster.width, raster.height, options)
      : buildTraceResult(raster.imageData.data, raster.width, raster.height, options);
    const svg = buildSvg({
      width: raster.width,
      height: raster.height,
      sourceWidth: record.sourceWidth,
      sourceHeight: record.sourceHeight,
      sourceName: record.name,
      paths: result.paths,
      options
    });
    return { raster, result, svg };
  }

  function rasterizeForProcessing(image, options, sourceWidth, sourceHeight) {
    const widthSource = sourceWidth || state.sourceWidth;
    const heightSource = sourceHeight || state.sourceHeight;
    const sourceMax = Math.max(widthSource, heightSource);
    const baseDimension = Math.min(sourceMax, options.maxDimension);
    const requestedDimension = Math.max(1, Math.round(baseDimension * options.precision));
    const cappedDimension = Math.min(requestedDimension, MAX_PROCESSING_DIMENSION);
    const scale = cappedDimension / sourceMax;
    const width = Math.max(1, Math.round(widthSource * scale));
    const height = Math.max(1, Math.round(heightSource * scale));
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
      const d = buildTracePath(quantized.indexMap, width, height, colorIndex, traceTolerance, options);
      if (!d) continue;
      const opacity = color.opacity < 0.995 ? ` fill-opacity="${trimNumber(color.opacity)}"` : "";
      const seam = seamFixAttr(color, options);
      paths.push(`<path${fillAttr(color.hex)}${opacity}${seam} fill-rule="evenodd" d="${d}"/>`);
    }

    return {
      paths,
      palette: quantized.palette,
      activePixels: quantized.activePixels,
      sourceColorCount: quantized.sourceColorCount
    };
  }

  function buildAlphaTraceResult(data, width, height, options, colorProfile) {
    const threshold = traceAlphaThreshold(options.alphaThreshold);
    const tolerance = options.simplify * Math.max(1, options.precision);
    const pathOptimizeTolerance = Math.max(tolerance, ALPHA_TRACE_OPTIMIZE_TOLERANCE);
    const color = colorProfile || analyzeVisibleColors(data, options);
    const loops = traceAlphaContours(data, width, height, threshold);
    const parts = [];
    let cursor = { x: 0, y: 0 };
    let pointCount = 0;

    for (let i = 0; i < loops.length; i += 1) {
      let points = removeCollinear(removeDuplicatePoints(loops[i]));
      pointCount += points.length;
      if (options.minRegion > 0 && Math.abs(polygonArea(points)) < options.minRegion) continue;
      points = simplifyClosed(points, pathOptimizeTolerance);
      if (points.length < 3) continue;
      const primitive = detectPrimitivePath(points, options);
      if (primitive) {
        parts.push(primitive.d);
        cursor = primitive.cursor;
        continue;
      }
      const arcPath = arcCorrectPath(points, cursor, options);
      if (arcPath) {
        parts.push(arcPath.d);
        cursor = arcPath.cursor;
        continue;
      }
      const canCurve = tolerance > 0 && options.curveFit > 0;
      parts.push(canCurve ? pointsToSmoothPath(points, cursor, options.curveFit) : pointsToPath(points, cursor));
      cursor = canCurve ? roundedPoint(smoothStartPoint(points)) : roundedPoint(points[0]);
    }

    return {
      paths: parts.length ? [`<path${fillAttr(color.hex)} fill-rule="evenodd" d="${parts.join("")}"/>`] : [],
      palette: [{ hex: color.hex, opacity: 1, count: color.count }],
      activePixels: color.count,
      sourceColorCount: color.sourceColorCount || 1,
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
    const sourceColorCount = sortedKeys.length;

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

    return { paths, palette, activePixels, sourceColorCount };
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
    const colorKeys = new Set();
    const scratch = { r: 0, g: 0, b: 0, a: 0 };

    for (let index = 0; index < data.length / 4; index += 1) {
      readColor(data, index, options, scratch);
      if (scratch.a === 0) continue;
      colorKeys.add(((scratch.r >> 4) << 8) | ((scratch.g >> 4) << 4) | (scratch.b >> 4));
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

    if (!weight) return { hex: "#000000", count: 0, sourceColorCount: 0, isMonochrome: true };
    return {
      hex: rgbToHex(Math.round(r / weight), Math.round(g / weight), Math.round(b / weight)),
      count,
      sourceColorCount: colorKeys.size,
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
      return { indexMap, palette: [], activePixels: 0, sourceColorCount: 0 };
    }

    const bucketList = Array.from(buckets.values()).sort(function (a, b) {
      return b.count - a.count;
    });

    const sourceColorCount = bucketList.length;
    const colorCount = Math.max(1, Math.min(options.paletteSize, sourceColorCount));
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

    if (options.mergeColors > 0 && palette.length > 1) {
      const merged = mergeSimilarColors(indexMap, palette, activeIndices.length, options.mergeColors);
      merged.sourceColorCount = sourceColorCount;
      return merged;
    }

    return { indexMap, palette, activePixels: activeIndices.length, sourceColorCount };
  }

  function mergeSimilarColors(indexMap, palette, activePixels, threshold) {
    const thresholdSq = threshold * threshold;
    const merged = [];
    const remap = new Int16Array(palette.length);

    for (let i = 0; i < palette.length; i += 1) {
      const color = palette[i];
      const rgb = hexToRgb(color.hex);
      let bestIndex = -1;
      let bestDistance = Infinity;

      for (let j = 0; j < merged.length; j += 1) {
        const candidate = merged[j];
        if (Math.abs(candidate.opacity - color.opacity) > 0.12) continue;
        const distance = colorDistanceSq(rgb, candidate);
        if (distance <= thresholdSq && distance < bestDistance) {
          bestIndex = j;
          bestDistance = distance;
        }
      }

      if (bestIndex === -1) {
        remap[i] = merged.length;
        merged.push({
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
          opacity: color.opacity,
          count: color.count
        });
        continue;
      }

      remap[i] = bestIndex;
      const target = merged[bestIndex];
      const total = target.count + color.count;
      target.r = (target.r * target.count + rgb.r * color.count) / total;
      target.g = (target.g * target.count + rgb.g * color.count) / total;
      target.b = (target.b * target.count + rgb.b * color.count) / total;
      target.opacity = (target.opacity * target.count + color.opacity * color.count) / total;
      target.count = total;
    }

    for (let i = 0; i < indexMap.length; i += 1) {
      const value = indexMap[i];
      if (value >= 0) indexMap[i] = remap[value];
    }

    return {
      indexMap,
      palette: merged.map(function (color) {
        return {
          hex: rgbToHex(Math.round(color.r), Math.round(color.g), Math.round(color.b)),
          opacity: color.opacity,
          count: color.count
        };
      }),
      activePixels
    };
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

  function colorDistanceSq(a, b) {
    const dr = a.r - b.r;
    const dg = a.g - b.g;
    const db = a.b - b.b;
    return dr * dr + dg * dg + db * db;
  }

  function buildSvg(input) {
    const escapedName = escapeXml(input.sourceName.replace(/\.[^.]+$/, "") || "converted");
    const label = escapedName ? ` aria-label="${escapedName}"` : "";
    const viewBox = input.width === input.sourceWidth && input.height === input.sourceHeight
      ? ""
      : ` viewBox="0 0 ${input.width} ${input.height}"`;
    const hasStroke = input.paths.some(function (path) {
      return path.includes(" stroke=");
    });
    const seam = input.options && input.options.mode === "trace" && input.options.seamFix > 0 && hasStroke
      ? ` stroke-width="${trimNumber(input.options.seamFix)}" stroke-linecap="round" stroke-linejoin="round"`
      : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${input.sourceWidth}" height="${input.sourceHeight}"${viewBox}${label}${seam} shape-rendering="geometricPrecision">${input.paths.join("")}</svg>`;
  }

  function fillAttr(hex) {
    return hex === "#000" ? "" : ` fill="${hex}"`;
  }

  function seamFixAttr(color, options) {
    if (!options.seamFix || options.seamFix <= 0) return "";
    const opacity = color.opacity < 0.995 ? ` stroke-opacity="${trimNumber(color.opacity)}"` : "";
    return ` stroke="${color.hex}"${opacity}`;
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

  function buildTracePath(indexMap, width, height, colorIndex, tolerance, options) {
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
      if (options.minRegion > 0 && Math.abs(polygonArea(points)) < options.minRegion) continue;
      if (tolerance > 0) {
        points = simplifyClosed(points, tolerance);
      }
      if (points.length < 3) continue;
      const primitive = detectPrimitivePath(points, options);
      if (primitive) {
        parts.push(primitive.d);
        cursor = primitive.cursor;
        continue;
      }
      const arcPath = arcCorrectPath(points, cursor, options);
      if (arcPath) {
        parts.push(arcPath.d);
        cursor = arcPath.cursor;
        continue;
      }
      if (tolerance > 0 && options.curveFit > 0 && originalPointCount > 12) {
        parts.push(pointsToSmoothPath(points, cursor, options.curveFit));
        cursor = roundedPoint(smoothStartPoint(points));
      } else {
        parts.push(pointsToPath(points, cursor));
        cursor = roundedPoint(points[0]);
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

  function polygonArea(points) {
    let area = 0;
    for (let i = 0; i < points.length; i += 1) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      area += current.x * next.y - next.x * current.y;
    }
    return area / 2;
  }

  function detectPrimitivePath(points, options) {
    if (!options || options.shapeDetect === "off") return null;
    const bounds = boundsForPoints(points);
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    if (width <= 0 || height <= 0) return null;

    const rectangle = detectAxisAlignedRectangle(points, bounds, options.shapeDetect);
    if (rectangle) return rectangle;

    const circle = detectNearCirclePath(points, bounds, options.shapeDetect);
    if (circle) return circle;

    const ellipse = detectEllipsePath(points, bounds, options.shapeDetect);
    if (ellipse) return ellipse;

    return null;
  }

  function detectAxisAlignedRectangle(points, bounds, mode) {
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    if (width < 1 || height < 1) return null;

    const tolerance = mode === "aggressive" ? 0.9 : 0.2;
    let maxEdgeDistance = 0;
    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      const distance = Math.min(
        Math.abs(point.x - bounds.minX),
        Math.abs(point.x - bounds.maxX),
        Math.abs(point.y - bounds.minY),
        Math.abs(point.y - bounds.maxY)
      );
      maxEdgeDistance = Math.max(maxEdgeDistance, distance);
      if (distance > tolerance) return null;
    }

    const area = Math.abs(polygonArea(points));
    const boxArea = width * height;
    if (!boxArea) return null;
    const areaError = Math.abs(area - boxArea) / boxArea;
    const maxAreaError = mode === "aggressive" ? 0.035 : 0.006;
    if (areaError > maxAreaError) return null;

    const start = { x: bounds.minX, y: bounds.minY };
    return {
      d: `M${nums(start.x, start.y)}h${num(width)}v${num(height)}H${num(start.x)}Z`,
      cursor: roundedPoint(start)
    };
  }

  function detectNearCirclePath(points, bounds, mode) {
    if (points.length < 8) return null;
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    if (width < 3 || height < 3) return null;

    const aspectDelta = Math.abs(width - height) / Math.max(width, height);
    if (aspectDelta > 0.2) return null;

    const polygon = Math.abs(polygonArea(points));
    if (!polygon) return null;

    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    const radius = Math.min(width, height) / 2;
    const circleArea = Math.PI * radius * radius;
    const areaError = Math.abs(polygon - circleArea) / circleArea;
    const maxAreaError = mode === "aggressive" ? 0.14 : 0.09;
    if (areaError > maxAreaError) return null;

    const maxError = mode === "aggressive" ? Math.max(3.2, radius * 0.14) : Math.max(2.4, radius * 0.1);
    const maxAverageError = maxError * 0.55;
    const sampleStep = Math.max(4, radius * 0.08);
    let totalError = 0;
    let sampleCount = 0;
    const radialSamples = [];

    function addRadialSample(point) {
      const signedError = Math.hypot(point.x - cx, point.y - cy) - radius;
      const error = Math.abs(signedError);
      totalError += error;
      sampleCount += 1;
      radialSamples.push({ point, signedError });
      if (error > maxError) return null;
      return error;
    }

    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      const next = points[(i + 1) % points.length];
      if (addRadialSample(point) === null) return null;
      const segmentLength = Math.hypot(next.x - point.x, next.y - point.y);
      const extraSamples = Math.min(8, Math.floor(segmentLength / sampleStep));
      for (let sampleIndex = 1; sampleIndex <= extraSamples; sampleIndex += 1) {
        const amount = sampleIndex / (extraSamples + 1);
        const sample = {
          x: point.x + ((next.x - point.x) * amount),
          y: point.y + ((next.y - point.y) * amount)
        };
        if (addRadialSample(sample) === null) return null;
      }
    }

    if (totalError / sampleCount > maxAverageError) return null;
    if (mode !== "aggressive" && hasRadialWavePattern(radialSamples, cx, cy, radius)) return null;
    return circlePath(cx, cy, radius);
  }

  function hasRadialWavePattern(samples, cx, cy, radius) {
    if (samples.length < 24 || radius < 12) return false;
    const binCount = 48;
    const bins = Array.from({ length: binCount }, function () {
      return { total: 0, count: 0 };
    });

    for (let i = 0; i < samples.length; i += 1) {
      const sample = samples[i];
      const angle = normalizePositiveAngle(Math.atan2(sample.point.y - cy, sample.point.x - cx));
      const index = Math.min(binCount - 1, Math.floor((angle / (Math.PI * 2)) * binCount));
      bins[index].total += sample.signedError;
      bins[index].count += 1;
    }

    const averages = bins.map(function (bin) {
      return bin.count ? bin.total / bin.count : 0;
    });
    const mean = averages.reduce(function (total, value) {
      return total + value;
    }, 0) / averages.length;
    const centered = averages.map(function (value) {
      return value - mean;
    });
    const peakToPeak = Math.max.apply(null, centered) - Math.min.apply(null, centered);
    const waveAmplitude = Math.max(1.4, radius * 0.032);
    if (peakToPeak < waveAmplitude) return false;

    const threshold = Math.max(0.75, radius * 0.012);
    const signs = centered.map(function (average, index) {
      if (!bins[index].count) return 0;
      if (average > threshold) return 1;
      if (average < -threshold) return -1;
      return 0;
    });

    const absoluteSigns = averages.map(function (average, index) {
      if (!bins[index].count) return 0;
      if (average > threshold) return 1;
      if (average < -threshold) return -1;
      return 0;
    });

    const centeredPattern = countRadialPattern(signs);
    const absolutePattern = countRadialPattern(absoluteSigns);
    return (centeredPattern.activeBins >= 10 && centeredPattern.signChanges >= 6)
      || (absolutePattern.activeBins >= 10 && absolutePattern.signChanges >= 6);
  }

  function countRadialPattern(signs) {
    let activeBins = 0;
    let signChanges = 0;
    let previousSign = 0;
    for (let i = 0; i < signs.length * 2; i += 1) {
      const sign = signs[i % signs.length];
      if (!sign) continue;
      if (i < signs.length) activeBins += 1;
      if (previousSign && sign !== previousSign) signChanges += 1;
      previousSign = sign;
    }

    return { activeBins, signChanges };
  }

  function detectEllipsePath(points, bounds, mode) {
    if (points.length < 8) return null;
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    if (width < 3 || height < 3) return null;

    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    const rx = width / 2;
    const ry = height / 2;
    const radius = (rx + ry) / 2;
    const maxError = mode === "aggressive" ? Math.max(1.25, radius * 0.035) : Math.max(0.55, radius * 0.014);
    const maxAreaError = mode === "aggressive" ? 0.12 : 0.045;
    let totalError = 0;
    let maxPointError = 0;

    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      const nx = (point.x - cx) / rx;
      const ny = (point.y - cy) / ry;
      const normalizedRadius = Math.sqrt(nx * nx + ny * ny);
      const pointError = Math.abs(normalizedRadius - 1) * radius;
      totalError += pointError;
      maxPointError = Math.max(maxPointError, pointError);
      if (pointError > maxError) return null;
    }

    const averageError = totalError / points.length;
    if (averageError > maxError * 0.42) return null;

    const polygon = Math.abs(polygonArea(points));
    const ellipseArea = Math.PI * rx * ry;
    const areaError = Math.abs(polygon - ellipseArea) / ellipseArea;
    if (areaError > maxAreaError) return null;

    const aspectDelta = Math.abs(rx - ry) / Math.max(rx, ry);
    if (aspectDelta <= 0.2) {
      return null;
    }

    const arcRx = rx;
    const arcRy = ry;
    const start = { x: cx - arcRx, y: cy };

    return {
      d: `M${nums(start.x, start.y)}a${nums(arcRx, arcRy)} 0 1 0 ${nums(arcRx * 2, 0)}a${nums(arcRx, arcRy)} 0 1 0 ${nums(-arcRx * 2, 0)}Z`,
      cursor: roundedPoint(start),
      maxPointError
    };
  }

  function circlePath(cx, cy, radius) {
    const arcRadius = roundPathNumber(radius);
    const start = { x: cx - arcRadius, y: cy };
    return {
      d: `M${nums(start.x, start.y)}a${nums(arcRadius, arcRadius)} 0 1 0 ${nums(arcRadius * 2, 0)}a${nums(arcRadius, arcRadius)} 0 1 0 ${nums(-arcRadius * 2, 0)}Z`,
      cursor: roundedPoint(start)
    };
  }

  function arcCorrectPath(points, previousCursor, options) {
    if (!options || !options.arcCorrection || options.arcCorrection === "off" || points.length < 10) return null;
    const settings = arcCorrectionSettings(options.arcCorrection);
    const arcPoints = settings.rotateClosedContour ? rotatePointsForArcCorrection(points) : points;
    const origin = roundedPoint(previousCursor || { x: 0, y: 0 });
    const start = roundedPoint(arcPoints[0]);
    const commands = [`m${nums(start.x - origin.x, start.y - origin.y)}`];
    let pendingCommand = "";
    let pendingX = 0;
    let pendingY = 0;
    let pendingPairs = [];
    let canUseImplicitLine = true;
    let current = start;
    let arcCount = 0;
    let curveCount = 0;

    function flushPending() {
      if (!pendingCommand) return;
      if (pendingCommand === "h") {
        commands.push(`h${num(pendingX)}`);
      } else if (pendingCommand === "v") {
        commands.push(`v${num(pendingY)}`);
      } else if (canUseImplicitLine) {
        commands[commands.length - 1] = appendNumberData(commands[commands.length - 1], numsArray(pendingPairs));
      } else {
        commands.push(`l${numsArray(pendingPairs)}`);
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

    function queueLineTo(point) {
      const target = roundedPoint(point);
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      if (nearlyZero(dy)) {
        queueSegment("h", dx, 0);
      } else if (nearlyZero(dx)) {
        queueSegment("v", 0, dy);
      } else {
        queueSegment("l", dx, dy);
      }
      current = target;
    }

    let index = 0;
    while (index < arcPoints.length - 1) {
      const arc = findArcSegment(arcPoints, index, settings);
      const curve = settings.useBezier ? findBezierCurveSegment(arcPoints, index, settings) : null;
      const segment = chooseArcCorrectionSegment(arc, curve);
      if (segment) {
        flushPending();
        const target = roundedPoint(arcPoints[segment.endIndex]);
        const dx = target.x - current.x;
        const dy = target.y - current.y;
        if (!nearlyZero(dx) || !nearlyZero(dy)) {
          if (segment.type === "curve") {
            const control1 = roundedPoint(segment.control1);
            const control2 = roundedPoint(segment.control2);
            commands.push(`c${nums(control1.x - current.x, control1.y - current.y, control2.x - current.x, control2.y - current.y, dx, dy)}`);
            curveCount += 1;
          } else {
            commands.push(`a${nums(segment.radius, segment.radius)} 0 ${segment.largeArcFlag} ${segment.sweepFlag} ${nums(dx, dy)}`);
            arcCount += 1;
          }
          canUseImplicitLine = false;
        }
        current = target;
        index = segment.endIndex;
      } else {
        queueLineTo(arcPoints[index + 1]);
        index += 1;
      }
    }

    if (!arcCount && !curveCount) return null;
    flushPending();
    commands.push("Z");
    return {
      d: commands.join(""),
      cursor: start
    };
  }

  function rotatePointsForArcCorrection(points) {
    if (points.length < 4) return points;
    const anchor = findArcCorrectionAnchor(points);
    if (anchor <= 0) return points;
    return points.slice(anchor).concat(points.slice(0, anchor));
  }

  function findArcCorrectionAnchor(points) {
    let sharpIndex = -1;
    let sharpScore = -Infinity;
    let straightIndex = 0;
    let straightScore = -Infinity;

    for (let i = 0; i < points.length; i += 1) {
      const previous = points[(i - 1 + points.length) % points.length];
      const current = points[i];
      const next = points[(i + 1) % points.length];
      const incoming = { x: current.x - previous.x, y: current.y - previous.y };
      const outgoing = { x: next.x - current.x, y: next.y - current.y };
      const incomingLength = Math.hypot(incoming.x, incoming.y);
      const outgoingLength = Math.hypot(outgoing.x, outgoing.y);
      if (incomingLength <= 0.001 || outgoingLength <= 0.001) continue;
      const turn = Math.abs(Math.atan2(
        (incoming.x * outgoing.y) - (incoming.y * outgoing.x),
        (incoming.x * outgoing.x) + (incoming.y * outgoing.y)
      ));
      const localLength = Math.min(incomingLength, outgoingLength);
      const cornerScore = (turn * 12) + localLength;
      if (turn > 0.7 && cornerScore > sharpScore) {
        sharpScore = cornerScore;
        sharpIndex = i;
      }
      const lineScore = localLength - (turn * 16);
      if (lineScore > straightScore) {
        straightScore = lineScore;
        straightIndex = i;
      }
    }

    return sharpIndex >= 0 ? sharpIndex : straightIndex;
  }

  function arcCorrectionSettings(mode) {
    if (mode === "aggressive") {
      return {
        useBezier: false,
        rotateClosedContour: false,
        sampleArcSegments: false,
        minEdges: 6,
        maxEdges: 96,
        minRadius: 3,
        minTurn: 0.2,
        maxTurn: Math.PI * 1.45,
        minSagitta: 0.75,
        minError: 2.2,
        errorRatio: 0.042,
        averageErrorFactor: 0.72,
        finalMinError: 1.55,
        finalErrorRatio: 0.032,
        finalAverageErrorFactor: 0.62,
        maxArcAngleOverflow: 0.08,
        fitSamples: 36,
        fineFitIterations: 14,
        lengthBonus: 0.025,
        minDirectionConsistency: 0.72,
        minSegmentTurnConsistency: 0.42,
        minChordRadiusRatio: 0.85
      };
    }
    if (mode === "bezier") {
      return {
        useBezier: true,
        rotateClosedContour: true,
        sampleArcSegments: true,
        minEdges: 5,
        maxEdges: 180,
        minRadius: 4,
        minTurn: 0.12,
        maxTurn: Math.PI * 1.25,
        minSagitta: 0.55,
        minError: 1.45,
        errorRatio: 0.026,
        averageErrorFactor: 0.62,
        finalMinError: 0.95,
        finalErrorRatio: 0.014,
        finalAverageErrorFactor: 0.48,
        maxArcAngleOverflow: 0.045,
        fitSamples: 32,
        fineFitIterations: 14,
        maxEndpointTangentError: 0.78,
        tangentErrorWeight: 0.45,
        lengthBonus: 0.024,
        minDirectionConsistency: 0.72,
        minSegmentTurnConsistency: 0.38,
        minChordRadiusRatio: 0.22,
        minSignificantTurns: 2,
        maxSegmentTurnShare: 0.72,
        bezierMinEdges: 6,
        bezierMaxEdges: 132,
        bezierMinTurn: 0.12,
        bezierMaxTurn: Math.PI * 1.25,
        bezierMinSagitta: 0.55,
        bezierMinError: 0.95,
        bezierErrorRatio: 0.014,
        bezierAverageErrorFactor: 0.46,
        bezierLengthBonus: 0.012,
        bezierMinDirectionConsistency: 0.7,
        bezierMinSegmentTurnConsistency: 0.4,
        bezierMinSignificantTurns: 3,
        bezierMaxSegmentTurnShare: 0.68,
        bezierMaxControlRatio: 1.8
      };
    }
    return {
      useBezier: false,
      rotateClosedContour: false,
      sampleArcSegments: true,
      minEdges: 8,
      maxEdges: 72,
      minRadius: 4,
      minTurn: 0.26,
      maxTurn: Math.PI * 1.25,
      minSagitta: 1,
      minError: 1.45,
      errorRatio: 0.026,
      averageErrorFactor: 0.62,
      finalMinError: 0.95,
      finalErrorRatio: 0.014,
      finalAverageErrorFactor: 0.48,
      maxArcAngleOverflow: 0.045,
      fitSamples: 32,
      fineFitIterations: 14,
      lengthBonus: 0.01,
      minDirectionConsistency: 0.82,
      minSegmentTurnConsistency: 0.58,
      minChordRadiusRatio: 1.12,
      minSignificantTurns: 4,
      maxSegmentTurnShare: 0.5
    };
  }

  function chooseArcCorrectionSegment(arc, curve) {
    if (!arc) return curve;
    if (!curve) return arc;
    const curveExtendsSegment = curve.endIndex >= arc.endIndex + 3;
    const curveIsCleaner = curve.score < arc.score - 0.18;
    if (curveExtendsSegment && curve.score <= arc.score + 0.35) return curve;
    if (curveIsCleaner) return curve;
    return arc;
  }

  function findArcSegment(points, startIndex, settings) {
    const remainingEdges = points.length - 1 - startIndex;
    if (remainingEdges < settings.minEdges) return null;
    const maxEdges = Math.min(settings.maxEdges, remainingEdges);
    let best = null;
    for (let edgeCount = maxEdges; edgeCount >= settings.minEdges; edgeCount -= 1) {
      const candidate = evaluateArcCandidate(points, startIndex, startIndex + edgeCount, settings);
      if (!candidate) continue;
      const score = candidate.objective - (edgeCount * settings.lengthBonus);
      if (!best || score < best.score) {
        best = {
          type: "arc",
          endIndex: candidate.endIndex,
          radius: candidate.radius,
          largeArcFlag: candidate.largeArcFlag,
          sweepFlag: candidate.sweepFlag,
          score
        };
      }
    }
    return best;
  }

  function evaluateArcCandidate(points, startIndex, endIndex, settings) {
    const start = points[startIndex];
    const end = points[endIndex];
    const middle = points[Math.floor((startIndex + endIndex) / 2)];
    const chord = pointDistance(start, end);
    if (chord < 2) return null;

    const sagitta = Math.sqrt(pointLineDistanceSq(middle, start, end));
    if (sagitta < settings.minSagitta) return null;

    const circle = fitCircleFromThreePoints(start, middle, end);
    if (!circle || circle.radius < settings.minRadius || !Number.isFinite(circle.radius)) return null;
    if (circle.radius < (chord / 2) - 0.001) return null;
    if (chord / circle.radius < settings.minChordRadiusRatio) return null;

    const maxError = Math.max(settings.minError, circle.radius * settings.errorRatio);
    let totalError = 0;
    let totalTurn = 0;
    let totalAbsTurn = 0;
    let previousAngle = Math.atan2(start.y - circle.cy, start.x - circle.cx);

    for (let i = startIndex; i <= endIndex; i += 1) {
      const point = points[i];
      const radialError = Math.abs(pointDistance(point, circle) - circle.radius);
      if (radialError > maxError) return null;
      totalError += radialError;

      if (i > startIndex) {
        const angle = Math.atan2(point.y - circle.cy, point.x - circle.cx);
        const delta = normalizeAngleDelta(angle - previousAngle);
        totalTurn += delta;
        totalAbsTurn += Math.abs(delta);
        previousAngle = angle;
      }
    }

    const turn = Math.abs(totalTurn);
    if (turn < settings.minTurn || turn > settings.maxTurn) return null;
    if (totalAbsTurn <= 0 || turn / totalAbsTurn < settings.minDirectionConsistency) return null;
    if (segmentTurnConsistency(points, startIndex, endIndex) < settings.minSegmentTurnConsistency) return null;
    if (Number.isFinite(settings.minSignificantTurns) || Number.isFinite(settings.maxSegmentTurnShare)) {
      const curvature = segmentCurvatureStats(points, startIndex, endIndex);
      if (Number.isFinite(settings.minSignificantTurns) && curvature.significantTurns < settings.minSignificantTurns) return null;
      if (Number.isFinite(settings.maxSegmentTurnShare) && curvature.maxTurnShare > settings.maxSegmentTurnShare) return null;
    }

    const averageError = totalError / (endIndex - startIndex + 1);
    if (averageError > maxError * settings.averageErrorFactor) return null;

    const flags = optimizeEndpointArc(points, startIndex, endIndex, circle, turn, settings);
    if (!flags) return null;
    const finalMaxError = Math.max(settings.finalMinError, flags.radius * settings.finalErrorRatio);
    if (flags.fit.maxError > finalMaxError) return null;
    if (flags.fit.averageError > finalMaxError * settings.finalAverageErrorFactor) return null;
    if (flags.fit.maxAngleOverflow > settings.maxArcAngleOverflow) return null;
    if (Number.isFinite(settings.maxEndpointTangentError) && flags.fit.endpointTangentError > settings.maxEndpointTangentError) return null;

    return {
      endIndex,
      radius: flags.radius,
      largeArcFlag: flags.largeArcFlag,
      sweepFlag: flags.sweepFlag,
      objective: flags.objective
    };
  }

  function findBezierCurveSegment(points, startIndex, settings) {
    const remainingEdges = points.length - 1 - startIndex;
    if (remainingEdges < settings.bezierMinEdges) return null;
    const maxEdges = Math.min(settings.bezierMaxEdges, remainingEdges);
    let best = null;
    for (let edgeCount = maxEdges; edgeCount >= settings.bezierMinEdges; edgeCount -= 1) {
      const candidate = evaluateBezierCurveCandidate(points, startIndex, startIndex + edgeCount, settings);
      if (!candidate) continue;
      const score = candidate.objective - (edgeCount * settings.bezierLengthBonus);
      if (!best || score < best.score) {
        best = {
          type: "curve",
          endIndex: candidate.endIndex,
          control1: candidate.control1,
          control2: candidate.control2,
          score
        };
      }
    }
    return best;
  }

  function evaluateBezierCurveCandidate(points, startIndex, endIndex, settings) {
    const start = points[startIndex];
    const end = points[endIndex];
    const chord = pointDistance(start, end);
    if (chord < 2) return null;

    const sagitta = maxSegmentLineDistance(points, startIndex, endIndex);
    if (sagitta < settings.bezierMinSagitta) return null;

    const curvature = segmentCurvatureStats(points, startIndex, endIndex);
    const turn = Math.abs(curvature.signedTurn);
    if (turn < settings.bezierMinTurn || turn > settings.bezierMaxTurn) return null;
    if (curvature.consistency < settings.bezierMinDirectionConsistency) return null;
    if (curvature.consistency < settings.bezierMinSegmentTurnConsistency) return null;
    if (curvature.significantTurns < settings.bezierMinSignificantTurns) return null;
    if (curvature.maxTurnShare > settings.bezierMaxSegmentTurnShare) return null;

    const fit = fitCubicBezierSegment(points, startIndex, endIndex, settings);
    if (!fit) return null;
    const maxError = Math.max(settings.bezierMinError, chord * settings.bezierErrorRatio);
    if (fit.maxError > maxError) return null;
    if (fit.averageError > maxError * settings.bezierAverageErrorFactor) return null;

    return {
      endIndex,
      control1: fit.control1,
      control2: fit.control2,
      objective: fit.maxError + (fit.averageError * 0.85) + (fit.controlRatio * 0.18)
    };
  }

  function fitCubicBezierSegment(points, startIndex, endIndex, settings) {
    const start = points[startIndex];
    const end = points[endIndex];
    const chord = pointDistance(start, end);
    if (chord <= 0.001) return null;
    const tangent1 = segmentEndpointTangent(points, startIndex, endIndex, true);
    const tangent2 = segmentEndpointTangent(points, startIndex, endIndex, false);
    if (!tangent1 || !tangent2) return null;

    const parameters = chordLengthParameters(points, startIndex, endIndex);
    if (!parameters) return null;
    let c00 = 0;
    let c01 = 0;
    let c11 = 0;
    let x0 = 0;
    let x1 = 0;

    for (let i = startIndex; i <= endIndex; i += 1) {
      const u = parameters[i - startIndex];
      const inverse = 1 - u;
      const b0 = inverse * inverse * inverse;
      const b1 = 3 * u * inverse * inverse;
      const b2 = 3 * u * u * inverse;
      const b3 = u * u * u;
      const a1 = { x: tangent1.x * b1, y: tangent1.y * b1 };
      const a2 = { x: tangent2.x * b2, y: tangent2.y * b2 };
      const base = {
        x: ((b0 + b1) * start.x) + ((b2 + b3) * end.x),
        y: ((b0 + b1) * start.y) + ((b2 + b3) * end.y)
      };
      const target = {
        x: points[i].x - base.x,
        y: points[i].y - base.y
      };
      c00 += dotPoint(a1, a1);
      c01 += dotPoint(a1, a2);
      c11 += dotPoint(a2, a2);
      x0 += dotPoint(a1, target);
      x1 += dotPoint(a2, target);
    }

    const determinant = (c00 * c11) - (c01 * c01);
    let alpha1 = chord / 3;
    let alpha2 = chord / 3;
    if (Math.abs(determinant) > 0.000001) {
      alpha1 = ((x0 * c11) - (x1 * c01)) / determinant;
      alpha2 = ((c00 * x1) - (c01 * x0)) / determinant;
    }
    const maxControl = chord * settings.bezierMaxControlRatio;
    if (!Number.isFinite(alpha1) || !Number.isFinite(alpha2) || alpha1 <= 0.001 || alpha2 <= 0.001) {
      alpha1 = chord / 3;
      alpha2 = chord / 3;
    }
    if (alpha1 > maxControl || alpha2 > maxControl) return null;

    const curve = {
      start,
      control1: {
        x: start.x + (tangent1.x * alpha1),
        y: start.y + (tangent1.y * alpha1)
      },
      control2: {
        x: end.x + (tangent2.x * alpha2),
        y: end.y + (tangent2.y * alpha2)
      },
      end
    };
    const fit = cubicSegmentFitError(points, startIndex, endIndex, parameters, curve);
    if (!fit) return null;
    return {
      control1: curve.control1,
      control2: curve.control2,
      maxError: fit.maxError,
      averageError: fit.averageError,
      controlRatio: Math.max(alpha1, alpha2) / chord
    };
  }

  function segmentEndpointTangent(points, startIndex, endIndex, atStart) {
    const anchor = atStart ? points[startIndex] : points[endIndex];
    const step = atStart ? 1 : -1;
    const limit = atStart ? endIndex : startIndex;
    for (let i = atStart ? startIndex + 1 : endIndex - 1; atStart ? i <= limit : i >= limit; i += step) {
      const point = points[i];
      const vector = atStart
        ? { x: point.x - anchor.x, y: point.y - anchor.y }
        : { x: point.x - anchor.x, y: point.y - anchor.y };
      const length = Math.hypot(vector.x, vector.y);
      if (length > 0.001) {
        return { x: vector.x / length, y: vector.y / length };
      }
    }
    return null;
  }

  function chordLengthParameters(points, startIndex, endIndex) {
    const parameters = [0];
    let total = 0;
    for (let i = startIndex + 1; i <= endIndex; i += 1) {
      total += pointDistance(points[i - 1], points[i]);
      parameters.push(total);
    }
    if (total <= 0.001) return null;
    for (let i = 1; i < parameters.length; i += 1) {
      parameters[i] /= total;
    }
    return parameters;
  }

  function cubicSegmentFitError(points, startIndex, endIndex, parameters, curve) {
    let maxError = 0;
    let totalError = 0;
    let count = 0;

    function addSample(point, parameter) {
      const error = cubicPointDistance(point, curve, parameter);
      maxError = Math.max(maxError, error);
      totalError += error;
      count += 1;
    }

    for (let i = startIndex; i <= endIndex; i += 1) {
      const parameter = parameters[i - startIndex];
      addSample(points[i], parameter);
      if (i === endIndex) continue;
      const current = points[i];
      const next = points[i + 1];
      const segmentLength = pointDistance(current, next);
      const extraSamples = Math.min(4, Math.floor(segmentLength / 2));
      const nextParameter = parameters[i + 1 - startIndex];
      for (let sampleIndex = 1; sampleIndex <= extraSamples; sampleIndex += 1) {
        const amount = sampleIndex / (extraSamples + 1);
        addSample(lerpPoint(current, next, amount), parameter + ((nextParameter - parameter) * amount));
      }
    }

    return count ? {
      maxError,
      averageError: totalError / count
    } : null;
  }

  function cubicPointDistance(point, curve, initialParameter) {
    let low = Math.max(0, initialParameter - 0.08);
    let high = Math.min(1, initialParameter + 0.08);
    for (let i = 0; i < 8; i += 1) {
      const left = low + ((high - low) / 3);
      const right = high - ((high - low) / 3);
      if (pointDistance(point, cubicPoint(curve, left)) < pointDistance(point, cubicPoint(curve, right))) {
        high = right;
      } else {
        low = left;
      }
    }
    const parameter = (low + high) / 2;
    return pointDistance(point, cubicPoint(curve, parameter));
  }

  function cubicPoint(curve, parameter) {
    const inverse = 1 - parameter;
    const b0 = inverse * inverse * inverse;
    const b1 = 3 * parameter * inverse * inverse;
    const b2 = 3 * parameter * parameter * inverse;
    const b3 = parameter * parameter * parameter;
    return {
      x: (b0 * curve.start.x) + (b1 * curve.control1.x) + (b2 * curve.control2.x) + (b3 * curve.end.x),
      y: (b0 * curve.start.y) + (b1 * curve.control1.y) + (b2 * curve.control2.y) + (b3 * curve.end.y)
    };
  }

  function maxSegmentLineDistance(points, startIndex, endIndex) {
    let maxDistance = 0;
    const start = points[startIndex];
    const end = points[endIndex];
    for (let i = startIndex + 1; i < endIndex; i += 1) {
      maxDistance = Math.max(maxDistance, Math.sqrt(pointLineDistanceSq(points[i], start, end)));
    }
    return maxDistance;
  }

  function optimizeEndpointArc(points, startIndex, endIndex, initialCircle, turn, settings) {
    const start = roundedPoint(points[startIndex]);
    const end = roundedPoint(points[endIndex]);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const chord = Math.hypot(dx, dy);
    if (chord <= 0) return null;

    const halfChord = chord / 2;
    const midpoint = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2
    };
    const perpendicular = {
      x: -dy / chord,
      y: dx / chord
    };
    const initialSignedHeight = ((initialCircle.cx - midpoint.x) * perpendicular.x) + ((initialCircle.cy - midpoint.y) * perpendicular.y);
    const preferredSign = initialSignedHeight < 0 ? -1 : 1;
    const radiusMin = Math.max(halfChord + 0.001, settings.minRadius);
    const radiusMax = Math.max(radiusMin, chord / settings.minChordRadiusRatio);
    const heightMin = Math.sqrt(Math.max(0, (radiusMin * radiusMin) - (halfChord * halfChord)));
    const heightMax = Math.sqrt(Math.max(0, (radiusMax * radiusMax) - (halfChord * halfChord)));
    if (!Number.isFinite(heightMax) || heightMax < heightMin) return null;

    const initialHeight = Math.max(heightMin, Math.min(heightMax, Math.abs(initialSignedHeight)));
    const largeArcPreference = Math.abs(turn) > Math.PI ? 1 : 0;
    let best = null;
    const signs = preferredSign === 1 ? [1, -1] : [-1, 1];
    const largeFlags = largeArcPreference ? [1, 0] : [0, 1];

    function evaluateHeight(sign, height, largeArcFlag) {
      const center = {
        x: midpoint.x + (perpendicular.x * height * sign),
        y: midpoint.y + (perpendicular.y * height * sign)
      };
      const radius = Math.hypot(start.x - center.x, start.y - center.y);
      const arc = endpointArcForCenter(start, end, center, radius, largeArcFlag);
      if (!arc) return;
      const fit = arcSegmentFitError(points, startIndex, endIndex, arc, settings);
      if (!fit) return;
      const tangentPenalty = Number.isFinite(settings.tangentErrorWeight)
        ? fit.endpointTangentError * radius * settings.tangentErrorWeight
        : 0;
      const objective = fit.maxError + (fit.averageError * 0.8) + (fit.maxAngleOverflow * radius * 1.5) + tangentPenalty;
      if (!best || objective < best.objective) {
        best = {
          radius: arc.radius,
          center: arc.center,
          startAngle: arc.startAngle,
          sweepDelta: arc.sweepDelta,
          largeArcFlag: arc.largeArcFlag,
          sweepFlag: arc.sweepFlag,
          sign,
          height,
          fit,
          objective
        };
      }
    }

    for (let signIndex = 0; signIndex < signs.length; signIndex += 1) {
      const sign = signs[signIndex];
      for (let flagIndex = 0; flagIndex < largeFlags.length; flagIndex += 1) {
        const largeArcFlag = largeFlags[flagIndex];
        evaluateHeight(sign, heightMin, largeArcFlag);
        evaluateHeight(sign, initialHeight, largeArcFlag);
        evaluateHeight(sign, heightMax, largeArcFlag);
        for (let sample = 1; sample < settings.fitSamples; sample += 1) {
          const amount = sample / settings.fitSamples;
          evaluateHeight(sign, heightMin + ((heightMax - heightMin) * amount), largeArcFlag);
        }
      }
    }

    if (best) {
      let step = (heightMax - heightMin) / Math.max(4, settings.fitSamples);
      for (let iteration = 0; iteration < settings.fineFitIterations && step > 0.0001; iteration += 1) {
        evaluateHeight(best.sign, Math.max(heightMin, best.height - step), best.largeArcFlag);
        evaluateHeight(best.sign, Math.min(heightMax, best.height + step), best.largeArcFlag);
        evaluateHeight(best.sign, Math.max(heightMin, best.height - (step * 0.5)), best.largeArcFlag);
        evaluateHeight(best.sign, Math.min(heightMax, best.height + (step * 0.5)), best.largeArcFlag);
        step *= 0.5;
      }
    }

    return best;
  }

  function endpointArcForCenter(start, end, center, radius, largeArcFlag) {
    const from = roundedPoint(start);
    const to = roundedPoint(end);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const chord = Math.hypot(dx, dy);
    if (chord <= 0) return null;

    const safeRadius = Math.max(roundPathNumber(radius), (chord / 2) + 0.001);
    const halfChord = chord / 2;
    const heightSq = (safeRadius * safeRadius) - (halfChord * halfChord);
    if (heightSq < -0.001) return null;
    const height = Math.sqrt(Math.max(0, heightSq));
    const midpointX = (from.x + to.x) / 2;
    const midpointY = (from.y + to.y) / 2;
    const perpendicularX = -dy / chord;
    const perpendicularY = dx / chord;
    const centerSign = (((center.x - midpointX) * perpendicularX) + ((center.y - midpointY) * perpendicularY)) < 0 ? -1 : 1;
    const finalCenter = {
      x: midpointX + (perpendicularX * height * centerSign),
      y: midpointY + (perpendicularY * height * centerSign)
    };
    const sweepFlag = centerSign < 0 ? largeArcFlag : 1 - largeArcFlag;
    const startAngle = Math.atan2(from.y - finalCenter.y, from.x - finalCenter.x);
    const endAngle = Math.atan2(to.y - finalCenter.y, to.x - finalCenter.x);
    return {
      radius: safeRadius,
      center: finalCenter,
      startAngle,
      sweepDelta: svgArcSweepDelta(startAngle, endAngle, largeArcFlag, sweepFlag),
      largeArcFlag,
      sweepFlag
    };
  }

  function svgArcSweepDelta(startAngle, endAngle, largeArcFlag, sweepFlag) {
    if (sweepFlag) {
      let delta = normalizePositiveAngle(endAngle - startAngle);
      if (largeArcFlag && delta < Math.PI) delta -= Math.PI * 2;
      if (!largeArcFlag && delta > Math.PI) delta -= Math.PI * 2;
      return delta;
    }
    let delta = -normalizePositiveAngle(startAngle - endAngle);
    if (largeArcFlag && Math.abs(delta) < Math.PI) delta += Math.PI * 2;
    if (!largeArcFlag && Math.abs(delta) > Math.PI) delta += Math.PI * 2;
    return delta;
  }

  function arcSegmentFitError(points, startIndex, endIndex, arc, settings) {
    const span = Math.abs(arc.sweepDelta);
    if (!Number.isFinite(span) || span <= 0.0001 || span >= Math.PI * 2) return null;
    let maxError = 0;
    let totalError = 0;
    let maxAngleOverflow = 0;
    let count = 0;

    function addSample(point) {
      const angle = Math.atan2(point.y - arc.center.y, point.x - arc.center.x);
      const progress = arc.sweepDelta >= 0
        ? normalizePositiveAngle(angle - arc.startAngle)
        : normalizePositiveAngle(arc.startAngle - angle);
      let overflow = 0;
      if (progress > span) {
        overflow = Math.min(progress - span, Math.PI * 2 - progress);
      }
      const radialError = Math.abs(pointDistance(point, arc.center) - arc.radius);
      const error = Math.hypot(radialError, arc.radius * overflow);
      maxAngleOverflow = Math.max(maxAngleOverflow, overflow);
      maxError = Math.max(maxError, error);
      totalError += error;
      count += 1;
    }

    for (let i = startIndex; i <= endIndex; i += 1) {
      addSample(points[i]);
      if (!settings || !settings.sampleArcSegments || i === endIndex) continue;
      const current = points[i];
      const next = points[i + 1];
      const segmentLength = pointDistance(current, next);
      const extraSamples = Math.min(5, Math.floor(segmentLength / Math.max(1.5, arc.radius * 0.018)));
      for (let sampleIndex = 1; sampleIndex <= extraSamples; sampleIndex += 1) {
        const amount = sampleIndex / (extraSamples + 1);
        addSample(lerpPoint(current, next, amount));
      }
    }

    const endpointTangentError = Math.max(
      arcEndpointTangentError(points[startIndex], points[startIndex + 1], arc, true),
      arcEndpointTangentError(points[endIndex], points[endIndex - 1], arc, false)
    );

    return {
      maxError,
      averageError: totalError / count,
      maxAngleOverflow,
      endpointTangentError
    };
  }

  function arcEndpointTangentError(point, adjacent, arc, atStart) {
    if (!point || !adjacent) return 0;
    const angle = atStart ? arc.startAngle : arc.startAngle + arc.sweepDelta;
    const direction = arc.sweepDelta >= 0
      ? { x: -Math.sin(angle), y: Math.cos(angle) }
      : { x: Math.sin(angle), y: -Math.cos(angle) };
    const segment = atStart
      ? { x: adjacent.x - point.x, y: adjacent.y - point.y }
      : { x: point.x - adjacent.x, y: point.y - adjacent.y };
    const segmentLength = Math.hypot(segment.x, segment.y);
    if (segmentLength <= 0.001) return 0;
    const dot = ((direction.x * segment.x) + (direction.y * segment.y)) / segmentLength;
    return Math.acos(Math.max(-1, Math.min(1, dot)));
  }

  function fitCircleFromThreePoints(a, b, c) {
    const ax = a.x;
    const ay = a.y;
    const bx = b.x;
    const by = b.y;
    const cx = c.x;
    const cy = c.y;
    const determinant = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    if (Math.abs(determinant) < 0.0001) return null;

    const aSq = (ax * ax) + (ay * ay);
    const bSq = (bx * bx) + (by * by);
    const cSq = (cx * cx) + (cy * cy);
    const centerX = ((aSq * (by - cy)) + (bSq * (cy - ay)) + (cSq * (ay - by))) / determinant;
    const centerY = ((aSq * (cx - bx)) + (bSq * (ax - cx)) + (cSq * (bx - ax))) / determinant;
    const radius = Math.hypot(ax - centerX, ay - centerY);
    return { x: centerX, y: centerY, cx: centerX, cy: centerY, radius };
  }

  function segmentCurvatureStats(points, startIndex, endIndex) {
    let signedTurn = 0;
    let absoluteTurn = 0;
    let maxTurn = 0;
    let significantTurns = 0;

    for (let i = startIndex + 1; i < endIndex; i += 1) {
      const previous = points[i - 1];
      const current = points[i];
      const next = points[i + 1];
      const ax = current.x - previous.x;
      const ay = current.y - previous.y;
      const bx = next.x - current.x;
      const by = next.y - current.y;
      const aLength = Math.hypot(ax, ay);
      const bLength = Math.hypot(bx, by);
      if (aLength < 0.001 || bLength < 0.001) continue;
      const turn = Math.atan2((ax * by) - (ay * bx), (ax * bx) + (ay * by));
      const absTurn = Math.abs(turn);
      if (absTurn < 0.04) continue;
      signedTurn += turn;
      absoluteTurn += absTurn;
      maxTurn = Math.max(maxTurn, absTurn);
      significantTurns += 1;
    }

    return {
      signedTurn,
      absoluteTurn,
      consistency: absoluteTurn > 0 ? Math.abs(signedTurn) / absoluteTurn : 0,
      maxTurnShare: absoluteTurn > 0 ? maxTurn / absoluteTurn : 1,
      significantTurns
    };
  }

  function segmentTurnConsistency(points, startIndex, endIndex) {
    let totalTurn = 0;
    let totalAbsTurn = 0;
    for (let i = startIndex + 1; i < endIndex; i += 1) {
      const previous = points[i - 1];
      const current = points[i];
      const next = points[i + 1];
      const ax = current.x - previous.x;
      const ay = current.y - previous.y;
      const bx = next.x - current.x;
      const by = next.y - current.y;
      const aLength = Math.hypot(ax, ay);
      const bLength = Math.hypot(bx, by);
      if (aLength < 0.001 || bLength < 0.001) continue;
      const delta = Math.atan2((ax * by) - (ay * bx), (ax * bx) + (ay * by));
      if (Math.abs(delta) < 0.05) continue;
      totalTurn += delta;
      totalAbsTurn += Math.abs(delta);
    }
    if (totalAbsTurn <= 0) return 0;
    return Math.abs(totalTurn) / totalAbsTurn;
  }

  function dotPoint(a, b) {
    return (a.x * b.x) + (a.y * b.y);
  }

  function normalizeAngleDelta(delta) {
    let result = delta;
    while (result > Math.PI) result -= Math.PI * 2;
    while (result < -Math.PI) result += Math.PI * 2;
    return result;
  }

  function normalizePositiveAngle(delta) {
    let result = delta % (Math.PI * 2);
    if (result < 0) result += Math.PI * 2;
    return result;
  }

  function pointDistance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function boundsForPoints(points) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    return { minX, minY, maxX, maxY };
  }

  function pointsToPath(points, cursor) {
    const origin = roundedPoint(cursor || { x: 0, y: 0 });
    const start = roundedPoint(points[0]);
    const commands = [`m${nums(start.x - origin.x, start.y - origin.y)}`];
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
          commands[commands.length - 1] = appendNumberData(commands[commands.length - 1], numsArray(pendingPairs));
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
      const previous = roundedPoint(points[i - 1]);
      const point = roundedPoint(points[i]);
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

  function pointsToSmoothPath(points, previousCursor, strength) {
    const commands = [];
    const curveStrength = Math.max(0, Math.min(1, typeof strength === "number" ? strength : 1));
    const lastIndex = points.length - 1;
    const start = roundedPoint(midpoint(points[lastIndex], points[0]));
    const origin = roundedPoint(previousCursor || { x: 0, y: 0 });
    commands.push(`m${nums(start.x - origin.x, start.y - origin.y)}`);
    let cursor = start;

    for (let i = 0; i < points.length; i += 1) {
      const current = roundedPoint(points[i]);
      const next = points[(i + 1) % points.length];
      const mid = roundedPoint(midpoint(current, next));
      const lineControl = midpoint(cursor, mid);
      const control = roundedPoint(lerpPoint(lineControl, current, curveStrength));
      commands.push(`q${nums(control.x - cursor.x, control.y - cursor.y, mid.x - cursor.x, mid.y - cursor.y)}`);
      cursor = mid;
    }

    commands.push("Z");
    return commands.join("");
  }

  function smoothStartPoint(points) {
    return midpoint(points[points.length - 1], points[0]);
  }

  function roundedPoint(point) {
    return {
      x: roundPathNumber(point.x),
      y: roundPathNumber(point.y)
    };
  }

  function midpoint(a, b) {
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2
    };
  }

  function lerpPoint(a, b, amount) {
    return {
      x: a.x + (b.x - a.x) * amount,
      y: a.y + (b.y - a.y) * amount
    };
  }

  function renderSvgPreview(svg) {
    els.svgPreview.classList.remove(EMPTY_PREVIEW_CLASS);
    els.svgPreview.replaceChildren();
    const template = document.createElement("template");
    template.innerHTML = svg.replace(/^<\?xml[^>]*>\s*/i, "");
    els.svgPreview.appendChild(template.content.cloneNode(true));
    const svgElement = els.svgPreview.querySelector("svg");
    fitPreviewSvg(svgElement);
    resetSvgPreviewState(svgElement);
  }

  function resetSvgPreviewState(svgElement) {
    window.cancelAnimationFrame(state.svgPreviewAnimation);
    state.svgPreviewAnimation = 0;
    const viewBox = svgElement ? readSvgViewport(svgElement) : null;
    state.svgPreviewBaseViewBox = viewBox ? cloneViewBox(viewBox) : null;
    state.svgPreviewCurrentViewBox = viewBox ? cloneViewBox(viewBox) : null;
    state.svgPreviewPreserveAspectRatio = svgElement ? svgElement.getAttribute("preserveAspectRatio") : null;
  }

  function zoomSvgPreview(x, y, scale, duration) {
    const base = state.svgPreviewBaseViewBox;
    const svgElement = els.svgPreview.querySelector("svg");
    if (!base || !svgElement) return;
    svgElement.setAttribute("preserveAspectRatio", "xMidYMid slice");
    const width = base.width / scale;
    const height = base.height / scale;
    const target = {
      x: base.x + (base.width * x) - (width * x),
      y: base.y + (base.height * y) - (height * y),
      width,
      height
    };
    animateSvgPreviewViewBox(svgElement, target, duration);
  }

  function resetSvgPreviewZoom(duration) {
    const base = state.svgPreviewBaseViewBox;
    const svgElement = els.svgPreview.querySelector("svg");
    if (!base || !svgElement) return;
    animateSvgPreviewViewBox(svgElement, base, duration);
  }

  function restoreSvgPreviewAspectRatio() {
    const svgElement = els.svgPreview.querySelector("svg");
    if (!svgElement) return;
    if (state.svgPreviewPreserveAspectRatio) {
      svgElement.setAttribute("preserveAspectRatio", state.svgPreviewPreserveAspectRatio);
    } else {
      svgElement.removeAttribute("preserveAspectRatio");
    }
  }

  function animateSvgPreviewViewBox(svgElement, target, duration) {
    const start = state.svgPreviewCurrentViewBox || readSvgViewport(svgElement);
    if (!start) return;
    window.cancelAnimationFrame(state.svgPreviewAnimation);
    if (duration <= 0) {
      setSvgPreviewViewBox(svgElement, target);
      state.svgPreviewAnimation = 0;
      return;
    }
    const from = cloneViewBox(start);
    const to = cloneViewBox(target);
    const startedAt = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = easeOutCubic(progress);
      const next = {
        x: interpolate(from.x, to.x, eased),
        y: interpolate(from.y, to.y, eased),
        width: interpolate(from.width, to.width, eased),
        height: interpolate(from.height, to.height, eased)
      };
      setSvgPreviewViewBox(svgElement, next);
      if (progress < 1) {
        state.svgPreviewAnimation = window.requestAnimationFrame(tick);
      } else {
        state.svgPreviewAnimation = 0;
      }
    }

    state.svgPreviewAnimation = window.requestAnimationFrame(tick);
  }

  function setSvgPreviewViewBox(svgElement, viewBox) {
    state.svgPreviewCurrentViewBox = cloneViewBox(viewBox);
    svgElement.setAttribute("viewBox", `${previewNum(viewBox.x)} ${previewNum(viewBox.y)} ${previewNum(viewBox.width)} ${previewNum(viewBox.height)}`);
  }

  function cloneViewBox(viewBox) {
    return {
      x: viewBox.x,
      y: viewBox.y,
      width: viewBox.width,
      height: viewBox.height
    };
  }

  function interpolate(from, to, progress) {
    return from + ((to - from) * progress);
  }

  function easeOutCubic(progress) {
    return 1 - Math.pow(1 - progress, 3);
  }

  function fitPreviewSvg(svgElement) {
    if (!svgElement) return;
    const viewport = readSvgViewport(svgElement);
    if (!viewport) return;
    if (!svgElement.hasAttribute("viewBox")) {
      svgElement.setAttribute("viewBox", `${previewNum(viewport.x)} ${previewNum(viewport.y)} ${previewNum(viewport.width)} ${previewNum(viewport.height)}`);
    }

    let box;
    try {
      box = svgElement.getBBox();
    } catch (error) {
      return;
    }
    if (!box || box.width <= 0 || box.height <= 0) return;

    const padding = 2;
    const minX = Math.min(viewport.x, box.x - padding);
    const minY = Math.min(viewport.y, box.y - padding);
    const maxX = Math.max(viewport.x + viewport.width, box.x + box.width + padding);
    const maxY = Math.max(viewport.y + viewport.height, box.y + box.height + padding);
    const width = maxX - minX;
    const height = maxY - minY;
    if (nearlyZero(minX - viewport.x) && nearlyZero(minY - viewport.y) && nearlyZero(width - viewport.width) && nearlyZero(height - viewport.height)) return;
    svgElement.setAttribute("viewBox", `${previewNum(minX)} ${previewNum(minY)} ${previewNum(width)} ${previewNum(height)}`);
  }

  function readSvgViewport(svgElement) {
    const viewBox = svgElement.getAttribute("viewBox");
    if (viewBox) {
      const values = viewBox.trim().split(/[\s,]+/).map(Number);
      if (values.length === 4 && values.every(Number.isFinite) && values[2] > 0 && values[3] > 0) {
        return { x: values[0], y: values[1], width: values[2], height: values[3] };
      }
    }

    const width = svgLength(svgElement.getAttribute("width")) || state.sourceWidth;
    const height = svgLength(svgElement.getAttribute("height")) || state.sourceHeight;
    if (!width || !height) return null;
    return { x: 0, y: 0, width, height };
  }

  function svgLength(value) {
    if (!value) return 0;
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function previewNum(value) {
    const rounded = trimNumber(value);
    return rounded === "-0" ? "0" : rounded;
  }

  function renderPalette(palette) {
    els.swatches.replaceChildren();
    const colors = uniquePalette(palette);
    for (let i = 0; i < colors.length; i += 1) {
      const swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.setProperty("--swatch", colors[i].hex);
      swatch.title = colors[i].hex;
      const picker = document.createElement("input");
      picker.className = "swatch-picker";
      picker.type = "color";
      picker.value = expandHex(colors[i].hex);
      picker.setAttribute("aria-label", `Change ${colors[i].hex}`);
      let currentHex = colors[i].hex;
      picker.addEventListener("input", function () {
        const nextHex = compressHex(picker.value);
        if (applyPaletteColor(currentHex, nextHex, { renderPalette: false })) {
          currentHex = nextHex;
          swatch.style.setProperty("--swatch", nextHex);
          swatch.title = nextHex;
          picker.setAttribute("aria-label", `Change ${nextHex}`);
        }
      });
      picker.addEventListener("change", function () {
        renderPalette(state.palette);
      });
      swatch.appendChild(picker);
      els.swatches.appendChild(swatch);
    }
  }

  function applyPaletteColor(oldHex, newHex, options) {
    if (!state.svg || normalizeHex(oldHex) === normalizeHex(newHex)) return false;
    state.svg = replaceSvgColor(state.svg, oldHex, newHex);
    state.palette = state.palette.map(function (color) {
      return normalizeHex(color.hex) === normalizeHex(oldHex)
        ? Object.assign({}, color, { hex: newHex })
        : color;
    });
    renderSvgPreview(state.svg);
    if (!options || options.renderPalette !== false) renderPalette(state.palette);
    els.sizeStat.textContent = formatSvgSize(new Blob([state.svg]).size, state.sourceBytes);
    setSvgSizeBadge(els.sizeStat.textContent);
    els.colorCount.textContent = String(uniquePalette(state.palette).length);

    const record = imageRecordById(state.activeImageId);
    if (record) {
      record.svg = state.svg;
      record.palette = state.palette;
      record.svgSizeText = els.sizeStat.textContent;
      record.colorCount = uniquePalette(state.palette).length;
    }
    return true;
  }

  function replaceSvgColor(svg, oldHex, newHex) {
    if (normalizeHex(oldHex) === normalizeHex("#000")) {
      return svg
        .replace(/<path\b(?![^>]*\bfill=)/g, `<path fill="${newHex}"`)
        .replace(new RegExp(`(stroke=")${escapeRegExp(oldHex)}(")`, "gi"), `$1${newHex}$2`);
    }
    return svg
      .replace(new RegExp(`(fill=")${escapeRegExp(oldHex)}(")`, "gi"), `$1${newHex}$2`)
      .replace(new RegExp(`(stroke=")${escapeRegExp(oldHex)}(")`, "gi"), `$1${newHex}$2`);
  }

  function normalizeHex(hex) {
    return expandHex(hex).toLowerCase();
  }

  function expandHex(hex) {
    const value = String(hex || "#000000").trim();
    if (/^#[0-9a-f]{3}$/i.test(value)) {
      return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase();
    }
    if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase();
    return "#000000";
  }

  function compressHex(hex) {
    const value = expandHex(hex);
    if (value[1] === value[2] && value[3] === value[4] && value[5] === value[6]) {
      return `#${value[1]}${value[3]}${value[5]}`;
    }
    return value;
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

  function detectedSourceColorCount(result) {
    if (result && Number.isFinite(result.sourceColorCount)) {
      return Math.max(1, Math.round(result.sourceColorCount));
    }
    return Math.max(1, uniquePalette(result && result.palette ? result.palette : []).length);
  }

  function downloadSvg() {
    if (!state.svg) return;
    downloadBlob(new Blob([state.svg], { type: "image/svg+xml;charset=utf-8" }), `${safeFileStem(state.sourceName)}.svg`);
  }

  async function downloadAllSvgs() {
    if (state.images.length < 2 || state.downloadingAll) return;
    window.clearTimeout(state.pendingTimer);
    await waitUntilIdle();
    state.downloadingAll = true;
    renderImageNavigator();
    els.downloadAllButton.textContent = "Preparing ZIP";
    els.downloadAllButton.disabled = true;
    setStatus(`Preparing ${formatImageCount(state.images.length)}...`);

    try {
      const options = readOptions();
      const files = [];
      const usedNames = new Set();

      for (let i = 0; i < state.images.length; i += 1) {
        const record = state.images[i];
        record.status = "Working";
        renderImageNavigator();
        await nextFrame();

        const conversion = convertImageRecord(record, options);
        const bytes = new Blob([conversion.svg]).size;
        const colorCount = uniquePalette(conversion.result.palette).length;
        const sourceColorCount = detectedSourceColorCount(conversion.result);
        record.svg = conversion.svg;
        record.palette = conversion.result.palette;
        record.sourceColorCount = sourceColorCount;
        record.traceText = conversion.raster.wasCapped
          ? `${conversion.raster.width} x ${conversion.raster.height} capped`
          : `${conversion.raster.width} x ${conversion.raster.height}`;
        record.svgSizeText = formatSvgSize(bytes, record.sourceBytes);
        record.detailText = conversion.result.activePixels ? conversionDetails(conversion.result) : "-";
        record.colorCount = colorCount;
        record.status = conversion.result.activePixels ? "Converted" : "Empty";
        files.push({
          name: uniqueSvgFileName(record.name, usedNames),
          content: conversion.svg
        });
      }

      const activeRecord = imageRecordById(state.activeImageId);
      if (activeRecord) {
        activateImage(activeRecord.id);
      }

      const zipBytes = createZip(files);
      downloadBlob(new Blob([zipBytes], { type: "application/zip" }), "bulk-image-to-svg.zip");
      setStatus(`${files.length} SVG files downloaded as ZIP.`);
    } catch (error) {
      console.error(error);
      setStatus(error && error.message ? error.message : "ZIP download failed.");
    } finally {
      state.downloadingAll = false;
      els.downloadAllButton.textContent = "Download All SVGs";
      renderImageNavigator();
    }
  }

  function waitUntilIdle() {
    return new Promise(function (resolve) {
      function check() {
        if (!state.processing) {
          resolve();
          return;
        }
        window.setTimeout(check, 40);
      }
      check();
    });
  }

  function nextFrame() {
    return new Promise(function (resolve) {
      window.requestAnimationFrame(resolve);
    });
  }

  function uniqueSvgFileName(sourceName, usedNames) {
    const stem = safeFileStem(sourceName || "image") || "image";
    let name = `${stem}.svg`;
    let index = 2;
    while (usedNames.has(name.toLowerCase())) {
      name = `${stem}-${index}.svg`;
      index += 1;
    }
    usedNames.add(name.toLowerCase());
    return name;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 500);
  }

  function createZip(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const dateParts = dosDateTime(new Date());

    for (const file of files) {
      const nameBytes = encoder.encode(file.name);
      const contentBytes = encoder.encode(file.content);
      const crc = crc32(contentBytes);
      const localHeader = new Uint8Array(30 + nameBytes.length);
      writeU32(localHeader, 0, 0x04034b50);
      writeU16(localHeader, 4, 20);
      writeU16(localHeader, 6, 0x0800);
      writeU16(localHeader, 8, 0);
      writeU16(localHeader, 10, dateParts.time);
      writeU16(localHeader, 12, dateParts.date);
      writeU32(localHeader, 14, crc);
      writeU32(localHeader, 18, contentBytes.length);
      writeU32(localHeader, 22, contentBytes.length);
      writeU16(localHeader, 26, nameBytes.length);
      localHeader.set(nameBytes, 30);

      const centralHeader = new Uint8Array(46 + nameBytes.length);
      writeU32(centralHeader, 0, 0x02014b50);
      writeU16(centralHeader, 4, 20);
      writeU16(centralHeader, 6, 20);
      writeU16(centralHeader, 8, 0x0800);
      writeU16(centralHeader, 10, 0);
      writeU16(centralHeader, 12, dateParts.time);
      writeU16(centralHeader, 14, dateParts.date);
      writeU32(centralHeader, 16, crc);
      writeU32(centralHeader, 20, contentBytes.length);
      writeU32(centralHeader, 24, contentBytes.length);
      writeU16(centralHeader, 28, nameBytes.length);
      writeU32(centralHeader, 42, offset);
      centralHeader.set(nameBytes, 46);

      localParts.push(localHeader, contentBytes);
      centralParts.push(centralHeader);
      offset += localHeader.length + contentBytes.length;
    }

    const centralOffset = offset;
    const centralSize = centralParts.reduce(function (total, part) {
      return total + part.length;
    }, 0);
    const end = new Uint8Array(22);
    writeU32(end, 0, 0x06054b50);
    writeU16(end, 8, files.length);
    writeU16(end, 10, files.length);
    writeU32(end, 12, centralSize);
    writeU32(end, 16, centralOffset);
    return concatBytes(localParts.concat(centralParts, [end]));
  }

  function dosDateTime(date) {
    return {
      time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
      date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
    };
  }

  function concatBytes(parts) {
    const length = parts.reduce(function (total, part) {
      return total + part.length;
    }, 0);
    const output = new Uint8Array(length);
    let offset = 0;
    for (const part of parts) {
      output.set(part, offset);
      offset += part.length;
    }
    return output;
  }

  function writeU16(buffer, offset, value) {
    buffer[offset] = value & 255;
    buffer[offset + 1] = (value >>> 8) & 255;
  }

  function writeU32(buffer, offset, value) {
    buffer[offset] = value & 255;
    buffer[offset + 1] = (value >>> 8) & 255;
    buffer[offset + 2] = (value >>> 16) & 255;
    buffer[offset + 3] = (value >>> 24) & 255;
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i += 1) {
      crc = CRC32_TABLE[(crc ^ bytes[i]) & 255] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  const CRC32_TABLE = (function () {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i += 1) {
      let value = i;
      for (let bit = 0; bit < 8; bit += 1) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      }
      table[i] = value >>> 0;
    }
    return table;
  })();

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
    loadImage(SAMPLE_IMAGE_DATA_URL, SAMPLE_IMAGE_NAME, SAMPLE_IMAGE_BYTES, false, true);
  }

  function rgbToHex(r, g, b) {
    const long = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    if (long[1] === long[2] && long[3] === long[4] && long[5] === long[6]) {
      return `#${long[1]}${long[3]}${long[5]}`;
    }
    return long;
  }

  function hexToRgb(hex) {
    const normalized = normalizeHex(hex);
    if (normalized.length === 4) {
      return {
        r: Number.parseInt(normalized[1] + normalized[1], 16),
        g: Number.parseInt(normalized[2] + normalized[2], 16),
        b: Number.parseInt(normalized[3] + normalized[3], 16)
      };
    }
    return {
      r: Number.parseInt(normalized.slice(1, 3), 16),
      g: Number.parseInt(normalized.slice(3, 5), 16),
      b: Number.parseInt(normalized.slice(5, 7), 16)
    };
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

  function trimPathNumber(value) {
    return roundPathNumber(value).toString();
  }

  function roundPathNumber(value) {
    const rounded = Number.parseFloat(Number(value).toFixed(outputNumberPrecision));
    return Object.is(rounded, -0) ? 0 : rounded;
  }

  function clampNumberPrecision(value) {
    return Math.max(1, Math.min(8, Number.isFinite(value) ? Math.round(value) : 1));
  }

  function num(value) {
    let rounded = trimPathNumber(value);
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

  function appendNumberData(current, next) {
    const previous = current.match(/-?(?:\d*\.\d+|\d+)$/);
    const incoming = next.match(/-?(?:\d*\.\d+|\d+)/);
    if (!previous || !incoming || !needsNumberSeparator(previous[0], incoming[0])) return current + next;
    return `${current} ${next}`;
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

  function formatSvgSize(svgBytes, originalBytes) {
    const size = formatBytes(svgBytes);
    if (!originalBytes || !svgBytes) return size;
    const change = ((svgBytes - originalBytes) / originalBytes) * 100;
    const sign = change > 0 ? "+" : "";
    return `${size} (${sign}${formatPercent(change)}%)`;
  }

  function formatPercent(value) {
    return value.toFixed(1).replace(".", ",");
  }

  function titleCase(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
  }

  function optionLabel(value) {
    return value === "safe" ? "Light" : titleCase(value);
  }

  function precisionStatus(raster, result, options) {
    const mode = options.mode === "runs" ? "Exact RGBA" : "Trace";
    const cap = raster.wasCapped ? " Processing was capped to protect browser memory." : "";
    return `${mode} SVG ready: ${conversionDetails(result)}.${cap}`;
  }

  function conversionDetails(result) {
    return `${result.activePixels.toLocaleString()} pixels, ${result.paths.length.toLocaleString()} paths`;
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

