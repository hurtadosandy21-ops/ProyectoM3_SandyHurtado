# Uso de inteligencia artificial

Este documento resume diez solicitudes representativas realizadas durante el desarrollo de Doraemon Chat. Los prompts están redactados como síntesis de las peticiones; cada solución y fragmento muestra el cambio aplicado y lo que aprendí.

## 1. Adaptar el diseño a celular, tablet y laptop

**Prompt:** “Quiero que la app se adapte a distintos tamaños y que el scroll ocurra dentro del chat.”

**Solución:** Ajusté el ancho, las columnas y el área de mensajes mediante reglas adaptables. En laptop y tablet el chat ocupa la altura disponible; en celular los bloques se apilan.

**Aprendizaje:** Cada tamaño de pantalla necesita una composición adecuada; achicar el zoom no reemplaza un diseño responsive.

**Cambio aplicado — `public/src/polish.css`:**

```css
@media (max-width: 640px) {
  .view--home.hero.pageShell {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto auto;
  }
}
```

## 2. Ordenar la portada en móvil

**Prompt:** “En celular quiero el título arriba, la imagen en medio y la descripción debajo.”

**Solución:** Reorganicé el HTML para que el orden visual también coincida con la lectura del documento.

**Aprendizaje:** La estructura HTML puede facilitar tanto la adaptación como la navegación accesible.

**Cambio aplicado — `public/src/views/home.js`:**

```html
<div class="heroCopy heroCopy--heading">
  <h1>Una idea nueva puede <span>cambiarlo todo.</span></h1>
</div>
<figure class="heroStage">...</figure>
<div class="heroCopy heroCopy--details">
  <p class="heroCopy__text">...</p>
</div>
```

## 3. Mejorar el contraste en modo oscuro

**Prompt:** “Me gusta el modo noche, pero quiero que las descripciones se lean mejor.”

**Solución:** Ajusté los colores de texto y superficies secundarias para mantener contraste en el tema oscuro.

**Aprendizaje:** El modo oscuro necesita una paleta completa; cambiar solo el fondo puede dejar textos ilegibles.

**Cambio aplicado — `public/src/polish.css`:**

```css
:root[data-theme="dark"] {
  --page-bg: #101d27;
  --surface: #192a36;
  --ink: #edf6fb;
  --muted: #a7bdca;
}
```

## 4. Iniciar y controlar la música

**Prompt:** “Quiero que la música se intente reproducir al entrar y que pueda activarla o desactivarla.”

**Solución:** La portada inicia el intento de reproducción y conserva un botón manual para los navegadores que bloquean el autoplay.

**Aprendizaje:** La reproducción automática depende de las políticas del navegador; una interfaz debe ofrecer un control accesible como alternativa.

**Cambio aplicado — `public/src/views/home.js`:**

```js
startIntro().then((started) => {
  if (!started && !introDone) {
    hint.textContent = "El navegador puede bloquear la reproducción automática. Toca Activar música.";
  }
});
```

## 5. Enviar el tema elegido al chat

**Prompt:** “Quiero que Ideas prácticas, Inventos del futuro y Una charla amable preparen el chat para ese tema.”

**Solución:** Los accesos de la portada pasan un tema permitido al cliente y el servidor añade sus instrucciones al contexto de Gemini.

**Aprendizaje:** El servidor debe validar el tema recibido y definir el contexto; la interfaz por sí sola no controla la respuesta del modelo.

**Cambio aplicado — `server.js`:**

```js
const topicPrompt = Object.hasOwn(TOPIC_PROMPTS, topic)
  ? TOPIC_PROMPTS[topic]
  : null;
const systemPrompt = topicPrompt
  ? `${SYSTEM_PROMPT}\n\nENFOQUE DE ESTA CONVERSACIÓN\n${topicPrompt}`
  : SYSTEM_PROMPT;
```

## 6. Mostrar primero la explicación del invento

**Prompt:** “Quiero que el invento aparezca después de que Doraemon explique para qué sirve.”

**Solución:** En la burbuja del chat, agregué el texto antes de la figura del invento.

**Aprendizaje:** El orden de los elementos ayuda a entender por qué aparece una imagen y qué representa.

**Cambio aplicado — `public/src/views/chat.js`:**

```js
span.textContent = text;
div.appendChild(span);
if (gadget) div.appendChild(buildGadgetFigure(gadget));
```

## 7. Crear un historial de varias conversaciones

**Prompt:** “Quiero ver conversaciones anteriores, abrirlas y empezar una nueva.”

**Solución:** Cada chat tiene un identificador, título y lista de mensajes; la colección se persiste en `localStorage`.

**Aprendizaje:** El historial debe separar los mensajes por conversación, no guardar todo como una única charla.

**Cambio aplicado — `public/src/views/chat.js`:**

```js
const CONVERSATIONS_KEY = "doraemon-conversations";
localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
```

## 8. Confirmar antes de borrar conversaciones

**Prompt:** “Quiero eliminar conversaciones con una confirmación y una opción para no volver a preguntar.”

**Solución:** Añadí un cuadro con Cancelar, Eliminar y la preferencia “No volver a preguntar”; también se puede vaciar el historial.

**Aprendizaje:** Las acciones destructivas deben explicar qué se eliminará y permitir cancelar.

**Cambio aplicado — `public/src/views/chat.js`:**

```html
<label class="confirmDialog__remember">
  <input type="checkbox" id="skipDeleteConfirm" />
  No volver a preguntar
</label>
```

## 9. Corregir las rutas internas en Vercel

**Prompt:** “Al abrir `/chat` recibo un 404; ¿cómo hago que Vercel sirva la SPA y la función?”

**Solución:** Reescribí las rutas internas de interfaz a `index.html` y dejé la entrada serverless del endpoint en `api/chat.js`.

**Aprendizaje:** Las rutas visuales de la SPA y los endpoints de API cumplen funciones distintas en el despliegue.

**Cambio aplicado — `vercel.json`:**

```json
{
  "rewrites": [
    { "source": "/chat", "destination": "/index.html" },
    { "source": "/about", "destination": "/index.html" }
  ]
}
```

## 10. Mantener segura la clave y ejecutar pruebas

**Prompt:** “Vitest no se reconoce; ¿cómo lo arreglo y cómo mantengo privada la clave de Gemini?”

**Solución:** Instalé las dependencias del proyecto, configuré pruebas con Vitest/Supertest y mantuve la clave en una variable de entorno que usa el servidor.

**Aprendizaje:** Las dependencias deben instalarse antes de ejecutar el script de pruebas; una clave privada nunca debe incluirse en el JavaScript del navegador.

**Cambio aplicado — `server.js`:**

```js
// server.js: la clave se lee en el servidor, nunca desde el navegador.
const API_KEY = process.env.GEMINI_API_KEY;
```

## Nota sobre mi trabajo

La idea, la elección de Doraemon, el enfoque del proyecto y las decisiones finales son míos. Utilicé Gemini para generar respuestas dentro de la app, y ChatGPT/Codex y Claude como apoyo durante el desarrollo. Revisé las sugerencias y modifiqué y mejoré manualmente los resultados para adaptarlos a mi proyecto. La IA fue una herramienta de apoyo; no reemplazó mi revisión ni mis decisiones.
