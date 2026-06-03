const SESSION_ID = "user_" + Math.random().toString(36).substr(2, 9);
const API_URL = import.meta.env.VITE_API_URL || "";

export const getSessionId = () => SESSION_ID;

export const sendMessage = async (message) => {
  const sid = localStorage.getItem("wendy_session_id") || SESSION_ID;
  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sid }),
  });

  if (!response.ok) throw new Error("Error del servidor");
  const data = await response.json();
  return {
    reply: data.reply,
    intent: data.intent,
    estado: data.estado,
    productos: data.productos || [],
    pregunta_guia: data.pregunta_guia || null,
    recomendado_id: data.recomendado_id || null,
  };
};

export const registerUser = async ({ name, email, phone, password }) => {
  const sid = localStorage.getItem("wendy_session_id") || SESSION_ID;
  const response = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sid, name, email, phone, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    return { success: false, error: data.error || "Error al registrar" };
  }
  return data;
};

export const loginUser = async ({ email, password }) => {
  const sid = localStorage.getItem("wendy_session_id") || SESSION_ID;
  const response = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sid, email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    return { success: false, error: data.error || "Credenciales incorrectas" };
  }
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem("wendy_cliente");
  // Generar nueva sesión para que no se vincule al cliente anterior
  localStorage.setItem("wendy_session_id", "user_" + Math.random().toString(36).substr(2, 9));
};

export const getPromotions = async () => {
  const response = await fetch(`${API_URL}/api/promotions`);
  return response.json();
};
