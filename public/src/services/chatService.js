export async function sendToDoraemon(history) {
  let response;
  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
  } catch {
    throw new Error("No pude conectar con el servidor. Revisa que npm run dev siga corriendo.");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `El servidor respondió ${response.status}.`);
  }
  return { reply: data.reply, gadget: data.gadget ?? null };
}