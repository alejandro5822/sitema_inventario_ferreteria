import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { toast } from "react-toastify";
import axios from "axios";
import API from "../services/api.js"
const RolFormModal = ({ rol, cerrar }) => {
  const { token } = useAuth();
  const esEdicion = Boolean(rol);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (esEdicion) {
      setNombre(rol.nombre || "");
      setDescripcion(rol.descripcion || "");
    } else {
      setNombre("");
      setDescripcion("");
    }
  }, [rol, esEdicion]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (esEdicion) {
        await axios.put(`${API}/roles/${rol.id}`, { nombre, descripcion }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Rol actualizado correctamente");
      } else {
        await axios.post(`${API}/roles`, { nombre, descripcion }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Rol creado correctamente");
      }
      cerrar();
    } catch (error) {
      console.error("Error al guardar rol:", error);
      toast.error(error?.response?.data?.error || "No se pudo guardar el rol");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 dark:text-gray-100 p-6 rounded shadow-md w-full max-w-md transition-colors">
        <h3 className="text-lg font-bold mb-4">{esEdicion ? "Editar Rol" : "Nuevo Rol"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cerrar}
              className="px-4 py-2 border rounded bg-red-500 hover:bg-red-600 text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              {esEdicion ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolFormModal;
