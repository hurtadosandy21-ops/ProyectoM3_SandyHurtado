# Doraemon Chat

Chat web inspirado en Doraemon. La interfaz es una SPA hecha con JavaScript, CSS y HTML; Express mantiene la clave de Gemini en el servidor y expone el endpoint del chat.

## Requisitos

- Node.js 22 o superior
- npm
- Una clave de API de Gemini

## Instalación y ejecución local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` como `.env` y coloca tu clave en `GEMINI_API_KEY`.
3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

4. Abre `http://localhost:3000`.

Para iniciar sin modo de observación, usa `npm start`.

## Variables de entorno

| Variable | Requerida | Uso |
|---|---:|---|
| `GEMINI_API_KEY` | Sí | Clave privada de Gemini. Solo se lee en el servidor. |
| `GEMINI_MODEL` | No | Modelo principal; por defecto `gemini-flash-lite-latest`. |
| `GEMINI_FALLBACK_MODEL` | No | Modelo alternativo cuando el principal no está disponible. |
| `PORT` | No | Puerto local; por defecto `3000`. |

No subas `.env` al repositorio. En Vercel, agrega estas variables desde la configuración del proyecto y vuelve a desplegar después de guardarlas.

## Pruebas

Ejecuta las pruebas unitarias y de integración con:

```bash
npm test
```

Las pruebas simulan la respuesta de Gemini; no necesitan una clave real ni hacen llamadas facturables a la API.

## Despliegue en Vercel

1. Sube el repositorio a GitHub y crea un proyecto nuevo en Vercel conectado a ese repositorio.
2. Agrega `GEMINI_API_KEY` en **Settings → Environment Variables**. Añade `GEMINI_MODEL` o `GEMINI_FALLBACK_MODEL` solo si quieres cambiar los valores por defecto.
3. Despliega el proyecto. Vercel detecta la aplicación Express exportada por `server.js` y publica automáticamente los archivos de `public/`.
4. Abre la URL generada y comprueba Inicio, `/chat`, el historial del navegador y un mensaje al chatbot.

## Estructura

- `public/`: página y recursos estáticos de la interfaz (JavaScript, estilos, sonidos e imágenes).
- `server.js`: aplicación Express, validación, límites de uso y proxy seguro a Gemini.
- `test/`: pruebas de integración del servidor y unitarias del servicio de chat.
- `vercel.json`: esquema para validar la configuración de Vercel.

## Créditos

Proyecto educativo de fans sin fines de lucro. Doraemon pertenece a sus respectivos creadores.