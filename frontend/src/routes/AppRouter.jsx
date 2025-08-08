import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "../auth/AuthContext.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import DashboardHome from "../pages/DashboardHome.jsx";
import Login from "../pages/Login.jsx";
import Usuarios from "../pages/Usuarios.jsx";
import SubCategorias from "../pages/SubCategorias.jsx";
import Roles from "../pages/Roles.jsx";
import Reportes from "../pages/Reportes.jsx";
import Proveedores from "../pages/Proveedores.jsx";
import Productos from "../pages/Productos.jsx";
import HistorialStock from "../pages/HistorialStock.jsx";
import Movimientos from "../pages/Movimientos.jsx";
import Configuracion from "../pages/Configuracion.jsx";
import Categorias from "../pages/Categorias.jsx";

export default function AppRouter() {
  const { usuario } = useAuthContext();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!usuario ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={
            usuario ? <DashboardLayout /> : <Navigate to="/login" />
          }
        >
          <Route index element={<DashboardHome />} />
          {/* Aquí puedes agregar más rutas hijas */}
          <Route path="productos" element={<Productos />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="subcategorias" element={<SubCategorias />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="movimientos" element={<Movimientos />} />
          <Route path="historial-stock" element={<HistorialStock />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="roles" element={<Roles />} />
          <Route path="configuracion" element={<Configuracion />} />
          {/* Otras rutas anidadas */}
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}