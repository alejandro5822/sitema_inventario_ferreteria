import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import ModalSubcategoria from "../components/ModalSubcategoria";

const SubCategorias = () => {
  const { token } = useAuth();
  const [subcategorias, setSubcategorias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState(null);

  // Paginación
  const itemsPorPagina = 7;
  const [paginaActual, setPaginaActual] = useState(1);
  const totalPaginas = Math.ceil(subcategorias.length / itemsPorPagina);
  const indicePrimerItem = (paginaActual - 1) * itemsPorPagina;
  const indiceUltimoItem = indicePrimerItem + itemsPorPagina;
  const subcategoriasActuales = subcategorias.slice(indicePrimerItem, indiceUltimoItem);

  const obtenerSubcategorias = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/subcategorias", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubcategorias(data);
    } catch (error) {
      console.error("Error al obtener subcategorías:", error);
    }
  };

  useEffect(() => {
    obtenerSubcategorias();
  }, []);

  const abrirModalCrear = () => {
    setSubcategoriaSeleccionada(null); // modo creación
    setModalAbierto(true);
  };

  const abrirModalEditar = (sub) => {
    setSubcategoriaSeleccionada(sub); // modo edición
    setModalAbierto(true);
  };

  const manejarEliminar = async (id) => {
    const confirmar = confirm("¿Deseas eliminar esta subcategoría?");
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:4000/api/subcategorias/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo eliminar.");
        return;
      }

      obtenerSubcategorias();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Lista de Subcategorías</h2>
        <button
          onClick={abrirModalCrear}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Nueva Subcategoría
        </button>
      </div>

      <table className="w-full border text-left text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">N°</th>
            <th className="border px-4 py-2">Sub Categoría</th>
            <th className="border px-4 py-2">Categoría</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {subcategoriasActuales.map((sub, index) => (
            <tr key={sub.id} className="border-t hover:bg-gray-50">
              <td className="border px-4 py-2">{indicePrimerItem + index + 1}</td>
              <td className="border px-4 py-2">{sub.nombre}</td>
              <td className="border px-4 py-2">{sub.categoria_nombre}</td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  onClick={() => {
                    abrirModalEditar(sub);
                  }}
                >
                  Editar
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  onClick={() => manejarEliminar(sub.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
        <ModalSubcategoria
          cerrarModal={() => setModalAbierto(false)}
          onGuardar={obtenerSubcategorias}
          subcategoriaSeleccionada={subcategoriaSeleccionada}
        />
      )}
    </div>
  );
}

export default SubCategorias;