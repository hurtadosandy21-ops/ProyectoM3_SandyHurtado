const MUTE_KEY = "doraemon-effects-muted";
const UNLOCK_EVENTS = ["pointerdown", "keydown"];

function createAudio(src, volume, loop = false) {
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.volume = volume;
  audio.loop = loop;
  audio.addEventListener("error", () =>
    console.warn(`[audio] No se pudo cargar ${src}. Revisa el nombre y la carpeta.`)
  );
  return audio;
}

const sounds = {
  intro: createAudio("/src/assets/audio/introduccion.mp3", 0.35, true),
  gadget: createAudio("/src/assets/audio/gadget.mp3", 0.8),
};

let effectsMuted = readMuted();
let unlockHandler = null;
let introListener = null;

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

["play", "pause"].forEach((type) =>
  sounds.intro.addEventListener(type, () => introListener?.())
);

/* ---------- Efectos (gadget) ---------- */

export function areEffectsMuted() {
  return effectsMuted;
}

export function setEffectsMuted(value) {
  effectsMuted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {}
  if (value) {
    sounds.gadget.pause();
    sounds.gadget.currentTime = 0;
  }
}

export async function playEffect(name = "gadget") {
  if (effectsMuted || name === "intro") return false;
  const sound = sounds[name];
  if (!sound) return false;
  try {
    sound.currentTime = 0;
    await sound.play();
    return true;
  } catch (err) {
    console.warn(`[audio] No se pudo reproducir "${name}":`, err.name);
    return false;
  }
}

/* ---------- Música de introducción (home) ---------- */

export function setIntroListener(callback) {
  introListener = callback;
}

export function isIntroPlaying() {
  return !sounds.intro.paused;
}

function removeUnlock() {
  if (!unlockHandler) return;
  UNLOCK_EVENTS.forEach((type) => document.removeEventListener(type, unlockHandler));
  unlockHandler = null;
}

// Si el navegador bloquea el autoplay, la música arranca con el primer gesto del usuario
function armUnlock() {
  if (unlockHandler) return;
  unlockHandler = (event) => {
    // Un clic en un enlace o en el botón de música no debe encender la música
    if (event.target instanceof Element && event.target.closest("a, #musicBtn")) return;
    removeUnlock();
    sounds.intro.play().catch(() => {});
  };
  UNLOCK_EVENTS.forEach((type) => document.addEventListener(type, unlockHandler));
}

export async function startIntro() {
  if (isIntroPlaying()) return true;
  try {
    await sounds.intro.play();
    return true;
  } catch (err) {
    if (err.name === "NotAllowedError") armUnlock();
    else if (err.name !== "AbortError") console.warn("[audio] intro:", err.name, err.message);
    return false;
  }
}

export function stopIntro() {
  removeUnlock();
  sounds.intro.pause();
  sounds.intro.currentTime = 0;
}

export async function toggleIntro() {
  removeUnlock();
  if (isIntroPlaying()) {
    sounds.intro.pause();
    return false;
  }
  try {
    await sounds.intro.play();
    return true;
  } catch (err) {
    console.warn("[audio] intro:", err.name, err.message);
    return false;
  }
}