export function renderHome() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="view">
      <h1>¡Hola! Soy Doraemon 🔔</h1>
      <p>Soy un robot gato del siglo XXII. Cuéntame qué necesitas y buscaré algo en mi bolsillo mágico.</p>
      <a class="btn btn--primary" href="/chat">Hablar con Doraemon</a>
    </section>
  `;
}
