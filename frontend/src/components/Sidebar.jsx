import { Link } from "react-router-dom";
import {
  Home,
  Boxes,
  RefreshCw,
  LineChart,
  Users,
  Cog,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";

const Sidebar = ({ open, setOpen }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const { usuario } = useAuth();

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <aside
      className={`
        fixed sm:static top-0 left-0 z-40
        bg-gray-800 text-white p-4 h-full w-64
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        sm:translate-x-0 sm:w-56 sm:h-screen
      `}
      aria-label="Menú lateral"
    >
      <button
        className="sm:hidden absolute top-4 right-4 text-gray-300"
        onClick={() => setOpen(false)}
        aria-label="Cerrar menú"
      >
        <ChevronLeft size={28} />
      </button>
      <h2 className="text-2xl font-bold mb-6">InventarioApp</h2>

      <Link
        to="/"
        className="flex items-center gap-2 mb-4 hover:text-yellow-400"
        onClick={() => setOpen(false)}
      >
        <Home size={20} /> Inicio
      </Link>

      <div>
        <button
          onClick={() => toggleMenu("inventario")}
          className="flex items-center justify-between w-full mb-2 hover:text-yellow-400"
        >
          <span className="flex items-center gap-2">
            <Boxes size={20} /> Inventario
          </span>
          {openMenu === "inventario" ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>
        {openMenu === "inventario" && (
          <ul className="ml-6 space-y-2 pt-2">
            <li>
              <Link
                to="/productos"
                className="hover:text-yellow-400"
                onClick={() => setOpen(false)}
              >
                Productos
              </Link>
            </li>
            <li>
              <Link
                to="/categorias"
                className="hover:text-yellow-400"
                onClick={() => setOpen(false)}
              >
                Categorías
              </Link>
            </li>
            <li>
              <Link
                to="/subcategorias"
                className="hover:text-yellow-400"
                onClick={() => setOpen(false)}
              >
                Subcategorías
              </Link>
            </li>
            <li>
              <Link
                to="/proveedores"
                className="hover:text-yellow-400"
                onClick={() => setOpen(false)}
              >
                Proveedores
              </Link>
            </li>
          </ul>
        )}
      </div>

      <div>
        <button
          onClick={() => toggleMenu("movimientos")}
          className="flex items-center justify-between w-full mt-4 hover:text-yellow-400"
        >
          <span className="flex items-center gap-2">
            <RefreshCw size={20} /> Movimientos
          </span>
          {openMenu === "movimientos" ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>
        {openMenu === "movimientos" && (
          <ul className="ml-6 space-y-2 pt-2">
            <li>
              <Link
                to="/movimientos"
                className="hover:text-yellow-400"
                onClick={() => setOpen(false)}
              >
                Registro
              </Link>
            </li>
          </ul>
        )}
      </div>
      {usuario.rol_nombre === "Administrador" && (
        <div>
          <button
            onClick={() => toggleMenu("historial")}
            className="flex items-center justify-between w-full mt-4 hover:text-yellow-400"
          >
            <span className="flex items-center gap-2">
              <LineChart size={20} /> Historial
            </span>
            {openMenu === "historial" ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>
          {openMenu === "historial" && (
            <ul className="ml-6 space-y-2 pt-2">
              <li>
                <Link
                  to="/historial-stock"
                  className="hover:text-yellow-400"
                  onClick={() => setOpen(false)}
                >
                  Historial de Stock
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
      {usuario.rol_nombre === "Administrador" && (
        <div>
          <button
            onClick={() => toggleMenu("usuarios")}
            className="flex items-center justify-between w-full mt-4 hover:text-yellow-400"
          >
            <span className="flex items-center gap-2">
              <Users size={20} /> Usuarios
            </span>
            {openMenu === "usuarios" ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>
          {openMenu === "usuarios" && (
            <ul className="ml-6 space-y-2 pt-2">
              <li>
                <Link
                  to="/usuarios"
                  className="hover:text-yellow-400"
                  onClick={() => setOpen(false)}
                >
                  Lista de Usuarios
                </Link>
              </li>
              <li>
                <Link
                  to="/roles"
                  className="hover:text-yellow-400"
                  onClick={() => setOpen(false)}
                >
                  Roles
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}

      <Link
        to="/reposiciones"
        className="flex items-center gap-2 mt-6 hover:text-yellow-400"
        onClick={() => setOpen(false)}
      >
        <ShoppingCart size={20} /> Reposiciones
      </Link>

      <Link
        to="/configuracion"
        className="flex items-center gap-2 mt-6 hover:text-yellow-400"
        onClick={() => setOpen(false)}
      >
        <Cog size={20} /> Configuración
      </Link>
    </aside>
  );
};

export default Sidebar;
