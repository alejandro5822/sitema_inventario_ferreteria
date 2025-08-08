// src/pages/Movimientos.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import MovimientoFormModal from "../components/MovimientoFormModal";
import { toast } from "react-toastify";

const Movimientos = () => {
  const { token, usuario } = useAuth();
  const [movimientos, setMovimientos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);

  const obtenerMovimientos = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/movimientos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setMovimientos(data);
    } catch (error) {
      console.error("Error al obtener movimientos:", error);
    }
  };

  useEffect(() => {
    obtenerMovimientos();
  }, []);

  const abrirModalNuevo = () => {
    setMovimientoSeleccionado(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (movimiento) => {
    setMovimientoSeleccionado(movimiento);
    setMostrarModal(true);
  };

  const manejarEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este movimiento?"
    );
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:4000/api/movimientos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error desconocido");
        return;
      }
      toast.success("Movimiento eliminado correctamente");
      obtenerMovimientos(); // Refrescar lista
    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Movimientos de Inventario</h2>
        <button
          onClick={abrirModalNuevo}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nuevo Movimiento
        </button>
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200 text-center">
            <th className="p-3">N°</th>
            <th className="p-3">Usuario</th>
            <th className="p-3">Producto</th>
            <th className="p-3">Proveedor</th>
            <th className="p-3">Tipo</th>
            <th className="p-3">Cantidad</th>
            <th className="p-3">Motivo</th>
            <th className="p-3">Fecha</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((mov, index) => (
            <tr key={mov.id} className="border-t hover:bg-gray-100 text-center">
              <td className="p-3">{index + 1}</td>
              <td className="p-3">{mov.nombre_usuario}</td>
              <td className="p-3">{mov.nombre_producto}</td>
              <td className="p-3">{mov.nombre_proveedor}</td>
              <td className="p-3">{mov.tipo_movimiento}</td>
              {mov.tipo_movimiento === 'entrada' ? (
                <td className="p-3 text-green-700">+{mov.cantidad}</td>
              ) : (
                <td className="p-3 text-red-700">{mov.cantidad * -1}</td>
              )}
              <td className="p-3">{mov.descripcion}</td>
              <td className="p-3">{new Date(mov.fecha).toLocaleString()}</td>
              <td className="flex p-2 space-x-2">
                {usuario.rol_nombre === "Administrador" && (
                  <>
                    <button
                      onClick={() => manejarEliminar(mov.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarModal && (
        <MovimientoFormModal
          movimiento={movimientoSeleccionado}
          cerrar={() => {
            setMostrarModal(false);
            obtenerMovimientos();
          }}
        />
      )}
    </div>
  );
};

export default Movimientos;
