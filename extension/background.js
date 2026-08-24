const SERVER_URL = "http://localhost:8000";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "predict") {
    handlePredict(msg.dataUrl).then(sendResponse).catch((err) => sendResponse({ error: err.message }));
    return true;
  }
  if (msg.type === "health") {
    handleHealth().then(sendResponse).catch((err) => sendResponse({ error: err.message }));
    return true;
  }
});

async function handlePredict(dataUrl) {
  const blob = await (await fetch(dataUrl)).blob();
  const form = new FormData();
  form.append("file", blob, "frame.jpg");
  const res = await fetch(`${SERVER_URL}/predict`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`server returned ${res.status}`);
  return await res.json();
}

async function handleHealth() {
  const res = await fetch(`${SERVER_URL}/health`);
  if (!res.ok) throw new Error(`server returned ${res.status}`);
  return await res.json();
}
