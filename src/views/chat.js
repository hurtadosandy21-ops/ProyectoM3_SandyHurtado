import { sendToDoraemon } from "../services/chatService.js";

const STORAGE_KEY = "doraemon-chat-history";
const GREETING = "¡Hola! Soy Doraemon 🔔 ¿En qué te puedo ayudar hoy? ¡Tengo muchos inventos en mi bolsillo!";

// El historial vive en memoria y en sessionStorage, así no se pierde al cambiar de vista
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
        <div>
          <h1 class="chatTitle">Doraemon</h1>
          <p class="chatSubtitle">Robot gato del futuro</p>
        </div>
        <button type="button" class="chatHeader__clear" id="clearChat">Limpiar</button>
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

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addBubble(text, type) {
    const div = document.createElement("div");
    div.className = `message message--${type}`;
    div.textContent = text; // textContent evita inyección de HTML
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

  // Pintar historial existente
  history.forEach((m) => addBubble(m.text, m.role === "user" ? "user" : "character"));

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
      addBubble(reply, "character");
    } catch (error) {
      typing.remove();
      addBubble(error.message, "error");
      // Quitamos el último mensaje del usuario para poder reintentar sin duplicar
      history.pop();
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
