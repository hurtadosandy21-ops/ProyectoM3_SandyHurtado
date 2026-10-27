import { afterEach, describe, expect, it, vi } from "vitest";
import { sendToDoraemon } from "../public/src/services/chatService.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sendToDoraemon", () => {
  it("envía el historial y devuelve la respuesta y el invento", async () => {
    const messages = [{ role: "user", text: "Ayúdame" }];
    const mockedFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: "¡Tatatáaan!", gadget: { id: "puerta-magica" } }),
    });
    vi.stubGlobal("fetch", mockedFetch);

    await expect(sendToDoraemon(messages)).resolves.toEqual({
      reply: "¡Tatatáaan!",
      gadget: { id: "puerta-magica" },
    });
    expect(mockedFetch).toHaveBeenCalledWith("/api/chat", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ messages }),
    }));
  });

  it("explica cuando no se puede conectar al servidor", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));

    await expect(sendToDoraemon([])).rejects.toThrow(/no pude conectar con el servidor/i);
  });

  it("usa el error devuelto por el servidor", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ error: "Gemini no disponible" }),
    }));

    await expect(sendToDoraemon([])).rejects.toThrow("Gemini no disponible");
  });
});