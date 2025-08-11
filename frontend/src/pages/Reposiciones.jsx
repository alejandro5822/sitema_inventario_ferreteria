import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCheck, FaTimes } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Reposiciones = () => {
  const { token } = useAuth();
  const [reposiciones, setReposiciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [tipoBusqueda, setTipoBusqueda] = useState("producto");
  const [valorBusqueda, setValorBusqueda] = useState("");
  const [valorBusquedaTemp, setValorBusquedaTemp] = useState("");

  const itemsPorPagina = 4;
  const [paginaActual, setPaginaActual] = useState(1);

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

  // Filtrado por producto, proveedor, solicitante, estado, fecha solicitud
  const reposicionesFiltradas = reposiciones.filter((r) => {
    if (!valorBusqueda) return true;
    switch (tipoBusqueda) {
      case "producto":
        return r.producto?.toLowerCase().includes(valorBusqueda.toLowerCase());
      case "proveedor":
        return r.proveedor?.toLowerCase().includes(valorBusqueda.toLowerCase());
      case "solicitante":
        return r.solicitante?.toLowerCase().includes(valorBusqueda.toLowerCase());
      case "estado":
        return r.estado === valorBusqueda;
      case "fecha_solicitud":
        // Busca por fecha exacta (formato yyyy-mm-dd)
        const fecha = new Date(r.fecha_solicitud).toISOString().slice(0, 10);
        return fecha === valorBusqueda;
      default:
        return true;
    }
  });

  // Paginación
  const totalPaginas = Math.ceil(reposicionesFiltradas.length / itemsPorPagina);
  const indicePrimerItem = (paginaActual - 1) * itemsPorPagina;
  const indiceUltimoItem = indicePrimerItem + itemsPorPagina;
  const reposicionesActuales = reposicionesFiltradas.slice(indicePrimerItem, indiceUltimoItem);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  // Exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Listado de Reposiciones", 15, 15);

    const columns = [
      "N°", "Producto", "Proveedor", "Cantidad", "Precio Unit.", "Total", "Solicitante", "Estado", "Fecha Solicitud", "Fecha Recepción"
    ];
    const rows = reposicionesActuales.map((r, idx) => [
      indicePrimerItem + idx + 1,
      r.producto,
      r.proveedor || "—",
      r.cantidad_solicitada,
      `Bs ${r.precio_unitario}`,
      `Bs ${r.precio_total}`,
      r.solicitante,
      r.estado.charAt(0).toUpperCase() + r.estado.slice(1),
      new Date(r.fecha_solicitud).toLocaleString(),
      r.fecha_recepcion ? new Date(r.fecha_recepcion).toLocaleString() : "—"
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 25,
      styles: { fontSize: 9 }
    });

    doc.save("reposiciones.pdf");
  };

  if (loading) return <p>Cargando reposiciones...</p>;

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h1 className="text-xl font-bold text-center sm:text-left">Listado de Reposiciones</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            value={tipoBusqueda}
            onChange={e => {
              setTipoBusqueda(e.target.value);
              setValorBusqueda("");
              setValorBusquedaTemp("");
              setPaginaActual(1);
            }}
            className="border px-3 py-2 rounded w-full sm:w-auto"
          >
            <option value="producto">Producto</option>
            <option value="proveedor">Proveedor</option>
            <option value="solicitante">Solicitante</option>
            <option value="estado">Estado</option>
            <option value="fecha_solicitud">Fecha Solicitud</option>
          </select>
          {tipoBusqueda === "estado" ? (
            <select
              value={valorBusqueda}
              onChange={e => {
                setValorBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="border px-2 py-1 rounded w-full sm:w-auto"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="recibido">Recibido</option>
              <option value="cancelado">Cancelado</option>
            </select>
          ) : tipoBusqueda === "fecha_solicitud" ? (
            <input
              type="date"
              value={valorBusqueda}
              onChange={e => {
                setValorBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="border px-2 py-1 rounded w-full sm:w-auto"
            />
          ) : (
            <>
              <input
                type="text"
                value={valorBusquedaTemp}
                onChange={e => setValorBusquedaTemp(e.target.value)}
                placeholder={`Buscar por ${tipoBusqueda}`}
                className="border px-2 py-1 rounded w-full sm:w-48"
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
          <button
            onClick={exportarPDF}
            className="bg-red-600 text-white px-4 py-1 rounded w-full sm:w-auto"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Tabla para pantallas medianas y grandes */}
      <div className="hidden sm:block overflow-x-auto">
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
            {reposicionesActuales.map((r, index) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{indicePrimerItem + index + 1}</td>
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

      {/* Cards para móviles */}
      <div className="sm:hidden flex flex-col gap-4">
        {reposicionesActuales.map((r, index) => (
          <div key={r.id} className="bg-white shadow rounded border p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-blue-700">
                {indicePrimerItem + index + 1}. {r.producto}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(r.fecha_solicitud).toLocaleString()}
              </span>
            </div>
            <div className="text-sm mb-1"><span className="font-semibold">Proveedor:</span> {r.proveedor || "—"}</div>
            <div className="text-sm mb-1"><span className="font-semibold">Cantidad Solicitada:</span> {r.cantidad_solicitada}</div>
            <div className="text-sm mb-1"><span className="font-semibold">Precio Unit.:</span> Bs {r.precio_unitario}</div>
            <div className="text-sm mb-1"><span className="font-semibold">Total:</span> Bs {r.precio_total}</div>
            <div className="text-sm mb-1"><span className="font-semibold">Solicitante:</span> {r.solicitante}</div>
            <div className="text-sm mb-1">
              <span className="font-semibold">Estado:</span>{" "}
              {r.estado === "pendiente" && (
                <span className="text-yellow-600">Pendiente</span>
              )}
              {r.estado === "recibido" && (
                <span className="text-green-600">Recibido</span>
              )}
              {r.estado === "cancelado" && (
                <span className="text-red-600">Cancelado</span>
              )}
            </div>
            <div className="text-sm mb-1">
              <span className="font-semibold">Fecha Recepción:</span>{" "}
              {r.fecha_recepcion
                ? new Date(r.fecha_recepcion).toLocaleString()
                : "—"}
            </div>
            <div className="flex gap-2 mt-2">
              {r.estado === "pendiente" && (
                <>
                  <button
                    onClick={() => actualizarEstado(r.id, "recibido")}
                    className="bg-green-600 text-white px-2 py-2 rounded hover:bg-green-700 w-full"
                  >
                    <FaCheck /> Confirmar
                  </button>
                  <button
                    onClick={() => actualizarEstado(r.id, "cancelado")}
                    className="bg-red-600 text-white px-2 py-2 rounded hover:bg-red-700 w-full"
                  >
                    <FaTimes /> Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Anterior
          </button>
          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              onClick={() => cambiarPagina(i + 1)}
              className={`px-3 py-1 rounded ${
                paginaActual === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default Reposiciones;
