import { sendToDoraemon } from "../services/chatService.js";
import { playEffect, areEffectsMuted, setEffectsMuted } from "../audio.js";

const STORAGE_KEY = "doraemon-chat-history";
const GREETING = "¡Hola! Soy Doraemon 🔔 ¿En qué te puedo ayudar hoy? ¡Tengo muchos inventos en mi bolsillo!";
const AVATAR_IMG = "./src/assets/img/Doraemonavatar.jpg";
const GADGET_IMG = "./src/assets/img/doraemonportada.jpg";
const GADGET_REGEX = /tatat[aá]+n?|tan,? tan,? tan/i;

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

  function addBubble(text, type, { gadget = false } = {}) {
    const div = document.createElement("div");
    div.className = `message message--${type}`;

    if (gadget) {
      const img = document.createElement("img");
      img.className = "message__gadget";
      img.src = GADGET_IMG;
      img.alt = "Gadget saliendo del bolsillo mágico";
      img.addEventListener("error", () => img.remove());
      div.appendChild(img);
    }

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

  // Pintar historial existente
  history.forEach((m) => addBubble(m.text, m.role === "user" ? "user" : "character"));
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
      const reply = await sendToDoraemon(history);
      typing.remove();
      history.push({ role: "model", text: reply });
      saveHistory();

      const hasGadget = GADGET_REGEX.test(reply);
      addBubble(reply, "character", { gadget: hasGadget });
      if (hasGadget) playEffect("gadget");
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