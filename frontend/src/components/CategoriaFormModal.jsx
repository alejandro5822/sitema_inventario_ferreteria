import { useState, useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import { toast } from 'react-toastify';


const CategoriaFormModal = ({ categoria, cerrar }) => {
  const { token } = useAuth();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState(null);
  const esEdicion = Boolean(categoria);

  useEffect(() => {
    if (esEdicion) {
      setNombre(categoria.nombre);
      setDescripcion(categoria.descripcion || "");
    } else {
      setNombre("");
      setDescripcion("");
    }
  }, [categoria]);

  const manejarSubmit = async (e) => {
    e.preventDefault();

    const datos = { nombre, descripcion };

    try {
      const url = esEdicion
        ? `http://localhost:4000/api/categorias/${categoria.id}`
        : "http://localhost:4000/api/categorias";

      const metodo = esEdicion ? "PUT" : "POST";

      const res = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
      });
      toast.success("Categoría guardada correctamente");
      if (!res.ok) throw new Error("Error al guardar la categoría");

      cerrar(); // Cerrar modal y refrescar
    } catch (error) {
      console.error("Error al guardar categoría:", error);
        toast.error("Error al guardar la categoría");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={manejarSubmit}
        className="bg-white p-6 rounded shadow-lg w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">
          {esEdicion ? "Editar Categoría" : "Nueva Categoría"}
        </h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={cerrar}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoriaFormModal;
