import { renderHome } from "./views/home.js";
import { renderChat } from "./views/chat.js";
import { renderAbout } from "./views/about.js";
import { renderNotFound } from "./views/notFound.js";

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
  updateActiveLink(path);
  render();
}
