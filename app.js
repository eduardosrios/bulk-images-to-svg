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
  const SAMPLE_IMAGE_NAME = "4538685.png";
  const SAMPLE_IMAGE_BYTES = 16679;
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
      els.shapeDetect,
      els.minRegion,
      els.seamFix,
      els.numberPrecision,
      els.matte
    ].forEach(function (control) {
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
    els.shapeDetectValue.textContent = exactMode ? "N/A" : titleCase(els.shapeDetect.value);
    els.minRegionValue.textContent = exactMode ? "N/A" : `${els.minRegion.value} px`;
    els.seamFixValue.textContent = exactMode ? "N/A" : Number(els.seamFix.value).toFixed(2);
    els.numberPrecisionValue.textContent = exactMode ? "N/A" : els.numberPrecision.value;
  }

  function syncControlAvailability(exactMode) {
    setControlDisabled(els.paletteSize, exactMode);
    setControlDisabled(els.mergeColors, exactMode);
    setControlDisabled(els.simplify, exactMode);
    setControlDisabled(els.curveFit, exactMode);
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
    setOutputBadge("Idle");
    setOriginalBadge("Waiting", state.sourceName);
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
    setOriginalBadge("Loaded", state.sourceName);
    els.traceStat.textContent = record.traceText || "-";
    els.sizeStat.textContent = record.svgSizeText || "-";
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

        state.svg = svg;
        state.palette = result.palette;
        renderSvgPreview(svg);
        renderPalette(result.palette);

        const bytes = new Blob([svg]).size;
        els.traceStat.textContent = raster.wasCapped
          ? `${raster.width} x ${raster.height} capped`
          : `${raster.width} x ${raster.height}`;
        els.sizeStat.textContent = formatSvgSize(bytes, state.sourceBytes);
        els.detailStat.textContent = result.activePixels ? conversionDetails(result) : "-";
        els.colorCount.textContent = String(uniquePalette(result.palette).length);
        setOutputBadge(result.activePixels ? "Converted" : "Empty");
        els.downloadButton.disabled = !svg;
        els.copyButton.disabled = !svg;
        const finishedRecord = imageRecordById(processingImageId);
        if (finishedRecord) {
          finishedRecord.svg = svg;
          finishedRecord.palette = result.palette;
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
      activePixels: quantized.activePixels
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
      const canCurve = tolerance > 0 && options.curveFit > 0;
      parts.push(canCurve ? pointsToSmoothPath(points, cursor, options.curveFit) : pointsToPath(points, cursor));
      cursor = canCurve ? roundedPoint(smoothStartPoint(points)) : roundedPoint(points[0]);
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

    if (options.mergeColors > 0 && palette.length > 1) {
      return mergeSimilarColors(indexMap, palette, activeIndices.length, options.mergeColors);
    }

    return { indexMap, palette, activePixels: activeIndices.length };
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
    const maxError = mode === "aggressive" ? Math.max(2.8, radius * 0.28) : Math.max(2, radius * 0.22);
    let totalError = 0;

    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      const error = Math.abs(Math.hypot(point.x - cx, point.y - cy) - radius);
      totalError += error;
      if (error > maxError) return null;
    }

    if (totalError / points.length > maxError * 0.65) return null;
    return circlePath(cx, cy, radius);
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
      return circlePath(cx, cy, Math.min(rx, ry));
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
        record.svg = conversion.svg;
        record.palette = conversion.result.palette;
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

