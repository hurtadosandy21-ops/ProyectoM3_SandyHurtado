import { sendToDoraemon } from "../services/chatService.js";
import { playEffect } from "../audio.js";

const STORAGE_KEY = "doraemon-chat-history"; // compatibilidad con el historial anterior
const CONVERSATIONS_KEY = "doraemon-conversations";
const ACTIVE_CONVERSATION_KEY = "doraemon-active-conversation";
const SKIP_DELETE_CONFIRM_KEY = "doraemon-skip-delete-confirm";
const MAX_CONVERSATIONS = 30;
const GREETING = "¡Hola! Soy Doraemon 🔔 ¿En qué te puedo ayudar hoy? ¡Tengo muchos inventos en mi bolsillo!";
const AVATAR_IMG = "/src/assets/img/avatar.jpg";
const GADGET_REGEX = /tatat[aá]+n?|tan,? tan,? tan/i; // respaldo si Gemini olvida la etiqueta
const TOPICS = {
  ideas: { label: "Ideas prácticas", greeting: "¡Hola! Soy Doraemon 🔔 Cuéntame qué quieres resolver y buscaremos una idea práctica, paso a paso." },
  inventos: { label: "Inventos del futuro", greeting: "¡Hola! Soy Doraemon 🔔 ¿Qué problema o sueño tienes? ¡Mi bolsillo tiene inventos del futuro para ayudarnos!" },
  charla: { label: "Charla amable", greeting: "¡Hola! Soy Doraemon 🔔 Me alegra conversar contigo. ¿Cómo va tu día?" },
};

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

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isKnownTopic(topic) {
  return typeof topic === "string" && Object.hasOwn(TOPICS, topic);
}

function greetingFor(topic) {
  return isKnownTopic(topic) ? TOPICS[topic].greeting : GREETING;
}

function createConversation(topic = null, messages = null) {
  const transcript = messages?.length ? messages : [{ role: "model", text: greetingFor(topic) }];
  const firstUserMessage = transcript.find((message) => message.role === "user" && message.text?.trim());
  return {
    id: makeId(),
    title: firstUserMessage?.text.trim().slice(0, 42) ?? (isKnownTopic(topic) ? TOPICS[topic].label : "Nueva conversación"),
    topic: isKnownTopic(topic) ? topic : null,
    updatedAt: new Date().toISOString(),
    messages: transcript,
  };
}

function loadConversations() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONVERSATIONS_KEY));
    if (Array.isArray(saved) && saved.length) {
      const valid = saved.filter((item) => item && typeof item.id === "string" && Array.isArray(item.messages));
      if (valid.length) return valid;
    }
  } catch {}

  // Migra el chat de la versión anterior para que no se pierda al actualizar.
  try {
    const oldHistory = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    if (Array.isArray(oldHistory) && oldHistory.length) return [createConversation(null, oldHistory)];
  } catch {}
  return [createConversation()];
}

let conversations = loadConversations();
let activeConversationId = null;
try {
  activeConversationId = sessionStorage.getItem(ACTIVE_CONVERSATION_KEY);
} catch {}
let activeConversation = conversations.find((item) => item.id === activeConversationId) ?? conversations[0];
activeConversationId = activeConversation.id;
let history = activeConversation.messages;
let activeTopic = isKnownTopic(activeConversation.topic) ? activeConversation.topic : null;
let isSending = false;

function persistConversations() {
  conversations = conversations.slice(0, MAX_CONVERSATIONS);
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch {}
}

function saveHistory() {
  activeConversation.messages = history;
  activeConversation.topic = activeTopic;
  activeConversation.updatedAt = new Date().toISOString();
  const firstUserMessage = history.find((message) => message.role === "user" && message.text?.trim());
  if (firstUserMessage) {
    activeConversation.title = firstUserMessage.text.trim().slice(0, 42);
  }
  conversations = [activeConversation, ...conversations.filter((item) => item.id !== activeConversationId)];
  persistConversations();
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    sessionStorage.setItem(ACTIVE_CONVERSATION_KEY, activeConversationId);
  } catch {}
}

