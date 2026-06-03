import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiPackage, FiPercent, FiLogOut, FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiChevronLeft } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

const C = { c: "#87CEEB", c2: "#B0E0FF", g: "#6699CC", b: "#FFFFFF", t: "rgba(135,206,235," }

const API = import.meta.env.VITE_API_URL || "/api"

export default function Admin() {
  const [view, setView] = useState("products")
  const [products, setProducts] = useState([])
  const [promotions, setPromotions] = useState([])
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [preview, setPreview] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem("admin_token")

  useEffect(() => {
    if (!token) { navigate("/admin/login"); return }
    fetchProducts(); fetchPromotions(); fetchCategorias(); fetchMarcas()
  }, [])

  async function apiReq(method, path, body) {
    const opts = { method, headers: { "Authorization": `Bearer ${token}` } }
    if (body) {
      opts.body = body instanceof FormData ? body : JSON.stringify(body)
      if (!(body instanceof FormData)) opts.headers["Content-Type"] = "application/json"
    }
    const res = await fetch(`${API}${path}`, opts)
    return res.json()
  }

  async function fetchProducts() {
    const res = await apiReq("GET", "/admin/products")
    setProducts(res || [])
  }

  async function fetchPromotions() {
    const res = await apiReq("GET", "/admin/promotions")
    setPromotions(res || [])
  }

  async function fetchCategorias() {
    const res = await fetch(`${API}/categorias`)
    setCategorias(await res.json())
  }

  async function fetchMarcas() {
    const res = await fetch(`${API}/marcas`)
    setMarcas(await res.json())
  }

  function logout() { localStorage.removeItem("admin_token"); navigate("/admin/login") }

  function newProduct() {
    setEditing("new")
    setForm({ nombre: "", id_categoria: 1, id_marca: 1, descripcion: "", procesador: "", ram: "", almacenamiento: "", tarjeta_video: "", precio: "", stock: "0" })
    setPreview(null)
  }

  function editProduct(p) {
    setEditing(p.id_producto)
    setForm({ ...p })
    setPreview(p.imagen || null)
  }

  function cancelEdit() { setEditing(null); setForm({}); setPreview(null) }

  async function saveProduct() {
    const fd = new FormData()
    fd.append("nombre", form.nombre)
    fd.append("id_categoria", form.id_categoria)
    fd.append("id_marca", form.id_marca)
    fd.append("descripcion", form.descripcion || "")
    fd.append("procesador", form.procesador || "")
    fd.append("ram", form.ram || "")
    fd.append("almacenamiento", form.almacenamiento || "")
    fd.append("tarjeta_video", form.tarjeta_video || "")
    fd.append("precio", form.precio)
    fd.append("stock", form.stock || "0")
    if (form.imagen_file) fd.append("imagen", form.imagen_file)

    if (editing === "new") {
      await apiReq("POST", "/admin/products", fd)
    } else {
      await apiReq("PUT", `/admin/products/${editing}`, fd)
    }
    setEditing(null); setForm({}); setPreview(null)
    fetchProducts()
  }

  async function deleteProduct(id) {
    if (!confirm("¿Eliminar este producto?")) return
    await apiReq("DELETE", `/admin/products/${id}`)
    fetchProducts()
  }

  function newPromotion() {
    setEditing("promo_new")
    setForm({ titulo: "", descripcion: "", descuento: "", fecha_inicio: "", fecha_fin: "" })
  }

  function editPromotion(p) { setEditing(p.id_promocion); setForm({ ...p }) }

  async function savePromotion() {
    if (editing === "promo_new") {
      await apiReq("POST", "/admin/promotions", form)
    } else {
      await apiReq("PUT", `/admin/promotions/${editing}`, form)
    }
    setEditing(null); setForm({}); fetchPromotions()
  }

  async function deletePromotion(id) {
    if (!confirm("¿Eliminar esta promoción?")) return
    await apiReq("DELETE", `/admin/promotions/${id}`)
    fetchPromotions()
  }

  const si = {
    input: {
      width: "100%", padding: "10px 14px", fontSize: 13, borderRadius: 8,
      border: `1px solid ${C.t}0.2)`, background: C.b,
      color: "#446688", outline: "none", boxSizing: "border-box",
    },
    label: { display: "block", fontSize: 11, color: C.g, marginBottom: 4, fontWeight: 500, letterSpacing: 0.5 },
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F0F8FF 0%, #E8F4FD 50%, #D6ECF8 100%)",
      color: "#446688",
    }}>
      <header style={{
        background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.t}0.15)`, padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("/")}
            style={{ color: C.c, background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <FiChevronLeft size={20} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: C.g, margin: 0, letterSpacing: 1 }}>Panel Admin — Pegasus</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setView("products")}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
              border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: 1,
              background: view === "products" ? `linear-gradient(135deg, ${C.c}, ${C.c2})` : "rgba(255,255,255,0.6)",
              color: view === "products" ? C.b : C.c,
              transition: "all 0.2s",
            }}>
            <FiPackage /> Productos
          </button>
          <button onClick={() => setView("promotions")}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
              border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: 1,
              background: view === "promotions" ? `linear-gradient(135deg, ${C.c}, ${C.c2})` : "rgba(255,255,255,0.6)",
              color: view === "promotions" ? C.b : C.c,
              transition: "all 0.2s",
            }}>
            <FiPercent /> Promociones
          </button>
          <button onClick={logout}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
              border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500,
              background: "rgba(255,255,255,0.6)", color: "#E07070",
              transition: "all 0.2s",
            }}>
            <FiLogOut /> Salir
          </button>
        </div>
      </header>

      <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        {view === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.g, margin: 0 }}>
                Productos <span style={{ fontWeight: 400, fontSize: 14, color: C.c }}>({products.length})</span>
              </h2>
              <button onClick={newProduct}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: `linear-gradient(135deg, ${C.c}, ${C.c2})`,
                  color: C.b, border: "none", padding: "10px 20px", borderRadius: 10,
                  fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: 1,
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.target.style.opacity = "0.9"; e.target.style.transform = "translateY(-1px)" }}
                onMouseLeave={e => { e.target.style.opacity = "1"; e.target.style.transform = "none" }}
              >
                <FiPlus /> NUEVO PRODUCTO
              </button>
            </div>

            <div style={{
              background: C.b, borderRadius: 16,
              border: `1px solid ${C.t}0.12)`, overflow: "hidden",
              boxShadow: "0 4px 20px rgba(135,206,235,0.08)",
            }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.t}0.1)`, background: `${C.t}0.04)` }}>
                      <th style={th}>Nombre</th>
                      <th style={th}>Marca</th>
                      <th style={th}>CPU / RAM / Almac.</th>
                      <th style={th}>Video</th>
                      <th style={{ ...th, textAlign: "right" }}>Precio</th>
                      <th style={th}>Categoría</th>
                      <th style={{ ...th, textAlign: "center" }}>Stock</th>
                      <th style={{ ...th, textAlign: "center" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {products.map(p => (
                        <motion.tr key={p.id_producto} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          style={{ borderBottom: `1px solid ${C.t}0.06)`, transition: "background 0.2s" }}
                          onMouseEnter={e => e.target.style.background = `${C.t}0.03)`}
                          onMouseLeave={e => e.target.style.background = "transparent"}>
                          <td style={td}><span style={{ fontWeight: 500, color: "#446688" }}>{p.nombre}</span></td>
                          <td style={{ ...td, color: "#6699CC" }}>{p.marca_nombre}</td>
                          <td style={{ ...td, fontSize: 11, color: "#88AACC" }}>{p.procesador} | {p.ram} | {p.almacenamiento}</td>
                          <td style={{ ...td, fontSize: 11, color: "#88AACC" }}>{p.tarjeta_video || "—"}</td>
                          <td style={{ ...td, textAlign: "right", fontWeight: 600, color: "#446688" }}>S/{Number(p.precio).toLocaleString()}</td>
                          <td style={td}>
                            <span style={{
                              padding: "2px 8px", background: `${C.t}0.1)`, color: C.c, borderRadius: 4, fontSize: 10,
                            }}>{p.categoria_nombre}</span>
                          </td>
                          <td style={{ ...td, textAlign: "center" }}>
                            <span style={{ fontWeight: 700, color: p.stock > 0 ? "#66BB88" : "#E07070" }}>{p.stock}</span>
                          </td>
                          <td style={{ ...td, textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                              <button onClick={() => editProduct(p)}
                                style={{ color: C.c, background: `${C.t}0.1)`, border: "none", padding: 6, borderRadius: 6, cursor: "pointer" }}>
                                <FiEdit2 size={14} />
                              </button>
                              <button onClick={() => deleteProduct(p.id_producto)}
                                style={{ color: "#E07070", background: "rgba(224,112,112,0.1)", border: "none", padding: 6, borderRadius: 6, cursor: "pointer" }}>
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            <AnimatePresence>
              {editing === "new" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
                  }}
                  onClick={(e) => { if (e.target === e.currentTarget) cancelEdit() }}>
                  <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                    style={{
                      background: C.b, borderRadius: 20, padding: 28,
                      width: "100%", maxWidth: 560, margin: 16,
                      maxHeight: "90vh", overflowY: "auto",
                      boxShadow: "0 8px 40px rgba(135,206,235,0.15)",
                      border: `1px solid ${C.t}0.12)`,
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: C.g, margin: 0, letterSpacing: 1 }}>Nuevo Producto</h3>
                      <button onClick={cancelEdit} style={{ color: "#88AACC", background: "none", border: "none", cursor: "pointer" }}>
                        <FiX size={20} />
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div><label style={si.label}>Nombre</label>
                          <input style={si.input} value={form.nombre || ""} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
                        <div><label style={si.label}>Categoría</label>
                          <select style={si.input} value={form.id_categoria} onChange={e => setForm({ ...form, id_categoria: parseInt(e.target.value) })}>
                            {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                          </select></div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div><label style={si.label}>Marca</label>
                          <select style={si.input} value={form.id_marca} onChange={e => setForm({ ...form, id_marca: parseInt(e.target.value) })}>
                            {marcas.map(m => <option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>)}
                          </select></div>
                        <div><label style={si.label}>Precio (S/)</label>
                          <input type="number" style={si.input} value={form.precio || ""} onChange={e => setForm({ ...form, precio: e.target.value })} /></div>
                      </div>
                      <div><label style={si.label}>Descripción</label>
                        <textarea style={{ ...si.input, minHeight: 60, resize: "vertical" }} value={form.descripcion || ""}
                          onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div><label style={si.label}>Procesador</label>
                          <input style={si.input} value={form.procesador || ""} onChange={e => setForm({ ...form, procesador: e.target.value })} placeholder="Intel i7" /></div>
                        <div><label style={si.label}>RAM</label>
                          <input style={si.input} value={form.ram || ""} onChange={e => setForm({ ...form, ram: e.target.value })} placeholder="16GB" /></div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div><label style={si.label}>Almacenamiento</label>
                          <input style={si.input} value={form.almacenamiento || ""} onChange={e => setForm({ ...form, almacenamiento: e.target.value })} placeholder="512GB SSD" /></div>
                        <div><label style={si.label}>Tarjeta de Video</label>
                          <input style={si.input} value={form.tarjeta_video || ""} onChange={e => setForm({ ...form, tarjeta_video: e.target.value })} placeholder="RTX 3050" /></div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div><label style={si.label}>Stock</label>
                          <input type="number" style={si.input} value={form.stock || "0"} onChange={e => setForm({ ...form, stock: e.target.value })} /></div>
                        <div><label style={si.label}>Imagen</label>
                          <input type="file" accept="image/*" style={si.input} onChange={e => {
                            const file = e.target.files[0]
                            if (file) { setForm({ ...form, imagen_file: file }); setPreview(URL.createObjectURL(file)) }
                          }} /></div>
                      </div>
                      {preview && (
                        <div style={{ textAlign: "center" }}>
                          <img src={preview} alt="preview" style={{ maxHeight: 120, borderRadius: 8, border: `1px solid ${C.t}0.15)` }} />
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
                        <button onClick={saveProduct}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: `linear-gradient(135deg, ${C.c}, ${C.c2})`,
                            color: C.b, border: "none", padding: "10px 24px", borderRadius: 10,
                            fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: 1,
                          }}>
                          <FiSave /> Guardar
                        </button>
                        <button onClick={cancelEdit}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: `${C.t}0.1)`, color: C.g, border: "none",
                            padding: "10px 24px", borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: "pointer",
                          }}>
                          <FiX /> Cancelar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {view === "promotions" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.g, margin: 0 }}>
                Promociones <span style={{ fontWeight: 400, fontSize: 14, color: C.c }}>({promotions.length})</span>
              </h2>
              <button onClick={newPromotion}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: `linear-gradient(135deg, ${C.c}, ${C.c2})`,
                  color: C.b, border: "none", padding: "10px 20px", borderRadius: 10,
                  fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: 1,
                }}
                onMouseEnter={e => { e.target.style.opacity = "0.9"; e.target.style.transform = "translateY(-1px)" }}
                onMouseLeave={e => { e.target.style.opacity = "1"; e.target.style.transform = "none" }}
              >
                <FiPlus /> NUEVA PROMOCIÓN
              </button>
            </div>

            <div style={{
              background: C.b, borderRadius: 16,
              border: `1px solid ${C.t}0.12)`, overflow: "hidden",
              boxShadow: "0 4px 20px rgba(135,206,235,0.08)",
            }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.t}0.1)`, background: `${C.t}0.04)` }}>
                      <th style={th}>Título</th>
                      <th style={th}>Descripción</th>
                      <th style={th}>Dto.</th>
                      <th style={th}>Inicio</th>
                      <th style={th}>Fin</th>
                      <th style={{ ...th, textAlign: "center" }}>Activa</th>
                      <th style={{ ...th, textAlign: "center" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {promotions.map(p => (
                        <motion.tr key={p.id_promocion} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          style={{ borderBottom: `1px solid ${C.t}0.06)` }}>
                          <td style={{ ...td, fontWeight: 500, color: "#446688" }}>{p.titulo}</td>
                          <td style={{ ...td, color: "#88AACC", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.descripcion}</td>
                          <td style={{ ...td, color: "#66BB88", fontWeight: 700 }}>{p.descuento}%</td>
                          <td style={{ ...td, color: "#88AACC" }}>{p.fecha_inicio || "—"}</td>
                          <td style={{ ...td, color: "#88AACC" }}>{p.fecha_fin || "—"}</td>
                          <td style={{ ...td, textAlign: "center" }}>
                            <span style={{
                              padding: "2px 10px", borderRadius: 12, fontSize: 10, fontWeight: 600,
                              background: p.estado === "ACTIVA" ? "rgba(102,187,136,0.1)" : "rgba(224,112,112,0.1)",
                              color: p.estado === "ACTIVA" ? "#66BB88" : "#E07070",
                            }}>
                              {p.estado === "ACTIVA" ? "Sí" : "No"}
                            </span>
                          </td>
                          <td style={{ ...td, textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                              <button onClick={() => editPromotion(p)} style={{ color: C.c, background: `${C.t}0.1)`, border: "none", padding: 6, borderRadius: 6, cursor: "pointer" }}>
                                <FiEdit2 size={14} />
                              </button>
                              <button onClick={() => deletePromotion(p.id_promocion)} style={{ color: "#E07070", background: "rgba(224,112,112,0.1)", border: "none", padding: 6, borderRadius: 6, cursor: "pointer" }}>
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            <AnimatePresence>
              {(editing === "promo_new" || (typeof editing === "number" && promotions.some(p => p.id_promocion === editing))) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
                  }}
                  onClick={(e) => { if (e.target === e.currentTarget) cancelEdit() }}>
                  <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                    style={{
                      background: C.b, borderRadius: 20, padding: 28,
                      width: "100%", maxWidth: 480, margin: 16,
                      boxShadow: "0 8px 40px rgba(135,206,235,0.15)",
                      border: `1px solid ${C.t}0.12)`,
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: C.g, margin: 0, letterSpacing: 1 }}>
                        {editing === "promo_new" ? "Nueva Promoción" : "Editar Promoción"}
                      </h3>
                      <button onClick={cancelEdit} style={{ color: "#88AACC", background: "none", border: "none", cursor: "pointer" }}>
                        <FiX size={20} />
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div><label style={si.label}>Título</label>
                        <input style={si.input} value={form.titulo || ""} onChange={e => setForm({ ...form, titulo: e.target.value })} /></div>
                      <div><label style={si.label}>Descripción</label>
                        <input style={si.input} value={form.descripcion || ""} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div><label style={si.label}>Descuento (%)</label>
                          <input type="number" style={si.input} value={form.descuento || ""} onChange={e => setForm({ ...form, descuento: e.target.value })} /></div>
                        <div><label style={si.label}>Estado</label>
                          <select style={si.input} value={form.estado || "ACTIVA"} onChange={e => setForm({ ...form, estado: e.target.value })}>
                            <option value="ACTIVA">Activa</option>
                            <option value="INACTIVA">Inactiva</option>
                          </select></div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div><label style={si.label}>Fecha Inicio</label>
                          <input type="date" style={si.input} value={form.fecha_inicio || ""} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} /></div>
                        <div><label style={si.label}>Fecha Fin</label>
                          <input type="date" style={si.input} value={form.fecha_fin || ""} onChange={e => setForm({ ...form, fecha_fin: e.target.value })} /></div>
                      </div>
                      <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
                        <button onClick={savePromotion}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: `linear-gradient(135deg, ${C.c}, ${C.c2})`,
                            color: C.b, border: "none", padding: "10px 24px", borderRadius: 10,
                            fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: 1,
                          }}>
                          <FiSave /> Guardar
                        </button>
                        <button onClick={cancelEdit}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: `${C.t}0.1)`, color: C.g, border: "none",
                            padding: "10px 24px", borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: "pointer",
                          }}>
                          <FiX /> Cancelar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}

const th = { textAlign: "left", padding: "12px 12px", fontWeight: 600, color: "#88AACC", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }
const td = { padding: "10px 12px", color: "#6699CC", fontSize: 12 }
