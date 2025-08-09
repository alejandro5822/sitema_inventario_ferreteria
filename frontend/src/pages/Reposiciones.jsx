import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCheck, FaTimes } from "react-icons/fa";

const Reposiciones = () => {
  const { token } = useAuth();
  const [reposiciones, setReposiciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");

  const obtenerReposiciones = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/reposiciones", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReposiciones(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener reposiciones:", error);
      toast.error("No se pudieron cargar las reposiciones");
    }
  };

  const actualizarEstado = async (id, estado) => {
    try {
      await axios.patch(
        `http://localhost:4000/api/reposiciones/${id}/estado`,
        { estado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Reposición marcada como ${estado}`);
      obtenerReposiciones();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      toast.error("No se pudo actualizar la reposición");
    }
  };

  useEffect(() => {
    obtenerReposiciones();
  }, []);

  const reposicionesFiltradas =
    filtro === "todos"
      ? reposiciones
      : reposiciones.filter((r) => r.estado === filtro);

  if (loading) return <p>Cargando reposiciones...</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Listado de Reposiciones</h1>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="todos">Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="recibido">Recibidos</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm text-left">
          <thead className="bg-gray-100">
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-3 py-2">N°</th>
              <th className="px-3 py-2">Producto</th>
              <th className="px-3 py-2">Proveedor</th>
              <th className="px-3 py-2">Cantidad Solicitada</th>
              <th className="px-3 py-2">Precio Unit.</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Solicitante</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Fecha Solicitud</th>
              <th className="px-3 py-2">Fecha Recepción</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reposicionesFiltradas.map((r, index) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{index + 1}</td>
                <td className="px-3 py-2">{r.producto}</td>
                <td className="px-3 py-2">{r.proveedor || "—"}</td>
                <td className="px-3 py-2">{r.cantidad_solicitada}</td>
                <td className="px-3 py-2">Bs {r.precio_unitario}</td>
                <td className="px-3 py-2">Bs {r.precio_total}</td>
                <td className="px-3 py-2">{r.solicitante}</td>
                <td className="px-3 py-2 font-semibold">
                  {r.estado === "pendiente" && (
                    <span className="text-yellow-600">Pendiente</span>
                  )}
                  {r.estado === "recibido" && (
                    <span className="text-green-600">Recibido</span>
                  )}
                  {r.estado === "cancelado" && (
                    <span className="text-red-600">Cancelado</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {new Date(r.fecha_solicitud).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  {r.fecha_recepcion
                    ? new Date(r.fecha_recepcion).toLocaleString()
                    : "—"}
                </td>
                <td className="flex gap-2 px-3 py-2">
                  {r.estado === "pendiente" && (
                    <>
                      <button
                        onClick={() => actualizarEstado(r.id, "recibido")}
                        className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
                      >
                        <FaCheck />Confirmar
                      </button>
                      <button
                        onClick={() => actualizarEstado(r.id, "cancelado")}
                        className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                      >
                        <FaTimes />Cancelar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reposiciones;
