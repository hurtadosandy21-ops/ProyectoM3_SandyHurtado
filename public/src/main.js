import { areEffectsMuted, setEffectsMuted } from './audio.js';
import { setupLinkInterception } from "./navigation.js";
import { router } from "./router.js";

const themeToggle = document.querySelector("[data-theme-toggle]");
const soundToggle = document.querySelector("[data-sound-toggle]");
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
function updateSoundToggle() {
  const muted = areEffectsMuted();
  const icon = soundToggle?.querySelector("[data-sound-icon]");
  if (icon) icon.textContent = muted ? "🔇" : "🔊";
  soundToggle?.setAttribute("aria-pressed", String(!muted));
  soundToggle?.setAttribute("title", muted ? "Activar música y efectos de sonido" : "Silenciar música y efectos de sonido");
}

soundToggle?.addEventListener("click", () => {
  setEffectsMuted(!areEffectsMuted());
  updateSoundToggle();
});
updateSoundToggle();

const recommendationToggle = document.querySelector("[data-recommendation-toggle]");
const recommendationDialog = document.getElementById("recommendationDialog");
document.querySelector("[data-recommendation-toggle]")?.addEventListener("click", () => {
  if (!recommendationDialog?.open) recommendationDialog?.showModal();
  recommendationToggle?.setAttribute("aria-expanded", String(Boolean(recommendationDialog?.open)));
});
document.querySelector("[data-close-recommendations]")?.addEventListener("click", () => recommendationDialog?.close());
document.querySelectorAll("[data-recommendation-choice]").forEach((link) => {
  link.addEventListener("click", () => recommendationDialog?.close());
});
recommendationDialog?.addEventListener("close", () => recommendationToggle?.setAttribute("aria-expanded", "false"));
recommendationDialog?.addEventListener("click", (event) => {
  if (event.target === recommendationDialog) recommendationDialog.close();
});

setupLinkInterception();
router();