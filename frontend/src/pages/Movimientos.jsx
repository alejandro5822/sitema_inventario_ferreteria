// src/pages/Movimientos.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import MovimientoFormModal from "../components/MovimientoFormModal";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../services/api";

const Movimientos = () => {
  const { token, usuario } = useAuth();
  const [movimientos, setMovimientos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
  const itemsPorPagina = 6;
  const [paginaActual, setPaginaActual] = useState(1);

  // Filtros
  const [tipoBusqueda, setTipoBusqueda] = useState("usuario");
  const [valorBusqueda, setValorBusqueda] = useState("");
  const [valorBusquedaTemp, setValorBusquedaTemp] = useState("");

  // Filtrado
  const movimientosFiltrados = movimientos.filter((mov) => {
    if (!valorBusqueda) return true;
    switch (tipoBusqueda) {
      case "usuario":
        return mov.nombre_usuario?.toLowerCase().includes(valorBusqueda.toLowerCase());
      case "producto":
        return mov.nombre_producto?.toLowerCase().includes(valorBusqueda.toLowerCase());
      case "tipo":
        return mov.tipo_movimiento === valorBusqueda;
      case "motivo":
        return mov.descripcion?.toLowerCase().includes(valorBusqueda.toLowerCase());
      case "fecha":
        // Busca por fecha exacta (formato yyyy-mm-dd)
        const fechaMov = new Date(mov.fecha).toISOString().slice(0, 10);
        return fechaMov === valorBusqueda;
      default:
        return true;
    }
  });

  // Paginación sobre filtrados
  const totalPaginas = Math.ceil(movimientosFiltrados.length / itemsPorPagina);
  const indicePrimerItem = (paginaActual - 1) * itemsPorPagina;
  const indiceUltimoItem = indicePrimerItem + itemsPorPagina;
  const movimientosActuales = movimientosFiltrados.slice(indicePrimerItem, indiceUltimoItem);

  const obtenerMovimientos = async () => {
    try {
      const res = await fetch(`${API}/movimientos`, {
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
      const res = await fetch(`${API}/movimientos/${id}`, {
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

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  // Exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Movimientos de Inventario", 15, 15);

    const columns = [
      "N°", "Usuario", "Producto", "Proveedor", "Tipo", "Cantidad", "Motivo", "Fecha"
    ];
    const rows = movimientosActuales.map((mov, idx) => [
      indicePrimerItem + idx + 1,
      mov.nombre_usuario,
      mov.nombre_producto,
      mov.nombre_proveedor,
      mov.tipo_movimiento,
      mov.tipo_movimiento === 'entrada' ? `+${mov.cantidad}` : `${mov.cantidad * -1}`,
      mov.descripcion,
      new Date(mov.fecha).toLocaleString()
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 25,
      styles: { fontSize: 9 }
    });

    doc.save("movimientos.pdf");
  };

  return (
    <div className="p-4 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-2xl font-bold text-center sm:text-left dark:text-gray-100">Movimientos de Inventario</h2>
        <button
          onClick={abrirModalNuevo}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
        >
          + Nuevo Movimiento
        </button>
      </div>

      {/* Filtros y exportar PDF */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            value={tipoBusqueda}
            onChange={e => {
              setTipoBusqueda(e.target.value);
              setValorBusqueda("");
              setValorBusquedaTemp("");
              setPaginaActual(1);
            }}
            className="border px-2 py-1 rounded w-full sm:w-auto dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="usuario">Usuario</option>
            <option value="producto">Producto</option>
            <option value="tipo">Tipo</option>
            <option value="motivo">Motivo</option>
            <option value="fecha">Fecha</option>
          </select>
          {tipoBusqueda === "tipo" ? (
            <select
              value={valorBusqueda}
              onChange={e => {
                setValorBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="border px-2 py-1 rounded w-full sm:w-auto dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Todos</option>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
            </select>
          ) : tipoBusqueda === "motivo" ? (
            <select
              value={valorBusqueda}
              onChange={e => {
                setValorBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="border px-2 py-1 rounded w-full sm:w-auto dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Todos</option>
              <option value="reposicion">Reposición</option>
              <option value="venta">Venta</option>
              <option value="devolucion">Devolución</option>
            </select>
          ) : tipoBusqueda === "fecha" ? (
            <input
              type="date"
              value={valorBusqueda}
              onChange={e => {
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
                onChange={e => setValorBusquedaTemp(e.target.value)}
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
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full bg-white dark:bg-gray-800 dark:text-gray-100 shadow rounded text-sm">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-center">
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
            {movimientosActuales.map((mov, index) => (
              <tr key={mov.id} className="border-t hover:bg-gray-100 dark:hover:bg-gray-700 text-center">
                <td className="p-3">{indicePrimerItem + index + 1}</td>
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
                <td className="flex p-2 space-x-2 justify-center">
                  {usuario.rol_nombre === "Administrador" && (
                    <button
                      onClick={() => manejarEliminar(mov.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards para móviles */}
      <div className="sm:hidden flex flex-col gap-4">
        {movimientosActuales.map((mov, index) => (
          <div key={mov.id} className="bg-white dark:bg-gray-800 dark:text-gray-100 shadow rounded border p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-blue-700 dark:text-blue-300">
                {indicePrimerItem + index + 1}. {mov.nombre_producto}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(mov.fecha).toLocaleString()}
              </span>
            </div>
            <div className="text-sm mb-1"><span className="font-semibold">Usuario:</span> {mov.nombre_usuario}</div>
            <div className="text-sm mb-1"><span className="font-semibold">Proveedor:</span> {mov.nombre_proveedor}</div>
            <div className="text-sm mb-1"><span className="font-semibold">Tipo:</span> {mov.tipo_movimiento}</div>
            <div className="text-sm mb-1">
              <span className="font-semibold">Cantidad:</span>{" "}
              {mov.tipo_movimiento === 'entrada' ? (
                <span className="text-green-700">+{mov.cantidad}</span>
              ) : (
                <span className="text-red-700">{mov.cantidad * -1}</span>
              )}
            </div>
            <div className="text-sm mb-1"><span className="font-semibold">Motivo:</span> {mov.descripcion}</div>
            <div className="flex gap-2 mt-2">
              {usuario.rol_nombre === "Administrador" && (
                <button
                  onClick={() => manejarEliminar(mov.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-2 rounded w-full"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex flex-wrap justify-center items-center mt-4 gap-2">
          <button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded dark:text-gray-100"
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
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded dark:text-gray-100"
          >
            Siguiente
          </button>
        </div>
      )}

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
