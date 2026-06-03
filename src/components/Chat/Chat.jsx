import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { sendMessage } from "../../services/chatService";
import { getSocket } from "../../services/socketService";

const Chat = forwardRef(function Chat({ onRegistrationStart, onUserMessage }, ref) {
  const [messages, setMessages] = useState([
    { from: "wendy", text: "Hola, soy Wendy. ¿En qué puedo ayudarte?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [inputText, setInputText] = useState("");
  const endRef = useRef(null);

  useImperativeHandle(ref, () => ({
    handleSend,
    state: { products: recommendedProducts },
  }), [loading, recommendedProducts, onRegistrationStart]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text) => {
    if (!text || !text.trim() || loading) return null;
    const cleanText = text.trim();
    const userMsg = { from: "user", text: cleanText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const socket = getSocket();
      socket?.emit("thinking:start");

      const { reply, intent, estado, productos } = await sendMessage(cleanText);

      const displayText = reply.replace(/\s*\{PRODUCTOS:[\d,]+\}/g, "").trim();
      const wendyMsg = { from: "wendy", text: displayText, intent, estado };
      setMessages(prev => [...prev, wendyMsg]);

      // Si el backend envió productos, usarlos directamente
      if (productos && productos.length > 0) {
        setRecommendedProducts(productos);
        socket?.emit("products:update", productos);
      } else {
        // Fallback: extraer IDs del tag {PRODUCTOS:...}
        const productMatch = reply.match(/\{PRODUCTOS:\s*([\d,]+)\}/);
        if (productMatch) {
          const ids = productMatch[1].split(",").map(s => parseInt(s.trim()));
          try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/products`);
            const allProducts = await resp.json();
            const filtered = allProducts.filter(p => ids.includes(p.id_producto));
            setRecommendedProducts(filtered);
            socket?.emit("products:update", filtered);
          } catch {}
        } else {
          setRecommendedProducts([]);
          socket?.emit("products:update", []);
        }
      }

      socket?.emit("thinking:end");

      if (estado?.paso === "registro_completado" && onRegistrationStart) {
        onRegistrationStart(estado);
      }
      return wendyMsg;
    } catch {
      socket?.emit("thinking:end");
      const errMsg = "Lo siento, hubo un error al conectar.";
      setMessages(prev => [...prev, { from: "wendy", text: errMsg }]);
      return { from: "wendy", text: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const onSubmitText = (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    const text = inputText.trim();
    setInputText("");
    if (onUserMessage) onUserMessage(text);
    handleSend(text);
  };

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      {loading && (
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          gap: 4, padding: "4px 0",
        }}>
          <span style={{
            color: "#4682B4", fontSize: "0.7rem", fontWeight: 600,
            letterSpacing: 2, textTransform: "uppercase",
          }}>
            Procesando
          </span>
          <div style={{ display: "flex", gap: 3 }}>
            {[1,2,3].map((_, i) => (
              <div key={i} style={{
                width: 3, height: 10, borderRadius: 1,
                background: "#87CEEB",
                animation: "pulse 0.8s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
              }} />
            ))}
          </div>
        </div>
      )}

      <div style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        borderRadius: 12,
        border: "1px solid rgba(135,206,235,0.25)",
        overflow: "hidden",
        maxHeight: 160,
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{
          padding: "6px 12px",
          borderBottom: "1px solid rgba(135,206,235,0.15)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(135,206,235,0.08)",
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "#4682B4",
          }} />
          <span style={{
            color: "#4682B4", fontSize: "0.65rem",
            fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
          }}>
            Conversación
          </span>
        </div>
        <div style={{
          flex: 1, overflowY: "auto", padding: "8px 12px",
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{
                color: msg.from === "wendy" ? "#4682B4" : "#88AACC",
                fontWeight: 700, fontSize: "0.6rem", minWidth: 34,
                letterSpacing: 1, marginTop: 2,
              }}>
                {msg.from === "wendy" ? "WENDY" : "TÚ"}
              </span>
              <p style={{
                color: msg.from === "wendy" ? "#446688" : "#6688AA",
                fontSize: "0.75rem", fontWeight: msg.from === "wendy" ? 500 : 400,
                lineHeight: 1.4, margin: 0, wordBreak: "break-word",
              }}>
                {msg.text}
              </p>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form onSubmit={onSubmitText}
          style={{
            display: "flex", gap: 6, padding: "8px",
            borderTop: "1px solid rgba(135,206,235,0.15)",
            background: "rgba(255,255,255,0.5)",
          }}
        >
          <input type="text" value={inputText} onChange={e => setInputText(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={loading}
            style={{
              flex: 1, padding: "8px 12px", fontSize: "0.75rem",
              border: "1px solid rgba(135,206,235,0.3)",
              borderRadius: 8, outline: "none",
              background: "#FFFFFF", color: "#446688",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#4682B4"}
            onBlur={e => e.target.style.borderColor = "rgba(135,206,235,0.3)"}
          />
          <button type="submit" disabled={loading || !inputText.trim()}
            style={{
              padding: "8px 14px", fontSize: "0.7rem", fontWeight: 600,
              background: loading || !inputText.trim()
                ? "rgba(135,206,235,0.3)"
                : "linear-gradient(135deg, #87CEEB, #4682B4)",
              color: "#FFFFFF", border: "none", borderRadius: 8,
              cursor: loading || !inputText.trim() ? "not-allowed" : "pointer",
              letterSpacing: 1, textTransform: "uppercase",
            }}>
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
});

export default Chat;
