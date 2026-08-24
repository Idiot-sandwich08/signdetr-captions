const toggle = document.getElementById("enabled-toggle");
const statusEl = document.getElementById("status");

chrome.storage.local.get("enabled", (r) => {
  toggle.checked = r.enabled !== false;
});

toggle.addEventListener("change", () => {
  chrome.storage.local.set({ enabled: toggle.checked });
});

checkHealth();

function checkHealth() {
  statusEl.textContent = "checking…";
  statusEl.className = "";
  chrome.runtime.sendMessage({ type: "health" }, (res) => {
    if (chrome.runtime.lastError || !res || res.error) {
      statusEl.textContent = "server unreachable — is it running on :8000?";
      statusEl.className = "err";
      return;
    }
    statusEl.textContent = `connected · classes: ${(res.classes || []).join(", ")}`;
    statusEl.className = "ok";
  });
}
