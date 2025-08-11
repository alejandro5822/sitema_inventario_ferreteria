// src/pages/Usuarios.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import UsuarioForm from "../components/UsuarioForm";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Usuarios = () => {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(5);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Filtros
  const [tipoBusqueda, setTipoBusqueda] = useState("nombre");
  const [valorBusqueda, setValorBusqueda] = useState("");
  const [valorBusquedaTemp, setValorBusquedaTemp] = useState("");

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

  // Filtrado
  const usuariosFiltrados = usuarios.filter((usuario) => {
    if (!valorBusqueda) return true;
    switch (tipoBusqueda) {
      case "nombre":
        return usuario.nombre?.toLowerCase().includes(valorBusqueda.toLowerCase());
      case "correo":
        return usuario.correo?.toLowerCase().includes(valorBusqueda.toLowerCase());
      case "rol":
        return usuario.rol?.toLowerCase() === valorBusqueda.toLowerCase();
      case "estado":
        if (valorBusqueda === "activo") return usuario.estado === true;
        if (valorBusqueda === "inactivo") return usuario.estado === false;
        return true;
      case "fecha":
        // Busca por fecha exacta (formato yyyy-mm-dd)
        const fechaUsuario = new Date(usuario.fecha_creacion).toISOString().slice(0, 10);
        return fechaUsuario === valorBusqueda;
      default:
        return true;
    }
  });

  // Paginación sobre filtrados
  const totalPaginas = Math.ceil(usuariosFiltrados.length / itemsPorPagina);
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const itemsActuales = usuariosFiltrados.slice(indicePrimerItem, indiceUltimoItem);

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

  // Exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Lista de Usuarios", 15, 15);

    const columns = [
      "N°", "Nombre y Apellidos", "Correo", "Rol", "Estado", "Fecha de creación"
    ];
    const rows = itemsActuales.map((usuario, idx) => [
      indicePrimerItem + idx + 1,
      usuario.nombre,
      usuario.correo,
      usuario.rol,
      usuario.estado ? "Activo" : "Inactivo",
      new Date(usuario.fecha_creacion).toLocaleDateString()
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 25,
      styles: { fontSize: 10 }
    });

    doc.save("usuarios.pdf");
  };

  return (
    <div className="p-4 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Título y botón nuevo usuario */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-2xl font-semibold text-center sm:text-left dark:text-gray-100">Usuarios</h2>
        <button
          onClick={abrirModalNuevo}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Filtros y exportar PDF */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            value={tipoBusqueda}
            onChange={e => {
              setTipoBusqueda(e.target.value);
              setValorBusqueda("");
              setValorBusquedaTemp("");
              setPaginaActual(1);
            }}
            className="border px-2 py-1 rounded w-full sm:w-auto dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="nombre">Nombre</option>
            <option value="correo">Correo</option>
            <option value="rol">Rol</option>
            <option value="estado">Estado</option>
            <option value="fecha">Fecha</option>
          </select>
          {tipoBusqueda === "rol" ? (
            <select
              value={valorBusqueda}
              onChange={e => {
                setValorBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="border px-2 py-1 rounded w-full sm:w-auto dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Todos</option>
              <option value="Administrador">Administrador</option>
              <option value="Encargado">Encargado</option>
            </select>
          ) : tipoBusqueda === "estado" ? (
            <select
              value={valorBusqueda}
              onChange={e => {
                setValorBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="border px-2 py-1 rounded w-full sm:w-auto dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          ) : tipoBusqueda === "fecha" ? (
            <input
              type="date"
              value={valorBusqueda}
              onChange={e => {
                setValorBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="border px-2 py-1 rounded w-full sm:w-auto dark:bg-gray-800 dark:text-gray-100"
            />
          ) : (
            <>
              <input
                type="text"
                value={valorBusquedaTemp}
                onChange={e => setValorBusquedaTemp(e.target.value)}
                placeholder={`Buscar por ${tipoBusqueda}`}
                className="border px-2 py-1 rounded w-full sm:w-48 dark:bg-gray-800 dark:text-gray-100"
              />
              <button
                onClick={() => {
                  setValorBusqueda(valorBusquedaTemp);
                  setPaginaActual(1);
                }}
                className="bg-blue-600 text-white px-4 py-1 rounded w-full sm:w-auto"
              >
                Buscar
              </button>
            </>
          )}
        </div>
        <button
          onClick={exportarPDF}
          className="bg-red-600 text-white px-4 py-1 rounded w-full sm:w-auto"
        >
          Exportar PDF
        </button>
      </div>

      {/* Tabla para pantallas medianas y grandes */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full border bg-white dark:bg-gray-800 dark:text-gray-100 shadow text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-2 border dark:border-gray-700">N°</th>
              <th className="p-2 border dark:border-gray-700">Nombre y Apellidos</th>
              <th className="p-2 border dark:border-gray-700">Correo</th>
              <th className="p-2 border dark:border-gray-700">Rol</th>
              <th className="p-2 border dark:border-gray-700">Estado</th>
              <th className="p-2 border dark:border-gray-700">Fecha de creacion</th>
              <th className="p-2 border dark:border-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {itemsActuales.map((usuario, index) => (
              <tr key={usuario.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="p-2 border dark:border-gray-700">{indicePrimerItem + index + 1}</td>
                <td className="p-2 border dark:border-gray-700">{usuario.nombre}</td>
                <td className="p-2 border dark:border-gray-700">{usuario.correo}</td>
                <td className="p-2 border dark:border-gray-700">{usuario.rol}</td>
                {usuario.estado === true ? (
                  <td className="p-2 border dark:border-gray-700 text-green-500">Activo</td>
                ) : (
                  <td className="p-2 border dark:border-gray-700 text-red-500">Inactivo</td>
                )}
                <td className="p-2 border dark:border-gray-700">
                  {new Date(usuario.fecha_creacion).toLocaleDateString()}
                </td>
                <td className="p-2 border dark:border-gray-700 space-x-2">
                  <button
                    onClick={() => abrirModalEditar(usuario)}
                    className="text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
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
        {usuarios.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 mt-4">No hay registros de usuarios.</p>
        )}
      </div>

      {/* Cards para móviles */}
      <div className="sm:hidden flex flex-col gap-4">
        {itemsActuales.map((usuario, index) => (
          <div key={usuario.id} className="bg-white dark:bg-gray-800 dark:text-gray-100 shadow rounded border p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-blue-700 dark:text-blue-300">
                {indicePrimerItem + index + 1}. {usuario.nombre}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(usuario.fecha_creacion).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm mb-1">
              <span className="font-semibold">Correo:</span> {usuario.correo}
            </div>
            <div className="text-sm mb-1">
              <span className="font-semibold">Rol:</span> {usuario.rol}
            </div>
            <div className="text-sm mb-1">
              <span className="font-semibold">Estado:</span>{" "}
              {usuario.estado === true ? (
                <span className="text-green-500">Activo</span>
              ) : (
                <span className="text-red-500">Inactivo</span>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => abrirModalEditar(usuario)}
                className="text-white bg-blue-500 hover:bg-blue-600 px-2 py-2 rounded w-full"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  if (window.confirm("¿Deseas eliminar este usuario?")) {
                    eliminarUsuario(usuario.id);
                  }
                }}
                className="text-white bg-red-500 hover:bg-red-600 px-2 py-2 rounded w-full"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {usuarios.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 mt-4">No hay registros de usuarios.</p>
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center mt-4 gap-4">
          <button
            onClick={paginaAnterior}
            disabled={paginaActual === 1}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded dark:text-gray-100"
          >
            Anterior
          </button>
          <span className="text-sm font-medium dark:text-gray-100">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            onClick={siguientePagina}
            disabled={paginaActual === totalPaginas}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded dark:text-gray-100"
          >
            Siguiente
          </button>
        </div>
      )}

      {mostrarModal && (
        <UsuarioForm
          usuario={usuarioSeleccionado}
          cerrar={() => {
            setMostrarModal(false);
            obtenerUsuarios();
          }}
        />
      )}
    </div>
  );
};

export default Usuarios;
