import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import WendyWidget from "../components/WendyWidget";
import ProductHoloCards from "../components/ProductHoloCards";
import ProductComparison from "../components/ProductComparison";
import RegistrationModal from "../components/Register/RegistrationModal";
import LoginModal from "../components/Login/LoginModal";
import Promociones from "../components/Promociones";
import { logoutUser } from "../services/chatService";

const C = { c: "#87CEEB", c2: "#B0E0FF", g: "#4682B4", gb: "#6699CC", b: "#FFFFFF" };

export default function Home() {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [products, setProducts] = useState([]);
  const [recomendadoId, setRecomendadoId] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [cliente, setCliente] = useState(null);
  const [lastGuidance, setLastGuidance] = useState("");
  const productsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const guardada = localStorage.getItem("wendy_cliente");
    if (guardada) {
      try { setCliente(JSON.parse(guardada)); } catch {}
    }
  }, []);

  // Auto-scroll a productos cuando cambian
  useEffect(() => {
    if (products.length > 0) {
      const t1 = setTimeout(() => {
        const el = document.getElementById("productos");
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 70;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
      const t2 = setTimeout(() => {
        const el = document.getElementById("productos");
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 70;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 700);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [products]);

  const handleProductsUpdate = (newProducts, recomendadoId) => {
    setProducts(newProducts);
    setRecomendadoId(recomendadoId || null);
    // Si viene un recomendadoId, mostrar vista de comparación
    if (recomendadoId && newProducts.length >= 2) {
      setShowComparison(true);
    } else {
      setShowComparison(false);
    }
    const scrollToProducts = () => {
      if (productsRef.current) {
        const y = productsRef.current.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    };
    setTimeout(scrollToProducts, 200);
    setTimeout(scrollToProducts, 800);
  };

  const handleGuidanceUpdate = (g) => setLastGuidance(g);

  const handleLogout = () => {
    logoutUser();
    setCliente(null);
    setShowUserMenu(false);
    setProducts([]);
    setLastGuidance("");
  };

  // Cerrar menú de usuario al hacer click fuera
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e) => {
      if (!e.target.closest('[data-usermenu]')) setShowUserMenu(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showUserMenu]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F0F8FF 0%, #E8F4FD 50%, #D6ECF8 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      position: "relative",
    }}>
      {/* Top Bar */}
      <header style={{
        background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(135,206,235,0.15)",
        padding: "14px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, #87CEEB, #B0E0FF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(135,206,235,0.3)",
          }}>
            <span style={{ color: "#FFF", fontSize: 14, fontWeight: 700 }}>P</span>
          </div>
          <div>
            <div style={{ color: "#446688", fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
              Pegasus
            </div>
            <div style={{ color: "#88AACC", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase" }}>
              Asistente de laptops
            </div>
          </div>
        </div>

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
                  minWidth: 220, overflow: "hidden", zIndex: 60,
                  animation: "fadeIn 0.15s ease",
                }}>
                  <div style={{
                    padding: "12px 14px",
                    background: "linear-gradient(135deg, rgba(135,206,235,0.15), rgba(176,224,255,0.2))",
                    borderBottom: "1px solid rgba(135,206,235,0.15)",
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#446688" }}>{cliente.nombre}</div>
                    <div style={{ fontSize: 10, color: "#88AACC", marginTop: 2 }}>{cliente.email}</div>
                  </div>
                  <button onClick={() => { setShowUserMenu(false); navigate("/tienda"); }}
                    style={menuItemStyle}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(135,206,235,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4682B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    Ver tienda
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
          <Link to="/tienda" style={{
            color: "#4682B4", fontSize: 12, textDecoration: "none",
            padding: "7px 14px", border: "1px solid rgba(70,130,180,0.3)",
            borderRadius: 8, background: "rgba(255,255,255,0.6)",
            letterSpacing: 1, textTransform: "uppercase", fontWeight: 600,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(135,206,235,0.15)"; }}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.6)"}
          >Ver Tienda</Link>
          <Link to="/admin/login" style={{
            color: "#88AACC", fontSize: 11, textDecoration: "none",
            padding: "6px 12px", letterSpacing: 1, textTransform: "uppercase",
            fontWeight: 500,
          }}>Admin</Link>
        </div>
      </header>

      {/* Promociones Banner (locked si no registrado) */}
      <div style={{ paddingTop: 16 }}>
        <Promociones onLockedClick={() => setShowRegister(true)} />
      </div>

      {/* Productos Recomendados */}
      {products.length > 0 && (
        <section id="productos" ref={productsRef} key={products[0]?.id_producto || "p"} style={{
          maxWidth: 1200, margin: "0 auto", padding: "32px 24px 140px",
          scrollMarginTop: 80,
          animation: "slideUp 0.5s ease, highlightPulse 1.6s ease-out",
          borderRadius: 20,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 4,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, #87CEEB, #4682B4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(135,206,235,0.3)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#446688", letterSpacing: 0.3 }}>
                {showComparison ? "Comparación de laptops" : "Wendy te recomienda"}
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#88AACC" }}>
                {showComparison
                  ? "Wendy ya las comparó y te recomienda la mejor"
                  : `${products.length} ${products.length === 1 ? "opción seleccionada" : "opciones seleccionadas"} según tu perfil`}
              </p>
            </div>
            <Link to="/tienda" style={{
              color: "#4682B4", fontSize: 11, textDecoration: "none",
              padding: "7px 14px", border: "1px solid rgba(70,130,180,0.3)",
              borderRadius: 8, background: "rgba(255,255,255,0.7)",
              letterSpacing: 1, textTransform: "uppercase", fontWeight: 600,
              whiteSpace: "nowrap",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(135,206,235,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.7)"}
            >Ver tienda →</Link>
          </div>

          {/* Card de guía de decisión de Wendy */}
          <div style={{
            marginTop: 14, marginBottom: 18, padding: "12px 16px",
            background: showComparison
              ? "linear-gradient(135deg, rgba(70,180,100,0.12), rgba(135,206,235,0.18))"
              : "linear-gradient(135deg, rgba(135,206,235,0.15), rgba(176,224,255,0.2))",
            border: showComparison
              ? "1px solid rgba(70,180,100,0.25)"
              : "1px solid rgba(135,206,235,0.3)",
            borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 12,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: showComparison
                ? "linear-gradient(135deg, #88BB66, #4682B4)"
                : "linear-gradient(135deg, #87CEEB, #4682B4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#FFF",
            }}>P</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 11,
                color: showComparison ? "#3A8050" : "#4682B4",
                fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4,
              }}>
                {showComparison ? "Mi recomendación" : "Mi consejo"}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#446688", lineHeight: 1.5 }}>
                {lastGuidance || "Revisa cada opción y dime cuál te interesa. Si me cuentas qué priorizas (rendimiento, batería, portabilidad o precio), te ayudo a elegir la ideal."}
              </p>
            </div>
          </div>

          {/* Vista de comparación o tarjetas normales */}
          {showComparison && products.length >= 2 ? (
            <ProductComparison
              products={products}
              recomendadoId={recomendadoId}
              registrado={!!cliente}
            />
          ) : (
            <ProductHoloCards products={products} onSelectProduct={() => {}} />
          )}
        </section>
      )}

      {/* Productos destacados cuando no hay recomendaciones */}
      {products.length === 0 && <Destacados />}

      {/* Wendy Widget (welcome en primer plano al cargar) */}
      <WendyWidget
        onProductsUpdate={handleProductsUpdate}
        onShowRegister={() => setShowRegister(true)}
        onGuidanceUpdate={handleGuidanceUpdate}
        hasStarted={products.length > 0}
      />

      {/* Registration Modal */}
      {showRegister && (
        <RegistrationModal
          onClose={() => setShowRegister(false)}
          onRegistered={(c) => {
            setCliente(c);
            setShowRegister(false);
            setTimeout(() => navigate("/tienda"), 400);
          }}
        />
      )}

      {/* Login Modal */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLoggedIn={(c) => {
            setCliente(c);
            setShowLogin(false);
          }}
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

function Destacados() {
  const API_URL = import.meta.env.VITE_API_URL || "";
  const [prods, setProds] = useState([]);
  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const r = await fetch(`${API_URL}/api/products`);
      const data = await r.json();
      setProds((data || []).slice(0, 6));
    } catch {}
  }

  if (prods.length === 0) return null;

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 120px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 16,
      }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#446688" }}>
          Productos destacados
        </h2>
        <span style={{ fontSize: 12, color: "#88AACC" }}>
          Habla con Wendy para recomendaciones personalizadas
        </span>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 16,
      }}>
        {prods.map(p => (
          <div key={p.id_producto} style={{
            background: "rgba(255,255,255,0.8)",
            borderRadius: 14, overflow: "hidden",
            border: "1px solid rgba(135,206,235,0.15)",
            boxShadow: "0 2px 12px rgba(135,206,235,0.06)",
            transition: "transform 0.2s",
            cursor: "pointer", position: "relative",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            {p.descuento > 0 && (
              <div style={{
                position: "absolute", top: 8, right: 8, zIndex: 5,
                background: "linear-gradient(135deg, #FF8C8C, #FF6B6B)",
                color: "#FFF", fontSize: 10, fontWeight: 700,
                padding: "3px 8px", borderRadius: 16,
              }}>-{p.descuento}%</div>
            )}
            <div style={{
              width: "100%", height: 140, overflow: "hidden",
              background: "linear-gradient(135deg, #F0F8FF, #E8F4FD)",
            }}>
              {p.imagen && <img src={p.imagen} alt={p.nombre} loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: "#88AACC", fontWeight: 600, letterSpacing: 1 }}>
                {p.marca_nombre} • {p.categoria_nombre}
              </div>
              <h3 style={{ margin: "4px 0 8px", fontSize: 13, fontWeight: 600, color: "#446688" }}>
                {p.nombre}
              </h3>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#446688" }}>
                S/{Number(p.precio).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
