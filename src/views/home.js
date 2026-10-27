import {
  startIntro,
  stopIntro,
  toggleIntro,
  isIntroPlaying,
  introFailed,
  setIntroListener,
} from "../audio.js";

const HERO_IMG = "/src/assets/img/portada.jpg";
const INTRO_DONE_KEY = "doraemon-intro-done";
const HINT_WAITING = "🎵 Haz clic en cualquier parte para escuchar la intro. El botón aparecerá al terminar.";
const HINT_PLAYING = "🎵 Sonando la intro… el botón aparecerá al terminar.";

function wasIntroHeard() {
  try {
    return sessionStorage.getItem(INTRO_DONE_KEY) === "1";
  } catch {
    return false;
  }
}

export function renderHome() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <section class="view view--home hero">
      <button type="button" class="musicBtn" id="musicBtn">🎵 Activar música</button>

      <div class="heroStage" id="heroStage">
        <img class="hero__img" src="${HERO_IMG}" alt="Doraemon" />
        <div class="heroStage__overlay">
          <a class="btn btn--primary is-hidden" id="startBtn" href="/chat">Empezar a chatear</a>
        </div>
      </div>

      <h1>Chatea con Doraemon</h1>
      <p>El robot gato del futuro tiene inventos para ti en su bolsillo mágico</p>

      <div id="introGate">
        <p class="introHint" id="introHint">${HINT_WAITING}</p>
        <button type="button" class="skipBtn" id="skipBtn">Saltar intro</button>
      </div>
    </section>
  `;

  const stage = document.getElementById("heroStage");
  const img = stage.querySelector(".hero__img");
  const musicBtn = document.getElementById("musicBtn");
  const gate = document.getElementById("introGate");
  const hint = document.getElementById("introHint");
  const skipBtn = document.getElementById("skipBtn");
  const startBtn = document.getElementById("startBtn");

  // Si la imagen falla, queda un recuadro para que el botón no se pierda
  img.addEventListener("error", () => {
    console.warn(`[img] No se pudo cargar ${HERO_IMG}. Revisa el nombre y la carpeta.`);
    img.remove();
    stage.classList.add("heroStage--noimg");
  });

  let introDone = false;

  function updateMusicBtn() {
    if (isIntroPlaying()) musicBtn.textContent = "⏸️ Pausar música";
    else musicBtn.textContent = introDone ? "🔁 Escuchar de nuevo" : "🎵 Activar música";
  }

  function revealStart() {
    if (introDone) return;
    introDone = true;
    try {
      sessionStorage.setItem(INTRO_DONE_KEY, "1");
    } catch {}
    gate.classList.add("is-hidden");
    startBtn.classList.remove("is-hidden");
    startBtn.classList.add("btn--reveal");
    stage.classList.add("heroStage--revealed");
  }

  // El audio avisa cuando empieza, se pausa, termina o falla
  setIntroListener((type) => {
    if (!document.body.contains(startBtn)) return; // ya cambiaste de página
    if (type === "play" && !introDone) hint.textContent = HINT_PLAYING;
    if (type === "pause" || type === "ended" || type === "error") revealStart();
    updateMusicBtn();
  });

  musicBtn.addEventListener("click", () => toggleIntro());

  skipBtn.addEventListener("click", () => {
    stopIntro();
    revealStart();
    updateMusicBtn();
  });

  if (wasIntroHeard() || introFailed()) {
    revealStart(); // ya la escuchaste en esta sesión, o el audio no cargó
  } else {
    startIntro(); // si el navegador lo bloquea, arranca con el primer clic o tecla
  }
  updateMusicBtn();
}