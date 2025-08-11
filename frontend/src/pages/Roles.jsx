import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import RolFormModal from "../components/RolFormModal"; // crea este modal (más abajo doy una versión simple)

const Roles = () => {
  const { usuario, token } = useAuth();
  const navigate = useNavigate();

  // Protección: solo admin puede acceder
  useEffect(() => {
    // Ajusta rol comprobado según tu objeto usuario (rol_nombre, rol, etc.)
    const rolUsuario = usuario?.rol_nombre || usuario?.rol || usuario?.rolName;
    if (!usuario || !rolUsuario || !["admin", "Admin", "Administrador", "administrador"].includes(rolUsuario)) {
      // Si no es admin, redirigir al dashboard o mostrar mensaje
      navigate("/"); // o navigate("/login")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  const [roles, setRoles] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(5);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);

  const obtenerRoles = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(res.data);
    } catch (error) {
      console.error("Error al obtener roles:", error);
    }
  };

  useEffect(() => {
    if (token) obtenerRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const eliminarRol = async (id) => {
    const confirmar = window.confirm("¿Estás seguro de eliminar este rol?");
    if (!confirmar) return;

    try {
      await axios.delete(`http://localhost:4000/api/roles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      obtenerRoles();
    } catch (error) {
      console.error("Error al eliminar rol:", error);
      alert(error?.response?.data?.error || "No se pudo eliminar el rol.");
    }
  };

  // paginación local
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const itemsActuales = roles.slice(indicePrimerItem, indiceUltimoItem);
  const totalPaginas = Math.max(1, Math.ceil(roles.length / itemsPorPagina));

  const siguientePagina = () => {
    if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };

  const abrirModalNuevo = () => {
    setRolSeleccionado(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (rol) => {
    setRolSeleccionado(rol);
    setMostrarModal(true);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-2xl font-semibold text-center sm:text-left">Roles</h2>
        <button
          onClick={abrirModalNuevo}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
        >
          + Nuevo Rol
        </button>
      </div>

      {/* Tabla para pantallas medianas y grandes */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full border bg-white shadow text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">N°</th>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Descripción</th>
              <th className="p-2 border">Fecha de Creación</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {itemsActuales.map((rol, index) => (
              <tr key={rol.id} className="hover:bg-gray-100">
                <td className="p-2 border">{indicePrimerItem + index + 1}</td>
                <td className="p-2 border">{rol.nombre}</td>
                <td className="p-2 border">{rol.descripcion || "—"}</td>
                <td className="p-2 border">{new Date(rol.fecha_creacion).toLocaleDateString()}</td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => abrirModalEditar(rol)}
                    className="text-white bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarRol(rol.id)}
                    className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {roles.length === 0 && (
          <p className="text-gray-500 mt-4">No hay roles registrados.</p>
        )}
      </div>

      {/* Cards para móviles */}
      <div className="sm:hidden flex flex-col gap-4">
        {itemsActuales.map((rol, index) => (
          <div key={rol.id} className="bg-white shadow rounded border p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-blue-700">
                {indicePrimerItem + index + 1}. {rol.nombre}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(rol.fecha_creacion).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm mb-1">
              <span className="font-semibold">Descripción:</span> {rol.descripcion || "—"}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => abrirModalEditar(rol)}
                className="text-white bg-yellow-500 hover:bg-yellow-600 px-2 py-2 rounded w-full"
              >
                Editar
              </button>
              <button
                onClick={() => eliminarRol(rol.id)}
                className="text-white bg-red-500 hover:bg-red-600 px-2 py-2 rounded w-full"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {roles.length === 0 && (
          <p className="text-gray-500 mt-4">No hay roles registrados.</p>
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center mt-4 gap-4">
          <button
            onClick={paginaAnterior}
            disabled={paginaActual === 1}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Anterior
          </button>
          <span className="text-sm font-medium">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            onClick={siguientePagina}
            disabled={paginaActual === totalPaginas}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Siguiente
          </button>
        </div>
      )}

      {mostrarModal && (
        <RolFormModal
          rol={rolSeleccionado}
          cerrar={() => {
            setMostrarModal(false);
            obtenerRoles();
          }}
        />
      )}
    </div>
  );
};

export default Roles;
