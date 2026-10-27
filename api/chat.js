import app from "../server.js";

// Vercel despliega esta entrada como función para /api/chat.
export default function chatHandler(request, response) {
  return app(request, response);
}
