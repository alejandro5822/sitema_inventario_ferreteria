import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../services/api";

const ReposicionForm = ({ producto, onCerrar, onSuccess, token }) => {
  const [cantidadSolicitada, setCantidadSolicitada] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    setPrecioUnitario(producto.precio_compra ?? "");
  }, [producto]);

  const enviarReposicion = async () => {
    if (!cantidadSolicitada || precioUnitario === "") {
      toast.error("Completa todos los campos");
      return;
    }
    try {
      setCargando(true);
      const res = await fetch(`${API}/reposiciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          producto_id: producto.id,
          proveedor_id: producto.proveedor_id,
          cantidad_solicitada: parseInt(cantidadSolicitada),
          precio_unitario: parseFloat(precioUnitario),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar reposición");
      toast.success("Solicitud de reposición enviada");
      onSuccess();
      onCerrar();
    } catch (error) {
      console.error(error);
      toast.error("Error al enviar reposición");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white dark:bg-gray-800 dark:text-gray-100 p-6 rounded shadow-lg w-full max-w-md relative transition-colors">
        <button
          onClick={onCerrar}
          className="absolute top-2 right-3 text-gray-600 dark:text-gray-200 text-xl font-bold"
          disabled={cargando}
        >
          &times;
        </button>
        <h2 className="text-lg font-semibold mb-4">
          Solicitar reposición - {producto.nombre}
        </h2>
        <div className="mb-3">
          <label className="block text-sm font-medium">Cantidad solicitada</label>
          <input
            type="number"
            min="1"
            value={cantidadSolicitada}
            onChange={(e) => setCantidadSolicitada(e.target.value)}
            className="border rounded w-full p-2 dark:bg-gray-700 dark:text-gray-100"
            disabled={cargando}
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">Precio unitario 'Bs':</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={precioUnitario}
            onChange={(e) => setPrecioUnitario(e.target.value)}
            className="border rounded w-full p-2 dark:bg-gray-700 dark:text-gray-100"
            disabled={cargando}
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">Precio Total 'Bs': </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={cantidadSolicitada * precioUnitario}
            className="border rounded w-full p-2 dark:bg-gray-700 dark:text-gray-100"
            disabled
          />
        </div>
        <button
          onClick={enviarReposicion}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
          disabled={cargando}
        >
          {cargando ? "Enviando..." : "Enviar solicitud"}
        </button>
      </div>
    </div>
  );
};

export default ReposicionForm;
