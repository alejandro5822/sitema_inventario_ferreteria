import { useAuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

export default function Navbar({ onMenuClick }) {
  const { usuario, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md px-4 sm:px-6 py-3 flex justify-between items-center h-16">
      <button
        className="sm:hidden mr-2 text-gray-700"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Menu size={28} />
      </button>
      <h1 className="text-lg font-bold text-gray-700 flex-1">Panel de Control</h1>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden sm:block text-gray-600">
          <p className="font-bold">Bienvenido: </p>
          {usuario?.nombre ?? "Usuario"} ({usuario?.rol_nombre ?? "Invitado"})
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}