import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import ModalSubcategoria from "../components/ModalSubcategoria";

const SubCategorias = () => {
  const { token } = useAuth();
  const [subcategorias, setSubcategorias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState(null);

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

      <table className="w-full border text-left">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Sub Categoria</th>
            <th className="border px-4 py-2">Categoría</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {subcategorias.map((sub) => (
            <tr key={sub.id} className="border-t hover:bg-gray-50">
              <td className="border px-4 py-2">{sub.id}</td>
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