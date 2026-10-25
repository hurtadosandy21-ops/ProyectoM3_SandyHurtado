import { router } from "./router.js";

export function navigateTo(path) {
    history.pushState(null, "", path);

    router();
}

export function setupLinkInterception() {
    document.addEventListener("click", (event) => {
        const link = event.target.closest("a");
        if (!link) return;

        const href = link.getAttribute("href");
        if (!href) return;

        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        if (link.target === "_blank") return;

        if (link.origin !== window.location.origin) return;

        if (href.startsWith("#")|| href.startsWith("mailto:") || href.startsWith("tel:")) return;

        event.preventDefault();
        navigateTo(href);
        
        
    });
}