import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import axios from "axios";

const HistorialStock = () => {
  const [historial, setHistorial] = useState([]);
  const { token } = useAuth();
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(7); // Puedes cambiar el número de items por página

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const res = await axios.get(
          "http://localhost:4000/api/historial-stock",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setHistorial(res.data);
      } catch (err) {
        console.error("Error al cargar historial:", err);
      }
    };

    fetchHistorial();
  }, [token]);

  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const itemsActuales = historial.slice(indicePrimerItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(historial.length / itemsPorPagina);
  const siguientePagina = () => {
    if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Historial de Stock</h1>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto border rounded-lg">
        <table className="min-w-full bg-white shadow-md rounded">
          <thead className="bg-gray-200 text-gray-700 sticky top-0 z-10">
            <tr>
              <th className="py-2 px-4 text-left">N°</th>
              <th className="py-2 px-4 text-left">Usuario</th>
              <th className="py-2 px-4 text-left">Producto</th>
              <th className="py-2 px-4 text-left">Stock Anterior</th>
              <th className="py-2 px-4 text-left">Stock Nuevo</th>
              <th className="py-2 px-4 text-left">Motivo</th>
              <th className="py-2 px-4 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {itemsActuales.map((item, index) => (
              <tr key={item.id} className="border-b hover:bg-gray-100">
                <td className="py-2 px-4">{indicePrimerItem + index + 1}</td>
                <td className="py-2 px-4">{item.nombre_usuario}</td>
                <td className="py-2 px-4">{item.nombre_producto}</td>
                <td className="py-2 px-4 text-red-600">
                  {item.stock_anterior}
                </td>
                <td className="py-2 px-4 text-green-600">{item.stock_nuevo}</td>
                {(() => {
                  if (item.motivo == "Venta") {
                    return (
                      <td className="py-2 px-4 text-red-600">{item.motivo}</td>
                    );
                  }
                  if (item.motivo == "Reposición") {
                    return (
                      <td className="py-2 px-4 text-green-600">
                        {item.motivo}
                      </td>
                    );
                  } else {
                    return (
                      <td className="py-2 px-4 text-yellow-600">
                        {item.motivo}
                      </td>
                    );
                  }
                })()}
                <td className="py-2 px-4">
                  {new Date(item.fecha).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {historial.length === 0 && (
          <p className="text-gray-500 mt-4">
            No hay registros de historial de stock.
          </p>
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="flex justify-center mt-4 gap-4">
          <button
            onClick={paginaAnterior}
            disabled={paginaActual === 1}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Anterior
          </button>
          <span className="text-sm font-medium">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            onClick={siguientePagina}
            disabled={paginaActual === totalPaginas}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default HistorialStock;
