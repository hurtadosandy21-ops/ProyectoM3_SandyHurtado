export function renderNotFound() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="view">
      <h1>404 - Página no encontrada</h1>
      <p>Ni con el bolsillo mágico encontré esta página.</p>
      <a class="btn btn--primary" href="/">Volver al inicio</a>
    </section>
  `;
}
