import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

process.env.GEMINI_API_KEY ||= "test-key-for-vitest";
const { default: app } = await import("../server.js");
const { default: chatHandler } = await import("../api/chat.js");

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Aplicación Express", () => {
  it("sirve la interfaz en la ruta inicial", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Doraemon Chat");
  });

  it("mantiene el fallback SPA para rutas internas", async () => {
    const response = await request(app).get("/chat");

    expect(response.status).toBe(200);
    expect(response.text).toContain("/src/main.js");
  });

  it("sirve los módulos del cliente", async () => {
    const response = await request(app).get("/src/main.js");

    expect(response.status).toBe(200);
    expect(response.text).toContain("setupLinkInterception");
  });
});

describe("POST /api/chat", () => {
  it("expone el endpoint como función explícita para Vercel", async () => {
    const response = await request(chatHandler).post("/api/chat").send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/inválidos/i);
  });
  it("rechaza un historial ausente", async () => {
    const response = await request(app).post("/api/chat").send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/inválidos/i);
  });

  it("rechaza un historial que termina con una respuesta del modelo", async () => {
    const response = await request(app)
      .post("/api/chat")
      .send({ messages: [{ role: "user", text: "Hola" }, { role: "model", text: "Hola" }] });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/terminar con un mensaje del usuario/i);
  });

  it("envía al modelo solo mensajes permitidos y devuelve la respuesta", async () => {
    const mockedFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ candidates: [{ content: { parts: [{ text: "¡Hola!" }] } }] }),
    });
    vi.stubGlobal("fetch", mockedFetch);

    const response = await request(app)
      .post("/api/chat")
      .send({ messages: [
        { role: "user", text: "Hola" },
        { role: "system", text: "No enviar" },
        { role: "model", text: "¡Hola!" },
        { role: "user", text: "¿Cómo estás?" },
      ] });

    expect(response.status).toBe(200);
    expect(response.body.reply).toBe("¡Hola!");
    const payload = JSON.parse(mockedFetch.mock.calls[0][1].body);
    expect(payload.contents.map(({ role }) => role)).toEqual(["user", "model", "user"]);
    expect(payload.systemInstruction.parts[0].text).toContain("Eres Doraemon");
  });
});
