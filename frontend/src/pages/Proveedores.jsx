import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import ModalProveedor from "../components/ModalProveedor";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Proveedores = () => {
  const { token } = useAuth();
  const [proveedores, setProveedores] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorActual, setProveedorActual] = useState(null);

  // Busqueda
  const [tipoBusqueda, setTipoBusqueda] = useState("nombre");
  const [busqueda, setBusqueda] = useState("");
  const [busquedaTemp, setBusquedaTemp] = useState("");

  // Paginación
  const itemsPorPagina = 5;
  const [paginaActual, setPaginaActual] = useState(1);

  // Filtrado por nombre o correo
  const proveedoresFiltrados = proveedores.filter((prov) => {
    if (!busqueda) return true;
    if (tipoBusqueda === "nombre") {
      return prov.nombre.toLowerCase().includes(busqueda.toLowerCase());
    }
    if (tipoBusqueda === "correo") {
      return prov.correo.toLowerCase().includes(busqueda.toLowerCase());
    }
    return true;
  });

  const totalPaginas = Math.ceil(proveedoresFiltrados.length / itemsPorPagina);
  const indicePrimerItem = (paginaActual - 1) * itemsPorPagina;
  const indiceUltimoItem = indicePrimerItem + itemsPorPagina;
  const proveedoresActuales = proveedoresFiltrados.slice(
    indicePrimerItem,
    indiceUltimoItem
  );

  const obtenerProveedores = async () => {
    try {
      const { data } = await axios.get("http://localhost:4000/api/proveedores");
      setProveedores(data);
    } catch (error) {
      console.error("Error al obtener proveedores", error);
    }
  };

  const abrirModal = (proveedor = null) => {
    setProveedorActual(proveedor);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setProveedorActual(null);
    setModalAbierto(false);
    obtenerProveedores();
  };

  useEffect(() => {
    obtenerProveedores();
  }, []);

  async function eliminarProveedor(id) {
    const confirmar = confirm("¿Deseas eliminar este proveedor?");
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:4000/api/proveedores/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = {};
      try {
        data = await res.json();
      } catch (e) {}

      if (!res.ok) {
        alert(data.error || "No se pudo eliminar.");
        return;
      }
      obtenerProveedores();
    } catch (error) {
      alert("Ocurrió un error al eliminar el proveedor.");
      console.error("Error al eliminar proveedor:", error);
    }
  }

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  // Exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Lista de Proveedores", 15, 15);

    const columns = ["#", "Nombre", "Correo", "Teléfono", "Dirección", "Fecha"];
    const rows = proveedoresActuales.map((prov, idx) => [
      indicePrimerItem + idx + 1,
      prov.nombre,
      prov.correo,
      prov.telefono,
      prov.direccion,
      prov.fecha_creacion,
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 25,
      styles: { fontSize: 10 },
    });

    doc.save("proveedores.pdf");
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left dark:text-gray-100">
          Lista de Proveedores
        </h2>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded w-full sm:w-auto"
          onClick={() => abrirModal()}
        >
          Agregar proveedor
        </button>
      </div>

      {/* Filtro y botón PDF */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            value={tipoBusqueda}
            onChange={(e) => {
              setTipoBusqueda(e.target.value);
              setBusqueda("");
              setBusquedaTemp("");
              setPaginaActual(1);
            }}
            className="border px-2 py-1 rounded w-full sm:w-auto dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="nombre">Nombre</option>
            <option value="correo">Correo</option>
          </select>
          <input
            type="text"
            value={busquedaTemp}
            onChange={(e) => setBusquedaTemp(e.target.value)}
            placeholder={`Buscar por ${tipoBusqueda}`}
            className="border px-2 py-1 rounded w-full sm:w-48 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            onClick={() => {
              setBusqueda(busquedaTemp);
              setPaginaActual(1);
            }}
            className="bg-blue-600 text-white px-4 py-1 rounded w-full sm:w-auto"
          >
            Buscar
          </button>
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
        <table className="min-w-full bg-white dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 text-left text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-2 sm:px-4 py-2 border dark:border-gray-700">N°</th>
              <th className="px-2 sm:px-4 py-2 border dark:border-gray-700">Nombre</th>
              <th className="px-2 sm:px-4 py-2 border dark:border-gray-700">Correo</th>
              <th className="px-2 sm:px-4 py-2 border dark:border-gray-700">Teléfono</th>
              <th className="px-2 sm:px-4 py-2 border dark:border-gray-700">Dirección</th>
              <th className="px-2 sm:px-4 py-2 border dark:border-gray-700">Fecha de Registro</th>
              <th className="px-2 sm:px-4 py-2 border dark:border-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresActuales.map((proveedor, index) => (
              <tr key={proveedor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="border px-2 sm:px-4 py-2 dark:border-gray-700">
                  {indicePrimerItem + index + 1}
                </td>
                <td className="border px-2 sm:px-4 py-2 break-words max-w-[120px] sm:max-w-none dark:border-gray-700">{proveedor.nombre}</td>
                <td className="border px-2 sm:px-4 py-2 break-words max-w-[140px] sm:max-w-none dark:border-gray-700">{proveedor.correo}</td>
                <td className="border px-2 sm:px-4 py-2 break-words max-w-[100px] sm:max-w-none dark:border-gray-700">{proveedor.telefono}</td>
                <td className="border px-2 sm:px-4 py-2 break-words max-w-[140px] sm:max-w-none dark:border-gray-700">{proveedor.direccion}</td>
                <td className="border px-2 sm:px-4 py-2 break-words max-w-[120px] sm:max-w-none dark:border-gray-700">{proveedor.fecha_creacion}</td>
                <td className="border px-2 sm:px-4 py-3 flex flex-col sm:flex-row justify-center items-center gap-2 dark:border-gray-700">
                  <button
                    className="px-2 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded w-full sm:w-auto"
                    onClick={() => abrirModal(proveedor)}
                  >
                    Editar
                  </button>
                  <button
                    className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded w-full sm:w-auto"
                    onClick={() => eliminarProveedor(proveedor.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards para móviles */}
      <div className="sm:hidden flex flex-col gap-4">
        {proveedoresActuales.map((proveedor, index) => (
          <div key={proveedor.id} className="bg-white dark:bg-gray-800 dark:text-gray-100 shadow rounded border p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-blue-700 dark:text-blue-300">
                {indicePrimerItem + index + 1}. {proveedor.nombre}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{proveedor.fecha_creacion}</span>
            </div>
            <div className="text-sm mb-1"><span className="font-semibold">Correo:</span> {proveedor.correo}</div>
            <div className="text-sm mb-1"><span className="font-semibold">Teléfono:</span> {proveedor.telefono}</div>
            <div className="text-sm mb-1"><span className="font-semibold">Dirección:</span> {proveedor.direccion}</div>
            <div className="flex gap-2 mt-2">
              <button
                className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded w-full"
                onClick={() => abrirModal(proveedor)}
              >
                Editar
              </button>
              <button
                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded w-full"
                onClick={() => eliminarProveedor(proveedor.id)}
              >
                Eliminar
              </button>
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

      {modalAbierto && (
        <ModalProveedor proveedor={proveedorActual} cerrarModal={cerrarModal} />
      )}
    </div>
  );
};

export default Proveedores;
