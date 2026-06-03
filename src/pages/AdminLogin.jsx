import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!data.success) { setError("Credenciales inválidas"); return }
      localStorage.setItem("admin_token", data.token)
      navigate("/admin")
    } catch {
      setError("Error de conexión con el servidor")
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F0F8FF 0%, #E8F4FD 50%, #D6ECF8 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
          borderRadius: 20, padding: 40, width: "100%", maxWidth: 400,
          boxShadow: "0 8px 32px rgba(135,206,235,0.15)",
          border: "1px solid rgba(135,206,235,0.15)",
        }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", margin: "0 auto 12px",
            background: "linear-gradient(135deg, #87CEEB, #B0E0FF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(135,206,235,0.3)",
          }}>
            <span style={{ color: "#FFF", fontSize: 18, fontWeight: 700 }}>P</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#6699CC", margin: 0 }}>Panel Admin</h1>
          <p style={{ fontSize: 13, color: "#87CEEB", margin: "4px 0 0" }}>Pegasus — Gestión de Productos</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#6699CC", marginBottom: 6, fontWeight: 500 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px", fontSize: 14, borderRadius: 10,
                border: "1px solid rgba(135,206,235,0.2)", background: "rgba(255,255,255,0.8)",
                color: "#446688", outline: "none", transition: "all 0.2s",
              }}
              placeholder="admin@pegasus.store" required
              onFocus={e => e.target.style.borderColor = "#87CEEB"}
              onBlur={e => e.target.style.borderColor = "rgba(135,206,235,0.2)"} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#6699CC", marginBottom: 6, fontWeight: 500 }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px", fontSize: 14, borderRadius: 10,
                border: "1px solid rgba(135,206,235,0.2)", background: "rgba(255,255,255,0.8)",
                color: "#446688", outline: "none", transition: "all 0.2s",
              }}
              placeholder="••••••" required
              onFocus={e => e.target.style.borderColor = "#87CEEB"}
              onBlur={e => e.target.style.borderColor = "rgba(135,206,235,0.2)"} />
          </div>
          {error && <p style={{ color: "#E07070", fontSize: 13, textAlign: "center", margin: 0 }}>{error}</p>}
          <button type="submit"
            style={{
              width: "100%", padding: "12px", fontSize: 14, fontWeight: 600, borderRadius: 10,
              border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #87CEEB, #B0E0FF)",
              color: "#FFF", letterSpacing: 1, transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.opacity = "0.9"; e.target.style.transform = "translateY(-1px)" }}
            onMouseLeave={e => { e.target.style.opacity = "1"; e.target.style.transform = "none" }}
          >
            Iniciar Sesión
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={() => navigate("/")}
            style={{
              color: "#87CEEB", fontSize: 13, border: "none", background: "none",
              cursor: "pointer", textDecoration: "none",
            }}>
            ← Volver al inicio
          </button>
        </div>
      </motion.div>
    </div>
  )
}
