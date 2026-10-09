/** DOM, storage, and shared helpers */

export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function qsAll(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

export function getParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

export function getLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Dismissible status banner at top of main */
export function alertMessage(message, type = "success") {
  const main = qs("main") || document.body;
  const existing = qs(".alert");
  if (existing) existing.remove();

  const el = document.createElement("div");
  el.className = `alert alert--${type}`;
  el.setAttribute("role", "status");
  el.innerHTML = `<span>${escapeHtml(message)}</span><button type="button" class="alert__close" aria-label="Dismiss">×</button>`;
  el.querySelector(".alert__close").addEventListener("click", () => el.remove());
  main.prepend(el);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
