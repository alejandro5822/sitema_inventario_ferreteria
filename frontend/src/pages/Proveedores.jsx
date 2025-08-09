import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import ModalProveedor from "../components/ModalProveedor";

const Proveedores = () => {
  const { token } = useAuth();
  const [proveedores, setProveedores] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorActual, setProveedorActual] = useState(null);

  // Paginación
  const itemsPorPagina = 5;
  const [paginaActual, setPaginaActual] = useState(1);
  const totalPaginas = Math.ceil(proveedores.length / itemsPorPagina);
  const indicePrimerItem = (paginaActual - 1) * itemsPorPagina;
  const indiceUltimoItem = indicePrimerItem + itemsPorPagina;
  const proveedoresActuales = proveedores.slice(indicePrimerItem, indiceUltimoItem);

  const obtenerProveedores = async () => {
    try {
      const { data } = await axios.get("http://localhost:4000/api/proveedores");
      setProveedores(data);
    } catch (error) {
      console.error("Error al obtener proveedores", error);
    }
  };

  const abrirModal = (proveedor = null) => {
    setProveedorActual(proveedor);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setProveedorActual(null);
    setModalAbierto(false);
    obtenerProveedores();
  };

  useEffect(() => {
    obtenerProveedores();
  }, []);

  async function eliminarProveedor(id) {
    const confirmar = confirm("¿Deseas eliminar este proveedor?");
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:4000/api/proveedores/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        // Si la respuesta no es JSON, data queda vacío
      }

      if (!res.ok) {
        alert(data.error || "No se pudo eliminar.");
        return;
      }
      obtenerProveedores();
    } catch (error) {
      alert("Ocurrió un error al eliminar el proveedor.");
      console.error("Error al eliminar proveedor:", error);
    }
  }

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Lista de Proveedores</h2>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          onClick={() => abrirModal()}
        >
          Agregar proveedor
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-left text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Nombre</th>
              <th className="px-4 py-2 border">Correo</th>
              <th className="px-4 py-2 border">Teléfono</th>
              <th className="px-4 py-2 border">Dirección</th>
              <th className="px-4 py-2 border">Fecha de Registro</th>
              <th className="px-4 py-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresActuales.map((proveedor, index) => (
              <tr key={proveedor.id}>
                <td className="border px-4 py-2">{indicePrimerItem + index + 1}</td>
                <td className="border px-4 py-2">{proveedor.nombre}</td>
                <td className="border px-4 py-2">{proveedor.correo}</td>
                <td className="border px-4 py-2">{proveedor.telefono}</td>
                <td className="border px-4 py-2">{proveedor.direccion}</td>
                <td className="border px-4 py-2">{proveedor.fecha_creacion}</td>
                <td className="border px-4 py-3 space-x-2 flex justify-center">
                  <button
                    className="px-2 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                    onClick={() => abrirModal(proveedor)}
                  >
                    Editar
                  </button>
                  <button
                    className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                    onClick={() => eliminarProveedor(proveedor.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Anterior
          </button>
          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              onClick={() => cambiarPagina(i + 1)}
              className={`px-3 py-1 rounded ${
                paginaActual === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Siguiente
          </button>
        </div>
      )}

      {modalAbierto && (
        <ModalProveedor proveedor={proveedorActual} cerrarModal={cerrarModal} />
      )}
    </div>
  );
};

export default Proveedores;
