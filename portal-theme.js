(() => {
  "use strict";
  const key = "assistencia-portal-theme";
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  let preference = "system";
  try { const saved = localStorage.getItem(key); if (["system", "light", "dark"].includes(saved)) preference = saved; } catch { /* Private browsing may disable storage; use the system theme. */ }
  const apply = () => {
    document.documentElement.dataset.portalTheme = preference === "system" ? (media.matches ? "dark" : "light") : preference;
  };
  apply();
  media.addEventListener("change", apply);
  document.addEventListener("DOMContentLoaded", () => {
    const control = document.createElement("label");
    control.className = "portal-theme-control";
    const caption = document.createElement("span");
    caption.textContent = "Aparência";
    const select = document.createElement("select");
    select.setAttribute("aria-label", "Tema da página");
    for (const [value, text] of [["system", "Automático"], ["light", "Claro"], ["dark", "Escuro"]]) {
      const option = document.createElement("option"); option.value = value; option.textContent = text; select.append(option);
    }
    select.value = preference;
    select.addEventListener("change", () => { preference = select.value; try { localStorage.setItem(key, preference); } catch { /* Keep the choice for this page when storage is unavailable. */ } apply(); });
    control.append(caption, select);
    document.body.prepend(control);
  });
})();
