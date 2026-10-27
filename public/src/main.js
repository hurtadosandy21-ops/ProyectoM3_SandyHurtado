import { setupLinkInterception } from "./navigation.js";
import { router } from "./router.js";

const themeToggle = document.querySelector("[data-theme-toggle]");
const THEME_KEY = "doraemon-theme";

function applyTheme(theme, persist = false) {
  document.documentElement.dataset.theme = theme;
  themeToggle?.setAttribute("aria-pressed", String(theme === "dark"));
  themeToggle?.setAttribute("aria-label", theme === "dark" ? "Activar modo claro" : "Activar modo oscuro");
  const label = themeToggle?.querySelector("[data-theme-label]");
  if (label) label.textContent = theme === "dark" ? "Modo claro" : "Modo oscuro";
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }
}

let savedTheme = "light";
try {
  savedTheme = localStorage.getItem(THEME_KEY) || "light";
} catch {}
applyTheme(savedTheme === "dark" ? "dark" : "light");
themeToggle?.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme, true);
});

setupLinkInterception();
window.addEventListener("popstate", router);
router();
