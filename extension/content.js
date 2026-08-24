const POLL_MS = 600;
const MIN_VIDEO_SIZE = 80; // skip tiny thumbnail tiles

let enabled = true;
chrome.storage.local.get("enabled", (r) => {
  enabled = r.enabled !== false;
});
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) enabled = changes.enabled.newValue;
});

const overlays = new WeakMap(); // video element -> caption div
const captureCanvas = document.createElement("canvas");
const captureCtx = captureCanvas.getContext("2d");
const inFlight = new WeakSet(); // videos currently awaiting a prediction

function ensureOverlay(video) {
  let ov = overlays.get(video);
  if (ov && document.body.contains(ov)) return ov;
  ov = document.createElement("div");
  ov.className = "signdetr-caption";
  document.body.appendChild(ov);
  overlays.set(video, ov);
  return ov;
}

function positionOverlay(video, ov) {
  const rect = video.getBoundingClientRect();
  ov.style.left = `${rect.left + rect.width / 2}px`;
  ov.style.top = `${rect.bottom - 12}px`;
}

function showCaption(video, text, color) {
  const ov = ensureOverlay(video);
  positionOverlay(video, ov);
  if (!text) {
    ov.classList.remove("visible");
    return;
  }
  ov.textContent = text;
  ov.style.setProperty("--signdetr-color", color || "#2f5fd6");
  ov.classList.add("visible");
}

function processVideo(video) {
  if (video.readyState < 2 || video.videoWidth < MIN_VIDEO_SIZE) return;
  if (inFlight.has(video)) return;
  inFlight.add(video);

  captureCanvas.width = video.videoWidth;
  captureCanvas.height = video.videoHeight;
  captureCtx.drawImage(video, 0, 0);
  const dataUrl = captureCanvas.toDataURL("image/jpeg", 0.7);

  chrome.runtime.sendMessage({ type: "predict", dataUrl }, (res) => {
    inFlight.delete(video);
    if (chrome.runtime.lastError || !res || res.error) return;
    const dets = res.detections || [];
    if (dets.length === 0) {
      showCaption(video, null);
      return;
    }
    const best = dets.reduce((a, b) => (b.confidence > a.confidence ? b : a));
    const color = best.color ? `rgb(${best.color.join(",")})` : undefined;
    showCaption(video, `${best.class} · ${(best.confidence * 100).toFixed(0)}%`, color);
  });
}

function tick() {
  if (!enabled) return;
  document.querySelectorAll("video").forEach(processVideo);
}

setInterval(tick, POLL_MS);

function repositionAll() {
  document.querySelectorAll("video").forEach((video) => {
    const ov = overlays.get(video);
    if (ov) positionOverlay(video, ov);
  });
}

window.addEventListener("scroll", repositionAll, true);
window.addEventListener("resize", repositionAll);
