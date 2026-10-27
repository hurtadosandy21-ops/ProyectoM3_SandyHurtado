import { router } from "./router.js";

const SOUND_NOTICE_KEY = "doraemon-sound-notice-hidden";

export function navigateTo(path) {
  history.pushState(null, "", path);
  router();
}

function hasHiddenSoundNotice() {
  try {
    return localStorage.getItem(SOUND_NOTICE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setupLinkInterception() {
  const dialog = document.getElementById("soundNoticeDialog");
  const rememberNotice = document.getElementById("rememberSoundNotice");
  let pendingChatPath = null;

  function requestNavigation(path) {
    if (window.location.pathname === "/chat" || hasHiddenSoundNotice() || !dialog?.showModal) {
      navigateTo(path);
      return;
    }
    pendingChatPath = path;
    rememberNotice.checked = false;
    if (!dialog.open) dialog.showModal();
  }

  document.getElementById("continueSoundNotice")?.addEventListener("click", () => {
    const path = pendingChatPath;
    pendingChatPath = null;
    if (rememberNotice.checked) {
      try { localStorage.setItem(SOUND_NOTICE_KEY, "1"); } catch {}
    }
    dialog.close();
    if (path) navigateTo(path);
  });

  document.getElementById("cancelSoundNotice")?.addEventListener("click", () => {
    pendingChatPath = null;
    dialog.close();
  });

  dialog?.addEventListener("cancel", () => {
    pendingChatPath = null;
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target === "_blank") return;
    if (link.origin !== window.location.origin) return;
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    event.preventDefault();
    const target = new URL(href, window.location.href);
    const path = `${target.pathname}${target.search}${target.hash}`;
    if (target.pathname === "/chat") requestNavigation(path);
    else navigateTo(path);
  });

  window.addEventListener("popstate", () => {
    if (window.location.pathname === "/chat" && !hasHiddenSoundNotice() && dialog?.showModal) {
      pendingChatPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      history.replaceState(null, "", "/");
      router();
      dialog.showModal();
      return;
    }
    router();
  });

  if (window.location.pathname === "/chat" && !hasHiddenSoundNotice() && dialog?.showModal) {
    pendingChatPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    history.replaceState(null, "", "/");
    dialog.showModal();
  }
}