# SignDETR Captions

A Chrome extension that overlays live ASL sign captions on Google Meet & Zoom, powered by a locally-trained [SignDETR](https://github.com/nicknochnack/SignDETR) model.

**[Download the extension](https://idiot-sandwich08.github.io/signdetr-captions/)**

## How it works

The extension's content script grabs frames from any `<video>` element on Meet/Zoom, sends them to a background service worker, which posts them to a local SignDETR inference server (`http://localhost:8000/predict`). Detected signs are shown as a floating caption pill under the video.

It requires the [SignDETR](https://github.com/nicknochnack/SignDETR) server running locally — the extension itself has no model or training code baked in, so it keeps working unmodified as the model is retrained with more signs.

## Development

Source lives in [`extension/`](extension). To load it locally:

1. `chrome://extensions` → enable **Developer mode**
2. **Load unpacked** → select the `extension/` folder
