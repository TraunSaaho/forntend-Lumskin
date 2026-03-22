
const BACKEND_URL = "https://lumiskin-ai-backend.onrender.com";

/**
 * Health check — call this on page load to verify backend is running.
 * @returns {Promise<boolean>}
 */
async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    const data = await res.json();
    console.log("[Backend] Health check:", data);
    return data.status === "ok";
  } catch {
    console.warn("[Backend] Not reachable. Is Flask running on port 10000?");
    return false;
  }
}

// ─── AUTO-CHECK BACKEND ON PAGE LOAD ────────────────────────────────────────
window.addEventListener("DOMContentLoaded", async () => {
  const ok = await checkBackendHealth();
  // if (!ok) {
  //   showBackendWarning();
  // }
});

function showBackendWarning() {
  const banner = document.createElement("div");
  banner.id = "backend-warning";
  banner.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
    background: #ff4757; color: white; text-align: center;
    padding: 10px; font-size: 14px; font-family: Inter, sans-serif;
  `;
  banner.innerHTML = `
    ⚠️ Backend server not connected. 
    Run: <code style="background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px">cd Backend && source venv_mac/bin/activate && python app.py</code> in your terminal, then refresh.
  `;
  document.body.prepend(banner);
}