function selectConversation(conversation) {
  activeConversation = conversation;
  activeConversationId = conversation.id;
  history = conversation.messages;
  activeTopic = isKnownTopic(conversation.topic) ? conversation.topic : null;
  try {
    sessionStorage.setItem(ACTIVE_CONVERSATION_KEY, activeConversationId);
  } catch {}
}

export function renderChat({ topic: requestedTopic } = {}) {
  if (isKnownTopic(requestedTopic)) {
    activeTopic = requestedTopic;
    activeConversation.topic = activeTopic;
    if (history.length === 1 && history[0].role === "model" && history[0].text === GREETING) {
      history = [{ role: "model", text: greetingFor(activeTopic) }];
      saveHistory();
    }
  }
  const topic = activeTopic;
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
            <span class="chatTopic" id="chatTopic"${topic ? "" : " hidden"}>${topic ? TOPICS[topic].label : ""}</span>
          </div>
        </div>
        <div class="chatActions">
          <button type="button" class="iconBtn historyToggle" id="historyToggle" aria-expanded="false" aria-controls="historyPanel" aria-label="Ver historial de conversaciones">☷ <span>Historial</span></button>
          <button type="button" class="chatHeader__clear" id="clearChat">Limpiar</button>
        </div>
      </header>
      <div class="chatLayout">
        <section class="historyPanel" id="historyPanel" hidden aria-label="Conversaciones anteriores">
          <div class="historyPanel__heading">
            <strong>Conversaciones</strong>
            <div><button type="button" id="clearHistory">Vaciar</button><button type="button" id="newConversation">+ Nueva</button></div>
          </div>
          <div class="historyList" id="historyList"></div>
        </section>
        <button type="button" class="historyBackdrop" id="historyBackdrop" aria-label="Cerrar historial" hidden></button>
        <div class="chatConversation">
          <div class="chatMessages" id="messages" aria-live="polite"></div>
          <form class="chatComposer" id="composer" autocomplete="off">
            <input class="chatComposer__input" id="input" type="text" maxlength="1000"
                   placeholder="Escribe tu mensaje..." aria-label="Mensaje" />
            <button class="chatComposer__send" id="send" type="submit">Enviar</button>
          </form>
        </div>
      </div>
      <dialog class="confirmDialog" id="deleteDialog" aria-labelledby="deleteDialogTitle" aria-describedby="deleteDialogMessage">
        <div class="confirmDialog__content">
          <h2 id="deleteDialogTitle">Eliminar conversación</h2>
          <p id="deleteDialogMessage">¿Quieres eliminar esta conversación?</p>
          <label class="confirmDialog__remember"><input type="checkbox" id="skipDeleteConfirm" /> No volver a preguntar</label>
          <div class="confirmDialog__actions">
            <button type="button" class="confirmDialog__cancel" id="cancelDelete">Cancelar</button>
            <button type="button" class="confirmDialog__delete" id="confirmDelete">Eliminar</button>
          </div>
        </div>
      </dialog>
    </section>
  `;

  const messagesEl = document.getElementById("messages");
  const form = document.getElementById("composer");
  const input = document.getElementById("input");
  const sendBtn = document.getElementById("send");
  const historyToggle = document.getElementById("historyToggle");
  const historyPanel = document.getElementById("historyPanel");
  const historyBackdrop = document.getElementById("historyBackdrop");
  const historyList = document.getElementById("historyList");
  const topicBadge = document.getElementById("chatTopic");
  const deleteDialog = document.getElementById("deleteDialog");
  const deleteDialogTitle = document.getElementById("deleteDialogTitle");
  const deleteDialogMessage = document.getElementById("deleteDialogMessage");
  const skipDeleteConfirm = document.getElementById("skipDeleteConfirm");
  const confirmDelete = document.getElementById("confirmDelete");
  const avatarImg = app.querySelector(".chatAvatar__img");

  // Si falta la foto, se muestra un emoji dentro del mismo círculo
  avatarImg.addEventListener("error", () => {
    const fallback = document.createElement("span");
    fallback.className = "chatAvatar__fallback";
    fallback.textContent = "🔔";
    avatarImg.replaceWith(fallback);
  });

  function setHistoryOpen(isOpen) {
    historyPanel.hidden = !isOpen;
    historyBackdrop.hidden = !isOpen;
    historyToggle.setAttribute("aria-expanded", String(isOpen));
  }

  historyBackdrop.addEventListener("click", () => {
    setHistoryOpen(false);
    historyToggle.focus();
  });
  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addBubble(text, type, { gadget = null } = {}) {
    const div = document.createElement("div");
    div.className = `message message--${type}`;

    const span = document.createElement("span");
    span.textContent = text; // textContent evita inyección de HTML
    div.appendChild(span);
    if (gadget) div.appendChild(buildGadgetFigure(gadget));

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


  // Pintar historial existente (los inventos también se vuelven a mostrar, sin sonido)
  history.forEach((m) =>
    addBubble(m.text, m.role === "user" ? "user" : "character", { gadget: m.gadget ?? null })
  );

  function updateActiveConversationView() {
    messagesEl.replaceChildren();
    history.forEach((message) =>
      addBubble(message.text, message.role === "user" ? "user" : "character", { gadget: message.gadget ?? null })
    );
    if (activeTopic) {
      topicBadge.hidden = false;
      topicBadge.textContent = TOPICS[activeTopic].label;
    } else {
      topicBadge.hidden = true;
      topicBadge.textContent = "";
    }
    input.focus();
  }

  function getPreviousConversations() {
    return conversations
      .filter((conversation) => conversation.messages.some((message) => message.role === "user"))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  function renderConversationList() {
    historyList.replaceChildren();
    const previous = getPreviousConversations();
    document.getElementById("clearHistory").disabled = previous.length === 0;

    if (!previous.length) {
      const empty = document.createElement("p");
      empty.className = "historyEmpty";
      empty.textContent = "Tus conversaciones aparecerán aquí.";
      historyList.appendChild(empty);
      return;
    }

    previous.forEach((conversation) => {
      const row = document.createElement("div");
      row.className = "historyRow";
      const item = document.createElement("button");
      item.type = "button";
      item.className = `historyItem${conversation.id === activeConversationId ? " historyItem--active" : ""}`;
      item.setAttribute("aria-current", conversation.id === activeConversationId ? "true" : "false");
      const title = document.createElement("strong");
      title.textContent = conversation.title || "Conversación";
      const preview = document.createElement("span");
      const lastMessage = [...conversation.messages].reverse().find((message) => message.role === "user" || message.role === "model");
      preview.textContent = lastMessage?.text ?? "Sin mensajes";
      const date = document.createElement("small");
      date.textContent = new Intl.DateTimeFormat("es", { dateStyle: "short", timeStyle: "short" }).format(new Date(conversation.updatedAt));
      item.append(title, preview, date);
      item.addEventListener("click", () => {
        if (isSending) return;
        selectConversation(conversation);
        updateActiveConversationView();
        renderConversationList();
        setHistoryOpen(false);
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "historyDelete";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Eliminar conversación: ${conversation.title || "Conversación"}`);
      remove.title = "Eliminar conversación";
      remove.addEventListener("click", () => requestDelete(conversation.id));
      row.append(item, remove);
      historyList.appendChild(row);
    });
  }

  let pendingDeletion = null;

  function requestDelete(target) {
    pendingDeletion = target;
    let skipConfirmation = false;
    try { skipConfirmation = localStorage.getItem(SKIP_DELETE_CONFIRM_KEY) === "1"; } catch {}
    if (skipConfirmation) {
      performDeletion(target);
      return;
    }

    const deleteAll = target === "all";
    deleteDialogTitle.textContent = deleteAll ? "Vaciar historial" : "Eliminar conversación";
    deleteDialogMessage.textContent = deleteAll
      ? "Se eliminarán todas las conversaciones guardadas en este navegador. ¿Quieres continuar?"
      : "Esta conversación se eliminará del historial y no se podrá recuperar. ¿Quieres continuar?";
    skipDeleteConfirm.checked = false;
    confirmDelete.textContent = deleteAll ? "Vaciar historial" : "Eliminar";
    if (typeof deleteDialog.showModal === "function") {
      deleteDialog.showModal();
    } else if (window.confirm(deleteDialogMessage.textContent)) {
      performDeletion(target);
    }
  }

  function performDeletion(target) {
    if (target === "all") {
      conversations = [];
      activeConversation = createConversation(activeTopic);
      conversations.push(activeConversation);
      activeConversationId = activeConversation.id;
      history = activeConversation.messages;
      try { sessionStorage.setItem(ACTIVE_CONVERSATION_KEY, activeConversationId); } catch {}
    } else {
      conversations = conversations.filter((conversation) => conversation.id !== target);
      if (activeConversationId === target) {
        activeConversation = createConversation(activeTopic);
        activeConversationId = activeConversation.id;
        history = activeConversation.messages;
        conversations.unshift(activeConversation);
        try { sessionStorage.setItem(ACTIVE_CONVERSATION_KEY, activeConversationId); } catch {}
      }
    }
    persistConversations();
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      sessionStorage.setItem(ACTIVE_CONVERSATION_KEY, activeConversationId);
    } catch {}
    updateActiveConversationView();
    renderConversationList();
    if (getPreviousConversations().length === 0) {
      setHistoryOpen(false);
    }
  }

  historyToggle.addEventListener("click", () => {
    const isOpen = historyPanel.hidden;
    setHistoryOpen(isOpen);
    if (isOpen) renderConversationList();
  });

  document.getElementById("newConversation").addEventListener("click", () => {
    if (isSending) return;
    activeConversation = createConversation(activeTopic);
    activeConversationId = activeConversation.id;
    history = activeConversation.messages;
    conversations = [activeConversation, ...conversations];
    persistConversations();
    try { sessionStorage.setItem(ACTIVE_CONVERSATION_KEY, activeConversationId); } catch {}
    updateActiveConversationView();
    renderConversationList();
    setHistoryOpen(false);
  });

  document.getElementById("clearHistory").addEventListener("click", () => {
    if (!isSending && getPreviousConversations().length) requestDelete("all");
  });

  document.getElementById("cancelDelete").addEventListener("click", () => {
    pendingDeletion = null;
    deleteDialog.close();
  });

  confirmDelete.addEventListener("click", () => {
    if (!pendingDeletion) return;
    if (skipDeleteConfirm.checked) {
      try { localStorage.setItem(SKIP_DELETE_CONFIRM_KEY, "1"); } catch {}
    }
    const target = pendingDeletion;
    pendingDeletion = null;
    deleteDialog.close();
    performDeletion(target);
  });

  deleteDialog.addEventListener("click", (event) => {
    if (event.target === deleteDialog) {
      pendingDeletion = null;
      deleteDialog.close();
    }
  });


  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || isSending) return;

    input.value = "";
    history.push({ role: "user", text });
    saveHistory();
    addBubble(text, "user");
    if (!historyPanel.hidden) renderConversationList();

    setSending(true);
    const typing = showTyping();

    try {
      const { reply, gadget: serverGadget } = await sendToDoraemon(history, topic);

      // Invento que indicó Gemini; si olvidó la etiqueta pero dijo "Tatatáaan", se usa el genérico
      const gadget =
        serverGadget ?? (GADGET_REGEX.test(reply) ? { id: "otro", name: null, emoji: null } : null);

      history.push({ role: "model", text: reply, gadget });
      saveHistory();
      if (!historyPanel.hidden) renderConversationList();

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
      if (!historyPanel.hidden) renderConversationList();
      input.value = text;
    } finally {
      setSending(false);
    }
  });

  document.getElementById("clearChat").addEventListener("click", () => {
    if (isSending) return;
    history = [{ role: "model", text: greetingFor(activeTopic) }];
    saveHistory();
    messagesEl.innerHTML = "";
    addBubble(history[0].text, "character");
    if (!historyPanel.hidden) renderConversationList();
  });

  input.focus();
}