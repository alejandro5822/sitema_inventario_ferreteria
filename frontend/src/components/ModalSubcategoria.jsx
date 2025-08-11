import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { toast } from 'react-toastify';

const ModalSubcategoria = ({ cerrarModal, onGuardar, subcategoriaSeleccionada }) => {
  const { token } = useAuth();
  const [nombre, setNombre] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    if (subcategoriaSeleccionada) {
      setNombre(subcategoriaSeleccionada.nombre || "");
      setCategoriaId(subcategoriaSeleccionada.categoria_id || "");
    }
  }, [subcategoriaSeleccionada]);

  const obtenerCategorias = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/categorias", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !categoriaId) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      const url = subcategoriaSeleccionada
        ? `http://localhost:4000/api/subcategorias/${subcategoriaSeleccionada.id}`
        : "http://localhost:4000/api/subcategorias";

      const method = subcategoriaSeleccionada ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, categoria_id: categoriaId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al registrar subcategoría");
        return;
      }
      toast.success("Subcategoría guardada correctamente");
      onGuardar(); // Actualiza listado
      cerrarModal(); // Cierra modal
    } catch (error) {
      console.error("Error al guardar subcategoría:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 dark:text-gray-100 p-6 rounded w-full max-w-md shadow transition-colors">
        <h2 className="text-xl font-bold mb-4">
          {subcategoriaSeleccionada ? "Editar Subcategoría" : "Nueva Subcategoría"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoría:</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">-- Selecciona una categoría --</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cerrarModal}
              className="px-4 py-2 border rounded bg-red-500 hover:bg-red-600 text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              {subcategoriaSeleccionada ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalSubcategoria;