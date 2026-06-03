import { BrowserRouter, Routes, Route } from "react-router-dom"
import { WendyProvider } from "./context/WendyContext"
import Home from "./pages/Home"
import Tienda from "./pages/Tienda"
import Admin from "./pages/Admin"
import AdminLogin from "./pages/AdminLogin"

function App() {
  return (
    <WendyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      </BrowserRouter>
    </WendyProvider>
  )
}

export default App
