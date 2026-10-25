import { startIntro, toggleIntro, isIntroPlaying, setIntroListener } from "../audio.js";

const HERO_IMG = "/src/assets/img/doraemonportada.png";

export function renderHome() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <section class="view view--home hero">
      <button type="button" class="musicBtn" id="musicBtn">🎵 Activar música</button>
      <img class="hero__img" src="${HERO_IMG}" alt="Doraemon" />
      <h1>Chatea con Doraemon</h1>
      <p>El robot gato del futuro tiene inventos para ti en su bolsillo mágico</p>
      <a class="btn btn--primary" href="/chat">Empezar a chatear</a>
    </section>
  `;

  const img = app.querySelector(".hero__img");
  img.addEventListener("error", () => img.remove());

  const musicBtn = document.getElementById("musicBtn");

  function updateMusicBtn() {
    if (!document.body.contains(musicBtn)) return; // ya cambiaste de página
    musicBtn.textContent = isIntroPlaying() ? "⏸️ Pausar música" : "🎵 Activar música";
  }

  setIntroListener(updateMusicBtn); // se actualiza cuando la música arranca o se detiene
  musicBtn.addEventListener("click", () => toggleIntro());

  startIntro(); // intenta sonar; si el navegador lo bloquea, arranca con el primer clic o tecla
}