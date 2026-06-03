import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>;
}

function CrossIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>;
}

function ComparisonCard({ product, isWinner, isCheapest, registrado }) {
  const p = Number(product.precio) || 0;
  const d = Number(product.descuento) || 0;
  const precioOriginal = d > 0
    ? Math.round(p / (1 - d / 100))
    : p;

  // Calcular pros y contras relativos (vs el resto)
  const ramMatch = (product.ram || "").match(/(\d+)/);
  const ramGb = ramMatch ? parseInt(ramMatch[1]) : 0;
  const tieneSSD = (product.almacenamiento || "").toLowerCase().includes("ssd");
  const tieneGPU = !!(product.tarjeta_video && product.tarjeta_video.length > 2);
  const esProcesadorPotente = /i7|i9|Ryzen [7-9]|M[1-3]/i.test(product.procesador || "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        flex: "0 0 280px", maxWidth: 320,
        background: isWinner
          ? "linear-gradient(180deg, rgba(135,206,235,0.15) 0%, rgba(255,255,255,0.95) 30%)"
          : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        borderRadius: 18, position: "relative", overflow: "hidden",
        border: isWinner
          ? "2px solid #4682B4"
          : "1px solid rgba(135,206,235,0.2)",
        boxShadow: isWinner
          ? "0 8px 32px rgba(70,130,180,0.25)"
          : "0 4px 16px rgba(135,206,235,0.08)",
      }}
    >
      {isWinner && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          background: "linear-gradient(90deg, #87CEEB, #4682B4)",
          color: "#FFF", fontSize: 11, fontWeight: 700,
          padding: "6px 0", textAlign: "center",
          letterSpacing: 1.5, textTransform: "uppercase",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <span style={{ fontSize: 14 }}>★</span> Recomendada por Wendy
        </div>
      )}

      {product.descuento > 0 && (
        <div style={{
          position: "absolute", top: isWinner ? 36 : 10, right: 10, zIndex: 5,
          background: "linear-gradient(135deg, #FF8C8C, #FF6B6B)",
          color: "#FFF", fontSize: 11, fontWeight: 700,
          padding: "4px 10px", borderRadius: 20,
        }}>
          -{product.descuento}%
        </div>
      )}

      <div style={{ paddingTop: isWinner ? 36 : 0 }}>
        {/* Imagen */}
        <div style={{
          width: "100%", height: 140,
          background: "linear-gradient(135deg, #F0F8FF, #E8F4FD)",
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {product.imagen ? (
            <img src={product.imagen} alt={product.nombre} loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{
              width: 50, height: 50, borderRadius: "50%",
              border: "2px solid rgba(135,206,235,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(135,206,235,0.5)", fontSize: 20, fontWeight: "bold",
            }}>
              {product.nombre?.charAt(0) || "L"}
            </div>
          )}
        </div>

        <div style={{ padding: "12px 14px 14px" }}>
          <div style={{ fontSize: 10, color: "#88AACC", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
            {product.marca_nombre}
          </div>
          <h3 style={{
            margin: "4px 0 10px", fontSize: 14, fontWeight: 700,
            color: "#446688", lineHeight: 1.2, minHeight: 34,
          }}>
            {product.nombre}
          </h3>

          {/* Specs */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "4px 8px", marginBottom: 12,
            padding: "8px 10px", background: "rgba(135,206,235,0.06)",
            borderRadius: 8,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: "#88AACC" }}>CPU</span>
              <span style={{ fontSize: 10, color: "#6699CC", fontWeight: 600 }}>{product.procesador || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: "#88AACC" }}>RAM</span>
              <span style={{ fontSize: 10, color: "#6699CC", fontWeight: 600 }}>{product.ram || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: "#88AACC" }}>SSD</span>
              <span style={{ fontSize: 10, color: "#6699CC", fontWeight: 600 }}>{product.almacenamiento || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: "#88AACC" }}>GPU</span>
              <span style={{ fontSize: 10, color: "#6699CC", fontWeight: 600 }}>{product.tarjeta_video || "Integrada"}</span>
            </div>
          </div>

          {/* Indicadores de fortaleza */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
            {ramGb >= 16 && (
              <span style={{
                fontSize: 9, padding: "3px 8px", borderRadius: 10,
                background: "rgba(70,180,100,0.12)", color: "#2A8050",
                display: "flex", alignItems: "center", gap: 3, fontWeight: 600,
              }}><CheckIcon /> {ramGb}GB RAM</span>
            )}
            {tieneSSD && (
              <span style={{
                fontSize: 9, padding: "3px 8px", borderRadius: 10,
                background: "rgba(70,130,180,0.12)", color: "#4682B4",
                display: "flex", alignItems: "center", gap: 3, fontWeight: 600,
              }}><CheckIcon /> SSD</span>
            )}
            {tieneGPU && (
              <span style={{
                fontSize: 9, padding: "3px 8px", borderRadius: 10,
                background: "rgba(180,100,200,0.12)", color: "#7A4A8A",
                display: "flex", alignItems: "center", gap: 3, fontWeight: 600,
              }}><CheckIcon /> GPU</span>
            )}
            {esProcesadorPotente && (
              <span style={{
                fontSize: 9, padding: "3px 8px", borderRadius: 10,
                background: "rgba(255,150,50,0.12)", color: "#A06000",
                display: "flex", alignItems: "center", gap: 3, fontWeight: 600,
              }}><CheckIcon /> CPU Potente</span>
            )}
            {isCheapest && !isWinner && (
              <span style={{
                fontSize: 9, padding: "3px 8px", borderRadius: 10,
                background: "rgba(80,180,140,0.15)", color: "#2A7050",
                display: "flex", alignItems: "center", gap: 3, fontWeight: 600,
              }}>💰 Más barata</span>
            )}
          </div>

          {/* Precio */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            paddingTop: 10, borderTop: "1px solid rgba(135,206,235,0.12)",
          }}>
            <div>
              {registrado && product.descuento > 0 && (
                <div style={{
                  fontSize: 10, color: "#FF6B6B", textDecoration: "line-through",
                  fontWeight: 500, marginBottom: 2,
                }}>
                  S/{(precioOriginal || 0).toLocaleString()}
                </div>
              )}
              <span style={{ fontSize: 20, fontWeight: 700, color: "#446688" }}>
                S/{(Number(product.precio) || 0).toLocaleString()}
              </span>
            </div>
            <button style={{
              padding: "7px 12px", fontSize: 10, fontWeight: 700,
              background: isWinner
                ? "linear-gradient(135deg, #87CEEB, #4682B4)"
                : "rgba(135,206,235,0.15)",
              color: isWinner ? "#FFF" : "#4682B4",
              border: "none", borderRadius: 8,
              cursor: "pointer", letterSpacing: 1,
              textTransform: "uppercase",
            }}>
              Ver más
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductComparison({ products, recomendadoId, registrado = true, onClose }) {
  if (!products || products.length < 2) return null;

  // Encontrar el más barato
  const masBarata = products.reduce((a, b) =>
    parseFloat(a.precio) < parseFloat(b.precio) ? a : b
  );

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(135,206,235,0.12), rgba(176,224,255,0.2))",
      borderRadius: 20, padding: "20px 24px 24px",
      border: "1px solid rgba(135,206,235,0.25)",
      boxShadow: "0 6px 24px rgba(70,130,180,0.08)",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 14,
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#446688" }}>
            Comparación de laptops
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#88AACC" }}>
            Wendy ya las comparó para ti · {products.length} opciones
          </p>
        </div>
      </div>

      <div style={{
        display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8,
        scrollBehavior: "smooth",
      }}>
        {products.map(p => (
          <ComparisonCard
            key={p.id_producto}
            product={p}
            isWinner={p.id_producto === recomendadoId}
            isCheapest={p.id_producto === masBarata.id_producto}
            registrado={registrado}
          />
        ))}
      </div>
    </div>
  );
}
