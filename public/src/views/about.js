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
        <div class="aboutMedia">
          <figure class="aboutArt">
            <img src="/src/assets/img/avatar.jpg" alt="Doraemon sonríe" />
            <figcaption><span>Amigo cósmico</span><strong>Desde el siglo XXII, para ayudarte hoy.</strong></figcaption>
          </figure>
          <section class="musicCredits" id="music-credits" aria-labelledby="musicCreditsTitle">
            <p class="eyebrow"><span class="eyebrow__dot"></span> Música de inicio</p>
            <h2 id="musicCreditsTitle"><em>Doraemon no Uta</em></h2>
            <p>Créditos de la canción principal asociada a la serie clásica de <em>Doraemon</em>:</p>
            <ul>
              <li><strong>Música y composición:</strong> <a href="https://columbia.jp/prod-info/COCX-40818-21/info.html" target="_blank" rel="noopener noreferrer">Shunsuke Kikuchi</a>.</li>
              <li><strong>Letra:</strong> <a href="https://columbia.jp/prod-info/COCX-40818-21/info.html" target="_blank" rel="noopener noreferrer">Takumi Kusube</a>; letra complementaria: Susumu Baba.</li>
              <li><strong>Interpretación original japonesa (1979):</strong> <a href="https://columbia.jp/artist-info/ohsugikumiko/prof.html" target="_blank" rel="noopener noreferrer">Kumiko Ōsugi</a>. Las intervenciones habladas de Doraemon corresponden a Nobuyo Ōyama.</li>
              <li><strong>Adaptaciones al español:</strong> España, Ana Orra y Noemí Bayarri; Latinoamérica, Maggie Vera, según los créditos de las versiones regionales.</li>
            </ul>
            <p class="musicCredits__source">Consulta también los <a href="https://doraemon.fandom.com/es/wiki/Canci%C3%B3n_de_Doraemon" target="_blank" rel="noopener noreferrer">créditos de las versiones en español</a> y la información de <a href="https://en.wikipedia.org/wiki/Doraemon_no_Uta" target="_blank" rel="noopener noreferrer">Doraemon no Uta</a>.</p>
            <p class="musicCredits__legal">Los derechos de la canción y sus grabaciones pertenecen a sus respectivos titulares. Este proyecto es educativo y sin ánimo de lucro. Estos datos identifican la obra y sus versiones; no atribuyen el archivo de audio de la aplicación a una grabación concreta.</p>
          </section>
        </div>
      </div>
      <p class="aboutLegal">Doraemon pertenece a sus respectivos creadores. Este proyecto es una iniciativa educativa de fans, sin fines de lucro.</p>
    </section>
  `;
}