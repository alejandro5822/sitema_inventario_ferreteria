import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../services/api";

const HistorialStock = () => {
  const [historial, setHistorial] = useState([]);
  const { token } = useAuth();
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(7);

  // Filtros
  const [tipoBusqueda, setTipoBusqueda] = useState("usuario");
  const [valorBusqueda, setValorBusqueda] = useState("");
  const [valorBusquedaTemp, setValorBusquedaTemp] = useState("");

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const res = await axios.get(
          `${API}/historial-stock`,
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

  // Filtrado
  const historialFiltrado = historial.filter((item) => {
    if (!valorBusqueda) return true;
    switch (tipoBusqueda) {
      case "usuario":
        return item.nombre_usuario
          ?.toLowerCase()
          .includes(valorBusqueda.toLowerCase());
      case "producto":
        return item.nombre_producto
          ?.toLowerCase()
          .includes(valorBusqueda.toLowerCase());
      case "motivo":
        return item.motivo?.toLowerCase() === valorBusqueda.toLowerCase();
      case "fecha":
        const fechaItem = new Date(item.fecha).toISOString().slice(0, 10);
        return fechaItem === valorBusqueda;
      default:
        return true;
    }
  });

  // Paginación sobre filtrados
  const totalPaginas = Math.ceil(historialFiltrado.length / itemsPorPagina);
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const itemsActuales = historialFiltrado.slice(
    indicePrimerItem,
    indiceUltimoItem
  );

  const siguientePagina = () => {
    if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };

  // Exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Historial de Stock", 15, 15);

    const columns = [
      "N°",
      "Usuario",
      "Producto",
      "Stock Anterior",
      "Stock Nuevo",
      "Motivo",
      "Fecha",
    ];
    const rows = itemsActuales.map((item, idx) => [
      indicePrimerItem + idx + 1,
      item.nombre_usuario,
      item.nombre_producto,
      item.stock_anterior,
      item.stock_nuevo,
      item.motivo,
      new Date(item.fecha).toLocaleString(),
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 25,
      styles: { fontSize: 9 },
    });

    doc.save("historial_stock.pdf");
  };

  return (
    <div className="p-4 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <h1 className="text-2xl font-bold mb-4 dark:text-gray-100">
        Historial de Stock
      </h1>

      {/* Filtros y exportar PDF */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            value={tipoBusqueda}
            onChange={(e) => {
              setTipoBusqueda(e.target.value);
              setValorBusqueda("");
              setValorBusquedaTemp("");
              setPaginaActual(1);
            }}
            className="border px-2 py-1 rounded w-full sm:w-auto dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="usuario">Usuario</option>
            <option value="producto">Producto</option>
            <option value="motivo">Motivo</option>
            <option value="fecha">Fecha</option>
          </select>
          {tipoBusqueda === "motivo" ? (
            <select
              value={valorBusqueda}
              onChange={(e) => {
                setValorBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="border px-2 py-1 rounded w-full sm:w-auto dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Todos</option>
              <option value="Venta">Venta</option>
              <option value="Reposicion">Reposicion</option>
              <option value="Devolucion">Devolucion</option>
            </select>
          ) : tipoBusqueda === "fecha" ? (
            <input
              type="date"
              value={valorBusqueda}
              onChange={(e) => {
                setValorBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="border px-2 py-1 rounded w-full sm:w-auto dark:bg-gray-800 dark:text-gray-100"
            />
          ) : (
            <>
              <input
                type="text"
                value={valorBusquedaTemp}
                onChange={(e) => setValorBusquedaTemp(e.target.value)}
                placeholder={`Buscar por ${tipoBusqueda}`}
                className="border px-2 py-1 rounded w-full sm:w-48 dark:bg-gray-800 dark:text-gray-100"
              />
              <button
                onClick={() => {
                  setValorBusqueda(valorBusquedaTemp);
                  setPaginaActual(1);
                }}
                className="bg-blue-600 text-white px-4 py-1 rounded w-full sm:w-auto"
              >
                Buscar
              </button>
            </>
          )}
        </div>
        <button
          onClick={exportarPDF}
          className="bg-red-600 text-white px-4 py-1 rounded w-full sm:w-auto"
        >
          Exportar PDF
        </button>
      </div>

      {/* Tabla para pantallas medianas y grandes */}
      <div className="hidden sm:block overflow-x-auto max-h-[500px] overflow-y-auto border rounded-lg">
        <table className="min-w-full bg-white dark:bg-gray-800 dark:text-gray-100 shadow-md rounded text-sm">
          <thead className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 sticky top-0 z-10">
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
              <tr
                key={item.id}
                className="border-b hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <td className="py-2 px-4">{indicePrimerItem + index + 1}</td>
                <td className="py-2 px-4">{item.nombre_usuario}</td>
                <td className="py-2 px-4">{item.nombre_producto}</td>
                <td className="py-2 px-4 text-red-600">{item.stock_anterior}</td>
                <td className="py-2 px-4 text-green-600">{item.stock_nuevo}</td>
                {(() => {
                  if (item.motivo === "Venta") {
                    return (
                      <td className="py-2 px-4 text-red-600">{item.motivo}</td>
                    );
                  }
                  if (item.motivo === "Reposicion") {
                    return (
                      <td className="py-2 px-4 text-green-600">{item.motivo}</td>
                    );
                  } else {
                    return (
                      <td className="py-2 px-4 text-yellow-600">{item.motivo}</td>
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
        {historialFiltrado.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            No hay registros de historial de stock.
          </p>
        )}
      </div>

      {/* Cards para móviles */}
      <div className="sm:hidden flex flex-col gap-4">
        {itemsActuales.map((item, index) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 dark:text-gray-100 shadow rounded border p-3"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-blue-700 dark:text-blue-300">
                {indicePrimerItem + index + 1}. {item.nombre_producto}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(item.fecha).toLocaleString()}
              </span>
            </div>
            <div className="text-sm mb-1">
              <span className="font-semibold">Usuario:</span> {item.nombre_usuario}
            </div>
            <div className="text-sm mb-1">
              <span className="font-semibold">Stock Anterior:</span>{" "}
              <span className="text-red-600">{item.stock_anterior}</span>
            </div>
            <div className="text-sm mb-1">
              <span className="font-semibold">Stock Nuevo:</span>{" "}
              <span className="text-green-600">{item.stock_nuevo}</span>
            </div>
            <div className="text-sm mb-1">
              <span className="font-semibold">Motivo:</span>{" "}
              {item.motivo === "Venta" ? (
                <span className="text-red-600">{item.motivo}</span>
              ) : item.motivo === "Reposicion" ? (
                <span className="text-green-600">{item.motivo}</span>
              ) : (
                <span className="text-yellow-600">{item.motivo}</span>
              )}
            </div>
          </div>
        ))}
        {historialFiltrado.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            No hay registros de historial de stock.
          </p>
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            onClick={paginaAnterior}
            disabled={paginaActual === 1}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded dark:text-gray-100"
          >
            Anterior
          </button>
          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPaginaActual(i + 1)}
              className={`px-3 py-1 rounded ${
                paginaActual === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={siguientePagina}
            disabled={paginaActual === totalPaginas}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded dark:text-gray-100"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default HistorialStock;
