import {
  startIntro,
  stopIntro,
  toggleIntro,
  isIntroPlaying,
  introFailed,
  setIntroListener,
} from "../audio.js";

const HERO_IMG = "/src/assets/img/portada.jpg";
const HINT_WAITING = "Intentando reproducir la intro. Si tu navegador bloquea el inicio automático, toca «Activar música» o salta la intro.";
const HINT_PLAYING = "La música de introducción está sonando. Puedes desactivarla cuando quieras.";


export function renderHome() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <section class="view view--home hero pageShell">
      <div class="heroCopy heroCopy--heading">
        <p class="eyebrow"><span class="eyebrow__dot"></span> Un amigo del futuro</p>
        <h1>Una idea nueva puede <span>cambiarlo todo.</span></h1>
      </div>

      <figure class="heroStage" id="heroStage">
        <div class="heroStage__frame">
          <img class="hero__img" src="${HERO_IMG}" alt="Doraemon, el amigo robot del futuro" tabindex="0" role="button" aria-label="Toca la imagen para mostrar el botón de chat" />
          <div class="heroStage__overlay">
            <span class="heroStage__badge"><span aria-hidden="true">●</span><span class="heroStage__badgeLabel" id="heroBadgeLabel">Toca la imagen para empezar</span></span>
            <a class="btn btn--primary is-hidden" id="startBtn" href="/chat">Empezar a chatear <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <figcaption><span class="heroStage__captionMark" aria-hidden="true">🔔</span> Tu compañero cósmico, siempre cerca.</figcaption>
      </figure>

      <div class="heroCopy heroCopy--details">
        <p class="heroCopy__text">
          Comparte lo que tienes en mente con Doraemon. Su bolsillo mágico siempre guarda
          una idea, un invento o unas palabras que pueden ayudarte.
        </p>
        <div class="heroFeatures" aria-label="Elige cómo empezar">
          <a href="/chat?tema=ideas"><b aria-hidden="true">✦</b> Ideas prácticas <span aria-hidden="true">↗</span></a>
          <a href="/chat?tema=inventos"><b aria-hidden="true">✦</b> Inventos del futuro <span aria-hidden="true">↗</span></a>
          <a href="/chat?tema=charla"><b aria-hidden="true">✦</b> Una charla amable <span aria-hidden="true">↗</span></a>
        </div>
        <div class="introPanel" id="introGate">
          <div class="introPanel__controls">
            <button type="button" class="musicBtn" id="musicBtn">
              <span aria-hidden="true">♫</span> Activar música
            </button>
            <button type="button" class="skipBtn" id="skipBtn">Saltar intro</button>
          </div>
          <p class="introHint" id="introHint">${HINT_WAITING}</p>
          <p class="introCredit">Tema: <em>Doraemon no Uta</em>. Música: <strong>Shunsuke Kikuchi</strong>. <a href="/about">Ver créditos</a>.</p>
        </div>
      </div>
    </section>
    <section class="welcomeStrip pageShell" aria-label="Bienvenida">
      <span class="welcomeStrip__icon" aria-hidden="true">✧</span>
      <p><strong>¿Qué te gustaría resolver hoy?</strong><span>Empieza una conversación y descubre qué guarda Doraemon en su bolsillo.</span></p>
      <a href="/chat" class="welcomeStrip__link">Conocer el chat <span aria-hidden="true">↗</span></a>
    </section>
  `;

  const stage = document.getElementById("heroStage");
  const img = stage.querySelector(".hero__img");
  const musicBtn = document.getElementById("musicBtn");
  const hint = document.getElementById("introHint");
  const skipBtn = document.getElementById("skipBtn");
  const startBtn = document.getElementById("startBtn");
  const badgeLabel = document.getElementById('heroBadgeLabel');

  img.addEventListener("error", () => {
    console.warn(`[img] No se pudo cargar ${HERO_IMG}. Revisa el nombre y la carpeta.`);
    img.remove();
    stage.classList.add("heroStage--noimg");
  });

  let introDone = false;

  function updateMusicBtn() {
    if (isIntroPlaying()) {
      musicBtn.innerHTML = '<span aria-hidden="true">♫</span> Desactivar música';
      musicBtn.setAttribute("aria-label", "Desactivar música de introducción");
    } else {
      musicBtn.innerHTML = '<span aria-hidden="true">♫</span> Activar música';
      musicBtn.setAttribute("aria-label", "Activar música de introducción");
    }
  }

  function revealStart() {
    if (introDone) return;
    introDone = true;
    skipBtn.classList.add("is-hidden");
    badgeLabel.textContent = "Listo para conversar";
    startBtn.classList.remove("is-hidden");
    startBtn.classList.add("btn--reveal");
    stage.classList.add("heroStage--revealed");
    img.removeAttribute('tabindex');
    img.removeAttribute('role');
    img.removeAttribute('aria-label');
  }

  function revealStartFromImage() {
    if (introDone) return;
    stopIntro();
    revealStart();
    hint.textContent = "La intro se omitió. Puedes empezar a chatear o activar la música cuando quieras.";
    updateMusicBtn();
  }

  img.addEventListener("click", revealStartFromImage);
  img.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      revealStartFromImage();
    }
  });
  setIntroListener((type) => {
    if (!document.body.contains(startBtn)) return;
    if (type === "play") hint.textContent = HINT_PLAYING;
    if (type === "pause") {
      revealStart();
      hint.textContent = "La música está desactivada. Puedes volver a activarla cuando quieras.";
    }
    if (type === "ended") {
      revealStart();
      hint.textContent = "La intro terminó. Puedes volver a escucharla cuando quieras.";
    }
    if (type === "error") {
      revealStart();
      hint.textContent = "No se pudo reproducir la intro. Puedes intentarlo de nuevo con el botón de música.";
    }
    updateMusicBtn();
  });

  musicBtn.addEventListener("click", async () => {
    await toggleIntro();
    if (!isIntroPlaying() && !introDone) {
      hint.textContent = "El navegador bloqueó la reproducción automática. Toca «Activar música» para escuchar la intro.";
    }
    updateMusicBtn();
  });
  skipBtn.addEventListener("click", () => {
    stopIntro();
    revealStart();
    updateMusicBtn();
  });

  if (introFailed()) {
    revealStart();
    hint.textContent = "No se pudo cargar la música. Puedes empezar a chatear o volver a intentarlo con el botón de música.";
  } else {
    startIntro().then((started) => {
      if (!started && !introDone) {
        revealStart();
        hint.textContent = "La música no inició automáticamente. Puedes empezar a chatear ahora o activarla cuando quieras.";
      }
    });
  }
  updateMusicBtn();
}
