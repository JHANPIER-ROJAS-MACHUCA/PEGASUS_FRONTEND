import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import RegistrationModal from "../components/Register/RegistrationModal";
import LoginModal from "../components/Login/LoginModal";
import { logoutUser } from "../services/chatService";

const API = import.meta.env.VITE_API_URL || "";

export default function Tienda() {
  const [products, setProducts] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const clienteGuardado = localStorage.getItem("wendy_cliente");
    if (clienteGuardado) {
      try { setCliente(JSON.parse(clienteGuardado)); } catch {}
    }
    cargarDatos();
  }, []);

  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e) => {
      if (!e.target.closest("[data-usermenu]")) setShowUserMenu(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showUserMenu]);

  const handleLogout = () => {
    logoutUser();
    setCliente(null);
    setShowUserMenu(false);
    navigate("/");
  };

  async function cargarDatos() {
    try {
      const [prodsRes, catsRes] = await Promise.all([
        fetch(`${API}/api/products`).then(r => r.json()),
        fetch(`${API}/api/categorias`).then(r => r.json()),
      ]);
      setProducts(prodsRes || []);
      setCategorias(catsRes || []);
    } catch (e) {
      console.error("Error cargando datos:", e);
    } finally {
      setLoading(false);
    }
  }

  const productosFiltrados = products.filter(p => {
    if (categoriaFiltro && p.id_categoria !== categoriaFiltro) return false;
    if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
        !(p.marca_nombre || "").toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F0F8FF 0%, #E8F4FD 50%, #D6ECF8 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Top Bar */}
      <header style={{
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(135,206,235,0.15)",
        padding: "16px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, #87CEEB, #B0E0FF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(135,206,235,0.3)",
          }}>
            <span style={{ color: "#FFF", fontSize: 14, fontWeight: 700 }}>P</span>
          </div>
          <div>
            <div style={{ color: "#446688", fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>Pegasus Store</div>
            <div style={{ color: "#88AACC", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>Tienda de Laptops</div>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {cliente ? (
            <div style={{ position: "relative" }} data-usermenu>
              <button onClick={() => setShowUserMenu(s => !s)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 12px 6px 6px", borderRadius: 20,
                  background: "rgba(135,206,235,0.1)", border: "1px solid rgba(135,206,235,0.2)",
                  cursor: "pointer",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(135,206,235,0.2)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(135,206,235,0.1)"}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: "linear-gradient(135deg, #87CEEB, #4682B4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#FFF",
                }}>
                  {cliente.nombre?.charAt(0).toUpperCase() || "U"}
                </div>
                <span style={{ fontSize: 12, color: "#446688", fontWeight: 600 }}>{cliente.nombre?.split(" ")[0]}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#88AACC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showUserMenu && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "#FFFFFF", borderRadius: 12,
                  border: "1px solid rgba(135,206,235,0.2)",
                  boxShadow: "0 8px 24px rgba(70,130,180,0.15)",
                  minWidth: 240, overflow: "hidden", zIndex: 60,
                  animation: "fadeIn 0.15s ease",
                }}>
                  <div style={{
                    padding: "12px 14px",
                    background: "linear-gradient(135deg, rgba(135,206,235,0.15), rgba(176,224,255,0.2))",
                    borderBottom: "1px solid rgba(135,206,235,0.15)",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#446688" }}>{cliente.nombre}</div>
                    <div style={{ fontSize: 11, color: "#88AACC", marginTop: 2 }}>{cliente.email}</div>
                  </div>
                  <button onClick={() => setShowUserMenu(false)}
                    style={menuItemStyle}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(135,206,235,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4682B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Inicio
                  </button>
                  <button onClick={handleLogout}
                    style={{
                      ...menuItemStyle,
                      color: "#E07070",
                      borderTop: "1px solid rgba(135,206,235,0.1)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(224,112,112,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E07070" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => setShowLogin(true)} style={{
                color: "#4682B4", fontSize: 11, textDecoration: "none",
                padding: "7px 14px", border: "1px solid rgba(70,130,180,0.3)",
                borderRadius: 8, background: "rgba(255,255,255,0.7)",
                letterSpacing: 1, textTransform: "uppercase", fontWeight: 600,
                cursor: "pointer",
              }}>Iniciar sesión</button>
              <button onClick={() => setShowRegister(true)} style={{
                color: "#FFF", fontSize: 11, textDecoration: "none",
                padding: "7px 14px", letterSpacing: 1, textTransform: "uppercase",
                fontWeight: 600, border: "none", borderRadius: 8, cursor: "pointer",
                background: "linear-gradient(135deg, #87CEEB, #4682B4)",
              }}>Registrarme</button>
            </>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      <section style={{
        maxWidth: 1200, margin: "24px auto", padding: "0 24px",
      }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(135,206,235,0.2), rgba(176,224,255,0.3))",
          borderRadius: 20, padding: "32px 40px",
          border: "1px solid rgba(135,206,235,0.2)",
          boxShadow: "0 4px 20px rgba(135,206,235,0.08)",
          position: "relative", overflow: "hidden",
        }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#446688" }}>
            {cliente ? `¡Hola, ${cliente.nombre.split(" ")[0]}!` : "Encuentra tu laptop ideal"}
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "#6699CC", maxWidth: 600 }}>
            {cliente
              ? "Tienes acceso completo a precios exclusivos para clientes registrados."
              : "Explora nuestro catálogo. Tenemos laptops para cada necesidad."}
          </p>

          {!cliente && (
            <button onClick={() => setShowRegister(true)}
              style={{
                marginTop: 16, padding: "10px 22px", fontSize: 13, fontWeight: 700,
                background: "linear-gradient(135deg, #87CEEB, #4682B4)",
                color: "#FFF", border: "none", borderRadius: 10, cursor: "pointer",
                letterSpacing: 0.5, textTransform: "uppercase",
                boxShadow: "0 4px 14px rgba(135,206,235,0.3)",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Registrarme
            </button>
          )}
        </div>
      </section>

      {/* Filters */}
      <section style={{ maxWidth: 1200, margin: "0 auto 24px", padding: "0 24px" }}>
        <div style={{
          background: "rgba(255,255,255,0.7)", borderRadius: 16,
          padding: "12px 16px",
          border: "1px solid rgba(135,206,235,0.15)",
          display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap",
        }}>
          <input
            type="text" placeholder="Buscar laptop..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            style={{
              flex: 1, minWidth: 200, padding: "8px 14px", fontSize: 13,
              border: "1px solid rgba(135,206,235,0.2)", borderRadius: 8,
              background: "#FFFFFF", color: "#446688", outline: "none",
            }}
            onFocus={e => e.target.style.borderColor = "#87CEEB"}
            onBlur={e => e.target.style.borderColor = "rgba(135,206,235,0.2)"}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => setCategoriaFiltro(null)}
              style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 600,
                border: "1px solid", borderRadius: 20, cursor: "pointer",
                borderColor: !categoriaFiltro ? "#4682B4" : "rgba(135,206,235,0.2)",
                background: !categoriaFiltro ? "linear-gradient(135deg, #87CEEB, #4682B4)" : "transparent",
                color: !categoriaFiltro ? "#FFF" : "#88AACC",
                letterSpacing: 0.5,
              }}>Todas</button>
            {categorias.map(c => (
              <button key={c.id_categoria} onClick={() => setCategoriaFiltro(c.id_categoria)}
                style={{
                  padding: "6px 14px", fontSize: 12, fontWeight: 600,
                  border: "1px solid", borderRadius: 20, cursor: "pointer",
                  borderColor: categoriaFiltro === c.id_categoria ? "#4682B4" : "rgba(135,206,235,0.2)",
                  background: categoriaFiltro === c.id_categoria ? "linear-gradient(135deg, #87CEEB, #4682B4)" : "transparent",
                  color: categoriaFiltro === c.id_categoria ? "#FFF" : "#88AACC",
                  letterSpacing: 0.5,
                }}>{c.nombre}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 60px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#88AACC" }}>Cargando productos...</div>
        ) : productosFiltrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#88AACC" }}>
            No se encontraron productos con esos filtros.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}>
            {productosFiltrados.map(p => (
              <ProductCard key={p.id_producto} product={p} registrado={!!cliente} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{
        background: "rgba(255,255,255,0.7)", borderTop: "1px solid rgba(135,206,235,0.15)",
        padding: "20px 32px", textAlign: "center",
        color: "#88AACC", fontSize: 12,
      }}>
        Pegasus Store — Sistema de recomendación de laptops con Machine Learning © 2026
      </footer>

      {showRegister && (
        <RegistrationModal
          onClose={() => setShowRegister(false)}
          onRegistered={(c) => setCliente(c)}
        />
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLoggedIn={(c) => { setCliente(c); setShowLogin(false); }}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setTimeout(() => setShowRegister(true), 200);
          }}
        />
      )}
    </div>
  );
}

const menuItemStyle = {
  width: "100%", padding: "10px 14px",
  background: "transparent", border: "none",
  textAlign: "left", fontSize: 12, fontWeight: 600,
  color: "#446688", cursor: "pointer",
  display: "flex", alignItems: "center", gap: 10,
  letterSpacing: 0.3,
};

function ProductCard({ product, registrado }) {
  const p = Number(product.precio) || 0;
  const d = Number(product.descuento) || 0;
  const tieneDescuento = d > 0;
  const precioOriginal = tieneDescuento
    ? Math.round(p / (1 - d / 100))
    : p;

  return (
    <div style={{
      background: "rgba(255,255,255,0.85)",
      borderRadius: 16, overflow: "hidden",
      border: "1px solid rgba(135,206,235,0.15)",
      boxShadow: "0 4px 16px rgba(135,206,235,0.06)",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
      position: "relative",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(135,206,235,0.15)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(135,206,235,0.06)";
      }}
    >
      {/* Promo badge - solo visible si está registrado */}
      {tieneDescuento && (
        registrado ? (
          <div style={{
            position: "absolute", top: 10, right: 10, zIndex: 5,
            background: "linear-gradient(135deg, #FF8C8C, #FF6B6B)",
            color: "#FFF", fontSize: 11, fontWeight: 700,
            padding: "4px 10px", borderRadius: 20,
            letterSpacing: 1, boxShadow: "0 2px 8px rgba(255,107,107,0.3)",
          }}>
            -{product.descuento}%
          </div>
        ) : (
          <div style={{
            position: "absolute", top: 10, right: 10, zIndex: 5,
            background: "linear-gradient(135deg, #B08800, #806000)",
            color: "#FFF", fontSize: 10, fontWeight: 700,
            padding: "4px 10px", borderRadius: 20,
            letterSpacing: 0.5, boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            PROMO BLOQUEADA
          </div>
        )
      )}

      {/* Image */}
      <div style={{
        width: "100%", height: 180,
        background: "linear-gradient(135deg, #F0F8FF, #E8F4FD)",
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {product.imagen ? (
          <img
            src={product.imagen}
            alt={product.nombre}
            loading="lazy"
            onError={e => { e.currentTarget.style.display = "none"; }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "rgba(135,206,235,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#87CEEB", fontSize: 24, fontWeight: 700,
          }}>
            {product.nombre?.charAt(0) || "L"}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase",
            color: "#4682B4", background: "rgba(135,206,235,0.15)",
            padding: "2px 8px", borderRadius: 4,
          }}>
            {product.categoria_nombre}
          </span>
          <span style={{
            fontSize: 10, color: product.stock > 0 ? "#66BB88" : "#E07070",
            fontWeight: 600,
          }}>
            {product.stock > 0 ? "● Stock" : "● Agotado"}
          </span>
        </div>

        <div style={{
          fontSize: 10, color: "#88AACC", fontWeight: 600, letterSpacing: 1, marginBottom: 4,
        }}>
          {product.marca_nombre}
        </div>

        <h3 style={{
          margin: "0 0 10px", fontSize: 14, fontWeight: 600,
          color: "#446688", lineHeight: 1.3,
          minHeight: 36,
        }}>
          {product.nombre}
        </h3>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "3px 10px", marginBottom: 12,
          padding: "8px 10px", background: "rgba(135,206,235,0.05)",
          borderRadius: 8,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: "#88AACC" }}>CPU</span>
            <span style={{ fontSize: 10, color: "#6699CC", fontWeight: 500 }}>{product.procesador || "—"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: "#88AACC" }}>RAM</span>
            <span style={{ fontSize: 10, color: "#6699CC", fontWeight: 500 }}>{product.ram || "—"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: "#88AACC" }}>SSD</span>
            <span style={{ fontSize: 10, color: "#6699CC", fontWeight: 500 }}>{product.almacenamiento || "—"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: "#88AACC" }}>GPU</span>
            <span style={{ fontSize: 10, color: "#6699CC", fontWeight: 500 }}>{product.tarjeta_video || "—"}</span>
          </div>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 10, borderTop: "1px solid rgba(135,206,235,0.12)",
        }}>
          <div>
            {tieneDescuento && registrado && (
              <div style={{
                fontSize: 11, color: "#FF6B6B", textDecoration: "line-through",
                fontWeight: 500, marginBottom: 2,
              }}>
                S/{(precioOriginal || 0).toLocaleString()}
              </div>
            )}
            {tieneDescuento && !registrado && (
              <div style={{
                fontSize: 9, color: "#A07700", fontWeight: 600, marginBottom: 2,
                letterSpacing: 0.5,
              }}>
                Regístrate para ver descuento
              </div>
            )}
            <span style={{ fontSize: 20, fontWeight: 700, color: "#446688" }}>
              S/{p.toLocaleString()}
            </span>
          </div>
          <button style={{
            padding: "8px 14px", fontSize: 11, fontWeight: 600,
            background: "linear-gradient(135deg, #87CEEB, #4682B4)",
            color: "#FFF", border: "none", borderRadius: 8,
            cursor: "pointer", letterSpacing: 1,
            textTransform: "uppercase",
          }}>
            Ver más
          </button>
        </div>
      </div>
    </div>
  );
}
