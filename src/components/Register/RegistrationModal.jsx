import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/chatService";

export default function RegistrationModal({ onClose, onRegistered }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("El correo no tiene un formato válido.");
      return;
    }
    setLoading(true);
    try {
      const result = await registerUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      if (!result?.success) {
        if (result?.error?.toLowerCase().includes("ya est")) {
          setError("Este correo ya está registrado. Cierra sesión de esta cuenta o usa otro correo.");
        } else {
          setError(result?.error || "Error al registrar. Intenta de nuevo.");
        }
        return;
      }
      const clienteData = {
        nombre: form.name,
        email: form.email,
        telefono: form.phone,
        ...(result?.cliente || {}),
      };
      localStorage.setItem("wendy_cliente", JSON.stringify(clienteData));
      setDone(true);
      if (onRegistered) onRegistered(clienteData);
      setTimeout(() => {
        navigate("/tienda");
      }, 1500);
    } catch (e) {
      setError("Error al registrar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={overlayStyle}>
        <div style={modalStyle}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "linear-gradient(135deg, #87CEEB, #B0E0FF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 4px 16px rgba(135,206,235,0.3)",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 style={{ color: "#446688", margin: 0, fontSize: "1.2rem", fontWeight: 700, textAlign: "center" }}>
            ¡Bienvenido {form.name.split(" ")[0]}!
          </h3>
          <p style={{ color: "#88AACC", fontSize: "0.85rem", marginTop: "8px", textAlign: "center" }}>
            Tu cuenta está lista. Te llevamos a la tienda.
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    { title: "Datos personales", fields: [
      { key: "name", placeholder: "Ej. Juan Pérez", type: "text", label: "Nombre completo", required: true },
      { key: "phone", placeholder: "999 888 777", type: "tel", label: "Teléfono (opcional)", required: false },
    ]},
    { title: "Tu correo", fields: [
      { key: "email", placeholder: "tu@correo.com", type: "email", label: "Correo electrónico", required: true },
    ]},
    { title: "Crea tu contraseña", fields: [
      { key: "password", placeholder: "Mínimo 6 caracteres", type: showPwd ? "text" : "password", label: "Contraseña", required: true },
      { key: "confirm", placeholder: "Repite tu contraseña", type: showPwd ? "text" : "password", label: "Confirmar contraseña", required: true },
    ]},
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const next = () => {
    setError("");
    if (step === 0) {
      if (!form.name.trim()) { setError("Ingresa tu nombre"); return; }
    }
    if (step === 1) {
      if (!form.email.trim()) { setError("Ingresa tu correo"); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Correo no válido"); return; }
    }
    if (isLast) handleSubmit();
    else setStep(s => s + 1);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h3 style={{ color: "#446688", margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Crear cuenta</h3>
            <p style={{ color: "#88AACC", fontSize: 10, margin: "2px 0 0", letterSpacing: 0.5 }}>
              {current.title}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#88AACC",
            fontSize: "1.4rem", cursor: "pointer", padding: "0 4px", lineHeight: 1,
          }}>×</button>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: "5px", marginBottom: "14px" }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: "3px", borderRadius: "2px",
              background: i <= step ? "linear-gradient(90deg, #87CEEB, #4682B4)" : "rgba(135,206,235,0.15)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        {/* Fields */}
        {current.fields.map(f => {
          if (f.key === "password" || f.key === "confirm") {
            return (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <label style={{ color: "#4682B4", fontSize: 11, marginBottom: "5px", display: "block", fontWeight: 600 }}>
                  {f.label} {f.required && <span style={{ color: "#E07070" }}>*</span>}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    autoFocus={f.key === "password"}
                    type={f.type}
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    onKeyDown={e => { if (e.key === "Enter") next(); }}
                    placeholder={f.placeholder}
                    style={{
                      width: "100%", padding: "10px 38px 10px 12px", borderRadius: "10px",
                      border: "1px solid rgba(135,206,235,0.3)", background: "rgba(255,255,255,0.8)",
                      color: "#446688", fontSize: "0.9rem", outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={e => e.target.style.borderColor = "#4682B4"}
                    onBlur={e => e.target.style.borderColor = "rgba(135,206,235,0.3)"}
                  />
                  {f.key === "password" && (
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      style={{
                        position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "#88AACC", padding: 4,
                      }}
                      tabIndex={-1}
                    >
                      {showPwd ? <EyeOff /> : <Eye />}
                    </button>
                  )}
                </div>
                {f.key === "password" && <PasswordStrength strength={strength} />}
                {f.key === "confirm" && form.confirm && form.password !== form.confirm && (
                  <p style={{ color: "#E07070", fontSize: 10, margin: "4px 0 0" }}>
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>
            );
          }
          return (
            <div key={f.key} style={{ marginBottom: 10 }}>
              <label style={{ color: "#4682B4", fontSize: 11, marginBottom: "5px", display: "block", fontWeight: 600 }}>
                {f.label} {f.required && <span style={{ color: "#E07070" }}>*</span>}
              </label>
              <input
                autoFocus
                type={f.type}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                onKeyDown={e => { if (e.key === "Enter") next(); }}
                placeholder={f.placeholder}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: "10px",
                  border: "1px solid rgba(135,206,235,0.3)", background: "rgba(255,255,255,0.8)",
                  color: "#446688", fontSize: "0.9rem", outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = "#4682B4"}
                onBlur={e => e.target.style.borderColor = "rgba(135,206,235,0.3)"}
              />
            </div>
          );
        })}

        {error && (
          <p style={{
            color: "#E07070", fontSize: 11, margin: "6px 0 0",
            padding: "6px 10px", background: "rgba(224,112,112,0.08)",
            borderRadius: 6, border: "1px solid rgba(224,112,112,0.2)",
          }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              style={{
                flex: 1, padding: "11px", borderRadius: "10px",
                border: "1px solid rgba(135,206,235,0.3)", background: "transparent",
                color: "#4682B4", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
              }}>Atrás</button>
          )}
          <button onClick={next} disabled={loading}
            style={{
              flex: 2, padding: "11px", borderRadius: "10px",
              border: "none",
              background: loading ? "rgba(135,206,235,0.4)" : "linear-gradient(135deg, #87CEEB, #4682B4)",
              color: "#FFF", fontWeight: 600, cursor: loading ? "wait" : "pointer",
              fontSize: "0.85rem", letterSpacing: 0.5,
            }}>
            {loading ? "Registrando..." : (isLast ? "Crear cuenta" : "Siguiente")}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 10, color: "#88AACC", margin: "10px 0 0" }}>
          🔒 Tu contraseña se cifra con bcrypt antes de guardarse
        </p>
      </div>
    </div>
  );
}

function getPasswordStrength(pwd) {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 6) s++;
  if (pwd.length >= 10) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return Math.min(s, 4);
}

function PasswordStrength({ strength }) {
  const labels = ["", "Débil", "Aceptable", "Buena", "Fuerte"];
  const colors = ["", "#E07070", "#E0A050", "#88BB66", "#4682B4"];
  if (strength === 0) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
      <div style={{ display: "flex", gap: 3, flex: 1 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= strength ? colors[strength] : "rgba(135,206,235,0.15)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <span style={{ fontSize: 10, color: colors[strength], fontWeight: 600, minWidth: 60, textAlign: "right" }}>
        {labels[strength]}
      </span>
    </div>
  );
}

function Eye() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>;
}
function EyeOff() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>;
}

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
