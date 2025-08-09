// src/pages/Usuarios.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import UsuarioForm from "../components/UsuarioForm";
import axios from "axios";

const Usuarios = () => {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(7);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const obtenerUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, [token]);

  const eliminarUsuario = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("No se pudo eliminar el usuario.");
    }
  };

  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const itemsActuales = usuarios.slice(indicePrimerItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(usuarios.length / itemsPorPagina);
  const siguientePagina = () => {
    if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };

  const abrirModalNuevo = () => {
    setUsuarioSeleccionado(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarModal(true);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Usuarios</h2>
        <button
          onClick={abrirModalNuevo}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nuevo Usuario
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border bg-white shadow text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">N°</th>
              <th className="p-2 border">Nombre y Apellidos</th>
              <th className="p-2 border">Correo</th>
              <th className="p-2 border">Rol</th>
              <th className="p-2 border">Estado</th>
              <th className="p-2 border">Fecha de creacion</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {itemsActuales.map((usuario, index) => (
              <tr key={usuario.id} className="hover:bg-gray-100">
                <td className="p-2 border">{indicePrimerItem + index + 1}</td>
                <td className="p-2 border">{usuario.nombre}</td>
                <td className="p-2 border">{usuario.correo}</td>
                <td className="p-2 border">{usuario.rol}</td>
                {usuario.estado === true ? (
                  <td className="p-2 border text-green-500">Activo</td>
                ) : (
                  <td className="p-2 border text-red-500">Inactivo</td>
                )}
                <td className="p-2 border">
                  {new Date(usuario.fecha_creacion).toLocaleDateString()}
                </td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => abrirModalEditar(usuario)}
                    className="text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      // Confirmar y eliminar
                      if (window.confirm("¿Deseas eliminar este usuario?")) {
                        eliminarUsuario(usuario.id);
                      }
                    }}
                    className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {mostrarModal && (
          <UsuarioForm
            usuario={usuarioSeleccionado}
            cerrar={() => {
              setMostrarModal(false);
              obtenerUsuarios();
            }}
          />
        )}

        {usuarios.length === 0 && (
          <p className="text-gray-500 mt-4">No hay registros de usuarios.</p>
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
    </div>
  );
};

export default Usuarios;
