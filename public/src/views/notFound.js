export function renderNotFound() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="notFoundPage" aria-labelledby="notFoundTitle">
      <div class="notFoundCard">
        <p class="notFoundCode" aria-hidden="true">404</p>
        <h1 id="notFoundTitle">Página no encontrada</h1>
        <p>Ni con el bolsillo mágico encuentro esta dirección. Revisa el enlace o vuelve al inicio.</p>
        <a class="btn btn--primary" href="/">Volver al inicio</a>
      </div>
    </section>
  `;
}
