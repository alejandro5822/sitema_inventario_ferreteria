import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API from "../services/api.js";

const ModalProveedor = ({ proveedor, cerrarModal }) => {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fecha_creacion, setFechaCreacion] = useState("");

  useEffect(() => {
    if (proveedor) {
      setNombre(proveedor.nombre);
      setCorreo(proveedor.correo);
      setTelefono(proveedor.telefono);
      setDireccion(proveedor.direccion);
      setFechaCreacion(proveedor.fecha_creacion);
    } else {
      setNombre("");
      setCorreo("");
      setTelefono("");
      setDireccion("");
      setFechaCreacion("");
    }
  }, [proveedor]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevoProveedor = {
      nombre,
      correo,
      telefono,
      direccion,
      fecha_creacion: new Date().toISOString(),
    };

    try {
      if (proveedor) {
        await axios.put(
          `${API}/proveedores/${proveedor.id}`,
          nuevoProveedor
        );
      } else {
        await axios.post(
          `${API}/proveedores`,
          nuevoProveedor
        );
      }
      cerrarModal();
      toast.success("Proveedor guardado exitosamente");
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
      toast.error("Error al guardar proveedor");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 dark:text-gray-100 p-6 rounded w-full max-w-md shadow transition-colors">
        <h2 className="text-lg font-bold mb-4">
          {proveedor ? "Editar proveedor" : "Nuevo proveedor"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium">Nombre:</label>
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded mt-1 dark:bg-gray-700 dark:text-gray-100"
          />
          <label className="block text-sm font-medium">Correo:</label>
          <input
            type="email"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded mt-1 dark:bg-gray-700 dark:text-gray-100"
          />
          <label className="block text-sm font-medium">Teléfono:</label>
          <input
            type="tel"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded mt-1 dark:bg-gray-700 dark:text-gray-100"
          />
          <label className="block text-sm font-medium">Dirección:</label>
          <input
            type="text"
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded mt-1 dark:bg-gray-700 dark:text-gray-100"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              variant="outline"
              onClick={cerrarModal}
              className="px-2 py-2 border rounded text-white bg-red-500 hover:bg-red-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-2 py-2 border rounded text-white bg-blue-500 hover:bg-blue-600"
            >
              {proveedor ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalProveedor;
