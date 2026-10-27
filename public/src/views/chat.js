import { sendToDoraemon } from "../services/chatService.js";
import { playEffect, areEffectsMuted, setEffectsMuted } from "../audio.js";

const STORAGE_KEY = "doraemon-chat-history";
const GREETING = "¡Hola! Soy Doraemon 🔔 ¿En qué te puedo ayudar hoy? ¡Tengo muchos inventos en mi bolsillo!";
const AVATAR_IMG = "/src/assets/img/avatar.jpg";
const GADGET_REGEX = /tatat[aá]+n?|tan,? tan,? tan/i; // respaldo si Gemini olvida la etiqueta

// Imagen de cada invento del catálogo (los ids deben coincidir con GADGETS en server.js)
const GADGET_FALLBACK = "/src/assets/img/gadget.gif";
const GADGET_IMAGES = {
  "puerta-magica": "/src/assets/img/gadgets/puerta-magica.jpg",
  "helice-bambu": "/src/assets/img/gadgets/helice-bambu.jpg",
  "maquina-del-tiempo": "/src/assets/img/gadgets/maquina-del-tiempo.jpg",
  "pan-de-memoria": "/src/assets/img/gadgets/pan-de-memoria.jpg",
  "linterna-reductora": "/src/assets/img/gadgets/linterna-reductora.jpg",
  "gelatina-traductora": "/src/assets/img/gadgets/gelatina-traductora.jpg",
  "panuelo-del-tiempo": "/src/assets/img/gadgets/panuelo-del-tiempo.jpg",
};

// Escena del invento
const GADGET_WAIT_MS = 1800;    // cuánto dura el "sacando el invento..." antes de mostrarlo
const SOUND_AT_REVEAL = false;  // false: suena mientras "busca" · true: suena al aparecer el invento
const LOADING_TEXT = "🔔 Doraemon está buscando en su bolsillo mágico…";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Descarga la imagen antes de mostrarla; si falla, seguimos igual
function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = src;
  });
}

// Imagen del catálogo si existe; si no, insignia con el emoji que eligió Gemini
function buildGadgetFigure(gadget) {
  const figure = document.createElement("figure");
  figure.className = "message__gadgetBox";

  const showBadge = () => {
    const badge = document.createElement("div");
    badge.className = "gadgetBadge";
    badge.textContent = gadget.emoji || "✨";
    figure.prepend(badge);
  };

  const showImage = (src, onFail) => {
    const img = document.createElement("img");
    img.className = "message__gadget";
    img.alt = gadget.name ? `Invento: ${gadget.name}` : "Invento del bolsillo mágico";
    img.addEventListener("error", () => {
      img.remove();
      onFail();
    });
    img.src = src;
    figure.appendChild(img);
  };

  const catalogSrc = GADGET_IMAGES[gadget.id];
  if (catalogSrc) {
    showImage(catalogSrc, showBadge);      // si falta el archivo, cae a la insignia
  } else if (gadget.emoji || gadget.name) {
    showBadge();                            // invento que no está en el catálogo
  } else {
    showImage(GADGET_FALLBACK, () => {});   // sin datos: gif genérico
  }

  if (gadget.name) {
    const caption = document.createElement("figcaption");
    caption.className = "message__gadgetName";
    caption.textContent = gadget.name;
    figure.appendChild(caption);
  }
  return figure;
}

let history = loadHistory();
let isSending = false;

function loadHistory() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch {}
  return [{ role: "model", text: GREETING }];
}

function saveHistory() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
}

