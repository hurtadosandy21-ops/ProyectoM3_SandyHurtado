export function renderAbout() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="aboutPage pageShell">
      <a class="backLink" href="/">← Volver al inicio</a>
      <div class="aboutCard">
        <div class="aboutCopy">
          <p class="eyebrow"><span class="eyebrow__dot"></span> Sobre el proyecto</p>
          <h1>Un amigo del futuro, <span>una conversación a la vez.</span></h1>
          <p class="aboutCopy__lead">
            Elegí crear este chat con Doraemon porque es un personaje que ha marcado mucho mi historia.
            Le tengo un cariño enorme y lo adoro por su ternura, su imaginación y la forma en que siempre
            intenta ayudar a quienes quiere.
          </p>
          <p>Este espacio nace de ese cariño: quise imaginar cómo sería conversar con él. El personaje de este chat se inspira en su personalidad amable y curiosa, en su amistad con Nobita y en los inventos que guarda en su bolsillo mágico.</p>
          <p>El proyecto combina una interfaz web adaptable, un servidor Express y Gemini para generar respuestas. La idea es ofrecer una charla cercana, con ideas útiles y un toque de fantasía.</p>
          <ul class="aboutFacts">
            <li><span aria-hidden="true">✓</span> Un solo personaje: Doraemon</li>
            <li><span aria-hidden="true">✓</span> Conversación en español</li>
            <li><span aria-hidden="true">✓</span> Un proyecto personal hecho con cariño</li>
          </ul>
          <a class="btn btn--primary" href="/chat">Hablar con Doraemon <span aria-hidden="true">→</span></a>
        </div>
        <figure class="aboutArt">
          <img src="/src/assets/img/avatar.jpg" alt="Doraemon sonríe" />
          <figcaption><span>Amigo cósmico</span><strong>Desde el siglo XXII, para ayudarte hoy.</strong></figcaption>
        </figure>
      </div>
      <p class="aboutLegal">Doraemon pertenece a sus respectivos creadores. Este proyecto es una iniciativa educativa de fans, sin fines de lucro.</p>
    </section>
  `;
}
