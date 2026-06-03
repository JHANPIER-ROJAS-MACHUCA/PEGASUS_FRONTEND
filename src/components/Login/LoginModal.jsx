import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/chatService";

export default function LoginModal({ onClose, onLoggedIn, onSwitchToRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");
    if (!form.email.trim() || !form.password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }
    setLoading(true);
    try {
      const result = await loginUser(form);
      if (!result?.success) {
        setError(result?.error || "No se pudo iniciar sesión.");
        return;
      }
      const clienteData = {
        nombre: result.cliente.nombre,
        email: result.cliente.email,
        telefono: result.cliente.telefono,
        ...result.cliente,
      };
      localStorage.setItem("wendy_cliente", JSON.stringify(clienteData));
      onLoggedIn?.(clienteData);
      setTimeout(() => onClose?.(), 400);
    } catch (e) {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ color: "#446688", margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Iniciar sesión</h3>
            <p style={{ color: "#88AACC", fontSize: 11, margin: "2px 0 0" }}>
              Ingresa con tu correo y contraseña
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#88AACC",
            fontSize: "1.4rem", cursor: "pointer", padding: "0 4px", lineHeight: 1,
          }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Correo electrónico</label>
          <input
            autoFocus type="email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="tu@correo.com"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "#4682B4"}
            onBlur={e => e.target.style.borderColor = "rgba(135,206,235,0.3)"}
          />

          <label style={{ ...labelStyle, marginTop: 12 }}>Contraseña</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPwd ? "text" : "password"} value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Tu contraseña"
              onKeyDown={e => { if (e.key === "Enter") handleSubmit(e); }}
              style={{ ...inputStyle, paddingRight: 40 }}
              onFocus={e => e.target.style.borderColor = "#4682B4"}
              onBlur={e => e.target.style.borderColor = "rgba(135,206,235,0.3)"}
            />
            <button type="button" onClick={() => setShowPwd(p => !p)}
              style={{
                position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "#88AACC", padding: 4,
              }}
              tabIndex={-1}
            >
              {showPwd
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              }
            </button>
          </div>

          {error && (
            <p style={{
              color: "#E07070", fontSize: 11, margin: "8px 0 0",
              padding: "6px 10px", background: "rgba(224,112,112,0.08)",
              borderRadius: 6, border: "1px solid rgba(224,112,112,0.2)",
            }}>{error}</p>
          )}

          <button type="submit" disabled={loading}
            style={{
              width: "100%", marginTop: 16, padding: "11px", borderRadius: "10px",
              border: "none",
              background: loading ? "rgba(135,206,235,0.4)" : "linear-gradient(135deg, #87CEEB, #4682B4)",
              color: "#FFF", fontWeight: 600, cursor: loading ? "wait" : "pointer",
              fontSize: "0.9rem", letterSpacing: 0.5,
            }}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <div style={{
          marginTop: 14, paddingTop: 12,
          borderTop: "1px solid rgba(135,206,235,0.15)",
          textAlign: "center", fontSize: 12, color: "#88AACC",
        }}>
          ¿No tienes cuenta?{" "}
          <button onClick={() => { onClose?.(); onSwitchToRegister?.(); }}
            style={{
              background: "none", border: "none", padding: 0,
              color: "#4682B4", fontWeight: 600, cursor: "pointer",
              textDecoration: "underline",
            }}
          >Regístrate aquí</button>
        </div>

        <p style={{ textAlign: "center", fontSize: 10, color: "#88AACC", margin: "12px 0 0" }}>
          🔒 Autenticación con bcrypt
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  color: "#4682B4", fontSize: 11, marginBottom: "5px",
  display: "block", fontWeight: 600,
};

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: "10px",
  border: "1px solid rgba(135,206,235,0.3)", background: "rgba(255,255,255,0.8)",
  color: "#446688", fontSize: "0.9rem", outline: "none",
  boxSizing: "border-box",
};

const overlayStyle = {
  position: "fixed", inset: 0,
  background: "rgba(70, 130, 180, 0.2)",
  backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
  display: "flex", alignItems: "center",
  justifyContent: "center", zIndex: 1000,
};

const modalStyle = {
  background: "#FFFFFF", borderRadius: "20px",
  padding: "24px", width: "90%", maxWidth: "380px",
  boxShadow: "0 20px 60px rgba(70, 130, 180, 0.15)",
  border: "1px solid rgba(135,206,235,0.2)",
};
