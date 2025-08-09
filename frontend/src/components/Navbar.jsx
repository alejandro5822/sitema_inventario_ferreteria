import { useContext } from "react";
import { useAuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { usuario, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // limpia token y datos del usuario
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md px-6 py-3 flex justify-between items-center h-16">
      <h1 className="text-lg font-bold text-gray-700">Panel de Control</h1>
      <div className="flex items-center gap-4">
        <span className="text-gray-600">
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
