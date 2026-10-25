import { renderHome } from "./views/home.js";
import { renderChat } from "./views/chat.js";
import { renderAbout } from "./views/about.js";
import { renderNotFound } from "./views/notFound.js";
import { stopIntro } from "./audio.js";

const routes = {
  "/": renderHome,
  "/chat": renderChat,
  "/about": renderAbout,
};

function updateActiveLink(path) {
  document.querySelectorAll(".mainNav__link").forEach((link) => {
    link.classList.toggle("mainNav__link--active", link.getAttribute("href") === path);
  });
}

export function router() {
  const path = window.location.pathname;
  const render = routes[path] || renderNotFound;
  stopIntro(); // al cambiar de página siempre se corta la intro; el home la vuelve a iniciar
  updateActiveLink(path);
  render();
}