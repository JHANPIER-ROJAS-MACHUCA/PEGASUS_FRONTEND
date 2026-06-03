import { useState, useEffect } from "react";
import { getPromotions } from "../../services/chatService";

export default function Promociones({ onLockedClick, compact = false }) {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState(null);

  useEffect(() => { init(); }, []);

  function init() {
    const guardada = localStorage.getItem("wendy_cliente");
    if (guardada) {
      try { setCliente(JSON.parse(guardada)); } catch {}
    }
    cargar();
  }

  async function cargar() {
    try {
      const data = await getPromotions();
      const arr = Array.isArray(data) ? data : (data?.promociones || []);
      setPromos(arr.filter(p => p.activa).slice(0, 3));
    } catch {
      setPromos([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return null;

  const registrado = !!cliente;

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: compact ? "0 0 8px" : "0 24px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4682B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#446688", letterSpacing: 1, textTransform: "uppercase" }}>
          Promociones
        </h2>
        {!registrado && (
          <span style={{
            fontSize: 10, color: "#A07700", background: "rgba(255,200,80,0.15)",
            border: "1px solid rgba(255,180,0,0.3)",
            padding: "2px 8px", borderRadius: 10, fontWeight: 600, marginLeft: 4,
            letterSpacing: 0.5,
          }}>BLOQUEADAS · Regístrate para desbloquear</span>
        )}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(promos.length || 1, 3)}, 1fr)`,
        gap: 12,
      }}>
        {(promos.length > 0 ? promos : [1, 2, 3]).map((p, idx) => {
          const colors = [
            { bg: "linear-gradient(135deg, #B0E0FF, #87CEEB)", fg: "#2A4A6B" },
            { bg: "linear-gradient(135deg, #FFE0B2, #FFCC80)", fg: "#7A4A1A" },
            { bg: "linear-gradient(135deg, #FFB3BA, #FFC4D1)", fg: "#8A2A3A" },
          ];
          const c = colors[idx % 3];

          return (
            <div key={p.id_promocion || idx}
              onClick={() => !registrado && onLockedClick?.()}
              style={{
                background: c.bg, borderRadius: 14, padding: "14px 16px",
                color: c.fg, position: "relative", overflow: "hidden",
                boxShadow: "0 4px 14px rgba(70,130,180,0.08)",
                cursor: !registrado ? "pointer" : "default",
                filter: !registrado ? "blur(3px)" : "none",
                transition: "all 0.3s",
              }}
              onMouseEnter={e => !registrado && (e.currentTarget.style.filter = "blur(2px)")}
              onMouseLeave={e => !registrado && (e.currentTarget.style.filter = "blur(3px)")}
            >
              <div style={{
                position: "absolute", top: -20, right: -20,
                width: 80, height: 80, borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
              }} />
              <div style={{ position: "relative" }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
                  textTransform: "uppercase", opacity: 0.8,
                }}>
                  {p.descuento || "20"}% OFF
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}>
                  {p.nombre || "Promoción especial"}
                </div>
                {p.descripcion && (
                  <div style={{ fontSize: 11, marginTop: 4, opacity: 0.85, lineHeight: 1.3 }}>
                    {p.descripcion}
                  </div>
                )}
                {p.fecha_fin && (
                  <div style={{ fontSize: 10, marginTop: 8, fontWeight: 600, opacity: 0.7 }}>
                    Vence: {new Date(p.fecha_fin).toLocaleDateString("es-PE")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!registrado && (
        <div style={{
          marginTop: 10, padding: "10px 14px",
          background: "rgba(255,200,80,0.1)",
          border: "1px dashed rgba(180,140,0,0.3)",
          borderRadius: 10,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B08800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <div style={{ flex: 1, fontSize: 12, color: "#7A5A00" }}>
            Las promociones son <strong>exclusivas para clientes registrados</strong>. Regístrate gratis para desbloquear todos los descuentos.
          </div>
          {onLockedClick && (
            <button onClick={onLockedClick}
              style={{
                padding: "6px 14px", fontSize: 11, fontWeight: 700,
                background: "linear-gradient(135deg, #FFD580, #FFB347)",
                color: "#7A4A1A", border: "none", borderRadius: 8,
                cursor: "pointer", letterSpacing: 0.5, textTransform: "uppercase",
                boxShadow: "0 2px 8px rgba(255,180,0,0.3)",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              Registrarme
            </button>
          )}
        </div>
      )}
    </section>
  );
}
