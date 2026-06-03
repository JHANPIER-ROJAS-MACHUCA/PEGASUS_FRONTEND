import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function PromoBadge({ discount }) {
  if (!discount) return null;
  return (
    <div style={{
      position: "absolute", top: 10, right: 10, zIndex: 5,
      background: "linear-gradient(135deg, #FF8C8C, #FF6B6B)",
      color: "#FFF", fontSize: 10, fontWeight: 700,
      padding: "3px 10px", borderRadius: 20,
      letterSpacing: 1, boxShadow: "0 2px 8px rgba(255,107,107,0.3)",
    }}>
      -{discount}%
    </div>
  );
}

function SpecRow({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
      <span style={{ fontSize: 10, color: "#88AACC", letterSpacing: 0.3 }}>{label}</span>
      <span style={{ fontSize: 10, color: "#6699CC", fontWeight: 500 }}>{value || "—"}</span>
    </div>
  );
}

function HoloCard({ product, index, onClose }) {
  const palette = ["#87CEEB", "#B0E0FF", "#ADD8E6"];
  const color = palette[index % palette.length];
  const [expanded, setExpanded] = useState(false);

  const imgSrc = product.imagen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      style={{
        minWidth: 240, maxWidth: 280, flex: "0 0 auto",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        border: `1px solid rgba(135,206,235,0.15)`,
        borderRadius: 16, position: "relative", overflow: "hidden",
        boxShadow: `0 4px 20px rgba(135,206,235,0.08)`,
        cursor: "pointer",
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      whileHover={{ y: -6, scale: 1.02 }}
    >
      <PromoBadge discount={product.descuento} />

      <div style={{
        width: "100%", height: 150,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #F0F8FF, #E8F4FD)",
        borderBottom: "1px solid rgba(135,206,235,0.1)",
        overflow: "hidden", position: "relative",
      }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.nombre}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          />
        ) : (
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            border: "2px solid rgba(135,206,235,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(135,206,235,0.5)", fontSize: 24, fontWeight: "bold",
          }}>
            {product.nombre?.charAt(0) || "L"}
          </div>
        )}
      </div>

      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{
            fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase",
            color: "#87CEEB", background: "rgba(135,206,235,0.1)",
            padding: "2px 8px", borderRadius: 4,
          }}>
            {product.marca_nombre || "MARCA"}
          </span>
          <span style={{
            fontSize: 9, color: product.stock > 0 ? "#66BB88" : "#E07070",
            letterSpacing: 1, fontWeight: 500,
          }}>
            {product.stock > 0 ? "● EN STOCK" : "● AGOTADO"}
          </span>
        </div>

        <h3 style={{
          margin: "0 0 8px", fontSize: 13, fontWeight: 600,
          color: "#446688", letterSpacing: 0.3,
        }}>
          {product.nombre}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px", marginBottom: expanded ? 8 : 0 }}>
          <SpecRow label="CPU" value={product.procesador} />
          <SpecRow label="RAM" value={product.ram} />
          <SpecRow label="SSD" value={product.almacenamiento} />
          <SpecRow label="GPU" value={product.tarjeta_video} />
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 8, paddingTop: 8,
          borderTop: "1px solid rgba(135,206,235,0.12)",
        }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#446688", letterSpacing: 0.5 }}>
              S/{(Number(product.precio) || 0).toLocaleString()}
            </span>
            {product.descuento && (
              <span style={{
                fontSize: 10, color: "#FF6B6B", marginLeft: 8, fontWeight: 600,
                textDecoration: "line-through",
              }}>
                S/{Math.round((Number(product.precio) || 0) / (1 - (Number(product.descuento) || 0) / 100)).toLocaleString()}
              </span>
            )}
          </div>
          <button onClick={(e) => { e.stopPropagation(); onClose?.(product); }}
            style={{
              padding: "5px 12px", borderRadius: 8,
              border: "1px solid rgba(135,206,235,0.3)",
              background: "rgba(135,206,235,0.08)",
              color: "#87CEEB", fontSize: 10, fontWeight: 600, letterSpacing: 1,
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.target.style.background = "rgba(135,206,235,0.2)" }}
            onMouseLeave={(e) => { e.target.style.background = "rgba(135,206,235,0.08)" }}
          >
            DETALLES
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                margin: "8px 0 0", fontSize: 10, color: "#88AACC",
                lineHeight: 1.5, overflow: "hidden",
              }}
            >
              {product.descripcion || "Sin descripción disponible."}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function ProductHoloCards({ products, onSelectProduct }) {
  const scrollRef = useRef(null);

  if (!products || products.length === 0) return null;

  return (
    <div style={{ position: "relative", padding: "0 0 24px" }}>
      <div style={{
        position: "relative", height: 1,
        background: "linear-gradient(90deg, transparent, rgba(135,206,235,0.12), transparent)",
        marginBottom: 16, width: "60%", marginLeft: "20%",
      }} />
      <div ref={scrollRef}
        style={{
          display: "flex", gap: 14,
          overflowX: "auto", padding: "0 32px 16px",
          scrollBehavior: "smooth", scrollbarWidth: "none", msOverflowStyle: "none",
        }}
      >
        <AnimatePresence>
          {products.map((p, i) => (
            <HoloCard key={p.id_producto || i} product={p} index={i} onClose={onSelectProduct} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
