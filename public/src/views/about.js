export function renderAbout() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="view">
      <h1>Acerca del proyecto</h1>
      <p>Chatbot con la personalidad de Doraemon, hecho con JavaScript puro (SPA),
         un servidor Express y la API de Gemini.</p>
      <p>Proyecto de fans sin fines de lucro. Doraemon pertenece a sus respectivos creadores.</p>
      <a class="btn btn--primary" href="/chat">Ir al chat</a>
    </section>
  `;
}