export function renderChat() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="chatApp">
      <header class="chatHeader">
        <div class="chatProfile">
          <div class="chatAvatar">
            <img class="chatAvatar__img" src="${AVATAR_IMG}" alt="Doraemon" />
            <span class="chatAvatar__status" title="En línea"></span>
          </div>
          <div>
            <h1 class="chatTitle">Doraemon</h1>
            <p class="chatSubtitle">En línea · Robot gato del futuro</p>
          </div>
        </div>
        <div class="chatActions">
          <button type="button" class="iconBtn" id="muteBtn" title="Silenciar o activar los efectos de sonido">🔊</button>
          <button type="button" class="chatHeader__clear" id="clearChat">Limpiar</button>
        </div>
      </header>
      <div class="chatMessages" id="messages" aria-live="polite"></div>
      <form class="chatComposer" id="composer" autocomplete="off">
        <input class="chatComposer__input" id="input" type="text" maxlength="1000"
               placeholder="Escribe tu mensaje..." aria-label="Mensaje" />
        <button class="chatComposer__send" id="send" type="submit">Enviar</button>
      </form>
    </section>
  `;

  const messagesEl = document.getElementById("messages");
  const form = document.getElementById("composer");
  const input = document.getElementById("input");
  const sendBtn = document.getElementById("send");
  const muteBtn = document.getElementById("muteBtn");
  const avatarImg = app.querySelector(".chatAvatar__img");

  // Si falta la foto, se muestra un emoji dentro del mismo círculo
  avatarImg.addEventListener("error", () => {
    const fallback = document.createElement("span");
    fallback.className = "chatAvatar__fallback";
    fallback.textContent = "🔔";
    avatarImg.replaceWith(fallback);
  });

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addBubble(text, type, { gadget = null } = {}) {
    const div = document.createElement("div");
    div.className = `message message--${type}`;

    if (gadget) div.appendChild(buildGadgetFigure(gadget));

    const span = document.createElement("span");
    span.textContent = text; // textContent evita inyección de HTML
    div.appendChild(span);

    messagesEl.appendChild(div);
    scrollToBottom();
    return div;
  }

  function showTyping() {
    const div = document.createElement("div");
    div.className = "message message--character message--typing";
    div.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(div);
    scrollToBottom();
    return div;
  }

  function setSending(value) {
    isSending = value;
    input.disabled = value;
    sendBtn.disabled = value;
    if (!value) input.focus();
  }

  function updateMuteBtn() {
    muteBtn.textContent = areEffectsMuted() ? "🔇" : "🔊";
  }

  // Pintar historial existente (los inventos también se vuelven a mostrar, sin sonido)
  history.forEach((m) =>
    addBubble(m.text, m.role === "user" ? "user" : "character", { gadget: m.gadget ?? null })
  );
  updateMuteBtn();

  muteBtn.addEventListener("click", () => {
    setEffectsMuted(!areEffectsMuted());
    updateMuteBtn();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || isSending) return;

    input.value = "";
    history.push({ role: "user", text });
    saveHistory();
    addBubble(text, "user");

    setSending(true);
    const typing = showTyping();

    try {
      const { reply, gadget: serverGadget } = await sendToDoraemon(history);

      // Invento que indicó Gemini; si olvidó la etiqueta pero dijo "Tatatáaan", se usa el genérico
      const gadget =
        serverGadget ?? (GADGET_REGEX.test(reply) ? { id: "otro", name: null, emoji: null } : null);

      history.push({ role: "model", text: reply, gadget });
      saveHistory();

      if (gadget) {
        // La burbuja de "escribiendo" se convierte en el aviso de que está sacando el invento
        typing.className = "message message--character message--loading";
        typing.textContent = gadget.name
          ? `🔔 Sacando «${gadget.name}» de su bolsillo mágico…`
          : LOADING_TEXT;
        scrollToBottom();

        if (!SOUND_AT_REVEAL) playEffect("gadget");

        // Espera lo mínimo de la escena y a que la imagen del catálogo esté descargada (máximo 3 s)
        const src = GADGET_IMAGES[gadget.id];
        await Promise.all([
          sleep(GADGET_WAIT_MS),
          src ? Promise.race([preloadImage(src), sleep(3000)]) : null,
        ]);
      }

      typing.remove();
      addBubble(reply, "character", { gadget });
      if (gadget && SOUND_AT_REVEAL) playEffect("gadget");
    } catch (error) {
      typing.remove();
      addBubble(error.message, "error");
      history.pop(); // para poder reintentar sin duplicar
      saveHistory();
      input.value = text;
    } finally {
      setSending(false);
    }
  });

  document.getElementById("clearChat").addEventListener("click", () => {
    if (isSending) return;
    history = [{ role: "model", text: GREETING }];
    saveHistory();
    messagesEl.innerHTML = "";
    addBubble(GREETING, "character");
  });

  input.focus();
}