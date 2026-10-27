# Doraemon Chat

> **Prueba la aplicación:** [proyectom3sandyhurtado.vercel.app](https://proyectom3sandyhurtado.vercel.app/)

## Contenido

- [El proyecto](#el-proyecto)
- [Qué puedes hacer](#qué-puedes-hacer)
- [Cómo se usa](#cómo-se-usa)
- [Cómo funciona](#cómo-funciona)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Tecnologías](#tecnologías)
- [Instalación local](#instalación-local)
- [Pruebas](#pruebas)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Herramientas de IA](#herramientas-de-ia)

## El proyecto

Doraemon Chat es una aplicación web para conversar en español con un personaje inspirado en Doraemon. Nació de mi cariño por el personaje, que ha marcado mucho mi historia, y de mi deseo de imaginar cómo sería tener una conversación con él.

La experiencia busca sentirse cercana, amable y divertida: Doraemon escucha lo que la persona necesita, comparte ideas prácticas y, cuando viene al caso, presenta un invento de su bolsillo mágico. Es un proyecto personal y educativo, no oficial ni afiliado con los titulares de Doraemon.

[↑ Volver al índice](#contenido)

## Qué puedes hacer

- **Elegir el estilo de la charla:** empezar con ideas prácticas, inventos del futuro o una conversación amable. Cada opción prepara el chat con un enfoque distinto.
- **Conversar con contexto:** el servidor envía a Gemini el historial reciente de la conversación y las instrucciones del tema seleccionado.
- **Descubrir inventos:** si Doraemon propone uno, primero aparece su explicación y después su imagen o distintivo.
- **Guardar conversaciones:** crear chats, volver a abrirlos, eliminar uno o vaciar el historial. Se guardan en el navegador actual, hasta 30 conversaciones; no se sincronizan entre dispositivos.
- **Personalizar la experiencia:** alternar entre modo claro y oscuro, y activar o silenciar los sonidos.
- **Usarla desde distintos tamaños de pantalla:** el diseño se adapta a celular, tablet y laptop. En laptop y tablet el scroll de los mensajes queda dentro del panel del chat.
- **Navegar sin recargar:** Inicio, Chat y Acerca de usan rutas de una SPA y admiten los botones atrás y adelante del navegador.

La portada intenta reproducir la música de introducción al entrar. Algunos navegadores bloquean el audio automático; en ese caso se puede activar manualmente desde el control de música.

[↑ Volver al índice](#contenido)

## Cómo se usa

1. Abre la [aplicación de Doraemon Chat](https://proyectom3sandyhurtado.vercel.app/).
2. Al entrar, la portada intenta reproducir la música de introducción. Cuando termina, aparece **Empezar a chatear**. Si prefieres no esperar, pulsa **Saltar intro** o **Desactivar música**; también puedes entrar desde **Chat** en la barra de navegación.
3. Para iniciar con un tema específico, elige una de las tarjetas de la portada: **Ideas prácticas**, **Inventos del futuro** o **Una charla amable**. Cada tarjeta abre el chat con ese enfoque.
4. Escribe tu pregunta en el campo de mensaje y pulsa **Enviar**. Doraemon responderá en español y, si corresponde, presentará un invento después de explicar cómo puede ayudarte.
5. Abre **Historial** para volver a una conversación o pulsa **+ Nueva** para iniciar otra. Desde ahí puedes borrar una conversación o vaciar el historial; la aplicación te pedirá confirmación, salvo que hayas elegido no volver a mostrarla.
6. En el chat, el botón de sonido activa o silencia los efectos. La música de introducción se controla desde la portada. Usa el botón de tema en la barra de navegación para alternar entre modo claro y oscuro.

[↑ Volver al índice](#contenido)

## Cómo funciona

La interfaz (`public/`) es una SPA creada con HTML, CSS y módulos JavaScript. El router maneja las vistas y las rutas; el servicio del chat envía los mensajes a `/api/chat`. En producción, Vercel publica ese endpoint como una función serverless desde `api/chat.js`.

El endpoint pasa por Express en `server.js`, que valida el formato, descarta roles de mensaje no permitidos, limita el tamaño y la cantidad de mensajes y aplica un límite básico de solicitudes por IP. Después llama a Gemini usando `GEMINI_API_KEY`, guardada solo en el servidor. La clave no se entrega al navegador.

Las tres opciones de la portada se convierten en temas permitidos por el servidor: `ideas`, `inventos` y `charla`. El historial de conversaciones y la preferencia de tema visual se guardan en el almacenamiento local del navegador. No hay cuenta de usuario ni sincronización en la nube.

[↑ Volver al índice](#contenido)

## Estructura del proyecto

```text
.
├── api/
│   └── chat.js                   # Función serverless /api/chat de Vercel
├── public/
│   ├── index.html                # Documento de entrada de la SPA
│   └── src/
│       ├── assets/               # Imágenes, ilustraciones y sonidos
│       ├── services/chatService.js
│       ├── views/                # Inicio, chat, Acerca de y página no encontrada
│       ├── audio.js              # Música y efectos de sonido
│       ├── main.js               # Tema, navegación y arranque
│       ├── navigation.js         # History API y enlaces internos
│       ├── router.js             # Resolución de rutas
│       ├── style.css             # Estilos base
│       └── polish.css            # Diseño y adaptación a pantallas
├── test/                         # Pruebas de servidor y servicio
├── .env.example                  # Plantilla de configuración local
├── server.js                     # Express y conexión segura con Gemini
├── vercel.json                   # Rutas internas de la SPA
├── package.json
├── README.md
└── IA.md                          # Registro de apoyo de IA y ejemplos de código
```

[↑ Volver al índice](#contenido)

### Tecnologías

- HTML, CSS y JavaScript con módulos ES.
- Node.js 22 o superior y Express 5.
- API de Gemini para generar respuestas.
- Vercel Functions para el endpoint del chat.
- Vitest y Supertest para pruebas unitarias y de integración.

[↑ Volver al índice](#contenido)

## Instalación local

Necesitas Node.js **22 o superior**, npm y una clave de API de Gemini.

Clona el repositorio e instala sus dependencias:

```bash
git clone https://github.com/hurtadosandy21-ops/ProyectoM3_SandyHurtado.git
cd ProyectoM3_SandyHurtado
npm install
```

Crea `.env` desde `.env.example`. En PowerShell:

```powershell
Copy-Item .env.example .env
```

En macOS o Linux:

```bash
cp .env.example .env
```

Edita `.env` y coloca tu clave en `GEMINI_API_KEY`. Luego inicia el servidor:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Para iniciar sin reinicio automático, usa `npm start`.

**No compartas ni subas `.env`**. En Vercel, configura la clave desde las variables de entorno del proyecto. Después de modificar una variable, crea un nuevo despliegue.

### Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---:|---|
| `GEMINI_API_KEY` | Sí | Clave privada usada por el servidor para llamar a Gemini. |
| `GEMINI_MODEL` | No | Modelo principal; por defecto `gemini-flash-lite-latest`. |
| `GEMINI_FALLBACK_MODEL` | No | Modelo alternativo, si está disponible para la cuenta. |
| `PORT` | No | Puerto local; por defecto `3000`. |

[↑ Volver al índice](#contenido)

## Pruebas

Ejecuta la suite con:

```bash
npm test
```

Vitest y Supertest comprueban rutas, validación y servicio. Las llamadas a Gemini se simulan, por lo que las pruebas no necesitan una clave real ni consumen solicitudes de la API.

[↑ Volver al índice](#contenido)

## Despliegue en Vercel

1. Importa el repositorio de GitHub en Vercel.
2. Agrega `GEMINI_API_KEY` en **Settings → Environment Variables**, para el entorno **Production**.
3. Despliega el proyecto. Vercel publica el contenido de `public/` y detecta `api/chat.js` como la función de `/api/chat`.
4. Abre el enlace de producción y prueba la portada, las rutas internas y el envío de un mensaje.

`vercel.json` reescribe `/chat` y `/about` a `index.html` para que se puedan abrir directamente. La función del chat está en `api/chat.js`; no configures un patrón de función apuntando a `server.js`.

[↑ Volver al índice](#contenido)

## Créditos y propiedad intelectual

Doraemon y los elementos asociados pertenecen a sus respectivos titulares. Este proyecto personal y educativo no es oficial ni está afiliado con ellos.

[↑ Volver al índice](#contenido)

## Herramientas de IA

Gemini genera las respuestas del chatbot. Durante el desarrollo también utilicé ChatGPT/Codex y Claude como apoyo para explorar errores, revisar alternativas, mejorar la interfaz y preparar documentación. Revisé las propuestas y realicé ajustes manuales para adaptarlas a los objetivos del proyecto. En [IA.md](IA.md) registro ejemplos, soluciones, aprendizajes y fragmentos de código.

[↑ Volver al índice](#contenido)
