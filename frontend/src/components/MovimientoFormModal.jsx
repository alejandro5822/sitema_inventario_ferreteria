// src/components/MovimientoFormModal.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { toast } from "react-toastify";
import API from "../services/api.js"

const MovimientoFormModal = ({ movimiento, cerrar }) => {
  const { usuario, token } = useAuth();
  const [productos, setProductos] = useState([]);
  const [proveedorId, setProveedorId] = useState("");
  const [proveedorNombre, setProveedorNombre] = useState("");
  const [formulario, setFormulario] = useState({
    usuario_id: usuario.id,
    producto_id: "",
    tipo_movimiento: "entrada",
    descripcion: "Reposicion",
    cantidad: 1,
  });

  useEffect(() => {
    obtenerProductos();
  }, []);

  useEffect(() => {
    if (movimiento && productos.length > 0) {
      setFormulario({
        usuario_id: movimiento.usuario_id,
        producto_id: movimiento.producto_id || "",
        tipo_movimiento: movimiento.tipo_movimiento || "entrada",
        descripcion: movimiento.descripcion || "Reposicion",
        cantidad: movimiento.cantidad || 1,
      });
      setProveedorId(movimiento.proveedor_id || "");
      setProveedorNombre(movimiento.nombre_proveedor || "");
    }
  }, [movimiento, productos]);

  const obtenerProductos = async () => {
    try {
      const res = await fetch(`${API}/productos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  // Cuando selecciona un producto
  const handleProductoChange = (e) => {
    const productoSeleccionado = productos.find(
      (p) => p.id === Number(e.target.value)
    );
    setFormulario({ ...formulario, producto_id: productoSeleccionado.id });

    // Solo actualizar proveedor si NO estás editando
    if (!movimiento) {
      setProveedorId(productoSeleccionado.proveedor_id);
      setProveedorNombre(productoSeleccionado.proveedor_nombre || "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = movimiento ? "PUT" : "POST";
      const url = movimiento
        ? `${API}/movimientos/${movimiento.id}`
        : `${API}/movimientos`;

      const body = {
        ...formulario,
        proveedor_id: proveedorId,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al guardar movimiento");
        return;
      }

      toast.success(
        movimiento ? "Movimiento actualizado" : "Movimiento registrado"
      );
      cerrar();
    } catch (error) {
      console.error("Error al guardar movimiento:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 dark:text-gray-100 p-6 rounded shadow-md w-full max-w-lg transition-colors">
        <h3 className="text-lg font-bold mb-4">
          {movimiento ? "Editar Movimiento" : "Nuevo Movimiento"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            name="producto_id"
            value={formulario.producto_id}
            onChange={handleProductoChange}
            required={!movimiento}
            disabled={!!movimiento}
            className="w-full border p-2 rounded dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">Seleccione producto</option>
            {productos.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.nombre}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="proveedor_nombre"
            value={proveedorNombre}
            readOnly
            className="w-full border p-2 rounded mt-2 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Proveedor"
          />

          <select
            name="tipo_movimiento"
            value={formulario.tipo_movimiento}
            onChange={handleChange}
            className="w-full border p-2 rounded dark:bg-gray-700 dark:text-gray-100"
            required
          >
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>

          <select
            name="descripcion"
            value={formulario.descripcion}
            onChange={handleChange}
            className="w-full border p-2 rounded dark:bg-gray-700 dark:text-gray-100"
            required
          >
            <option value="Venta">Venta</option>
            <option value="Reposicion">Reposicion</option>
            <option value="Devolucion">Devolucion</option>
          </select>

          <input
            type="number"
            name="cantidad"
            value={formulario.cantidad}
            onChange={handleChange}
            min="1"
            required
            className="w-full border p-2 rounded dark:bg-gray-700 dark:text-gray-100"
            placeholder="Cantidad"
            disabled={!!movimiento}
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={cerrar}
              className="bg-gray-400 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {movimiento ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovimientoFormModal;
