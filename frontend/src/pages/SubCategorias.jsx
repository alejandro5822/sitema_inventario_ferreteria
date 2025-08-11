import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import ModalSubcategoria from "../components/ModalSubcategoria";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SubCategorias = () => {
  const { token } = useAuth();
  const [subcategorias, setSubcategorias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState(null);

  // Busqueda por nombre
  const [busqueda, setBusqueda] = useState("");
  const [busquedaTemp, setBusquedaTemp] = useState("");

  // Paginación
  const itemsPorPagina = 5;
  const [paginaActual, setPaginaActual] = useState(1);

  // Filtrado por nombre
  const subcategoriasFiltradas = subcategorias.filter(sub =>
    sub.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Paginación sobre filtrados
  const totalPaginas = Math.ceil(subcategoriasFiltradas.length / itemsPorPagina);
  const indicePrimerItem = (paginaActual - 1) * itemsPorPagina;
  const indiceUltimoItem = indicePrimerItem + itemsPorPagina;
  const subcategoriasActuales = subcategoriasFiltradas.slice(indicePrimerItem, indiceUltimoItem);

  const obtenerSubcategorias = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/subcategorias", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubcategorias(data);
    } catch (error) {
      console.error("Error al obtener subcategorías:", error);
    }
  };

  useEffect(() => {
    obtenerSubcategorias();
  }, []);

  const abrirModalCrear = () => {
    setSubcategoriaSeleccionada(null); // modo creación
    setModalAbierto(true);
  };

  const abrirModalEditar = (sub) => {
    setSubcategoriaSeleccionada(sub); // modo edición
    setModalAbierto(true);
  };

  const manejarEliminar = async (id) => {
    const confirmar = confirm("¿Deseas eliminar esta subcategoría?");
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:4000/api/subcategorias/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo eliminar.");
        return;
      }

      obtenerSubcategorias();
    } catch (error) {
      console.error("Error al eliminar:", error);
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
    doc.text("Lista de Subcategorías", 15, 15);

    const columns = ["#", "Sub Categoría", "Categoría"];
    const rows = subcategoriasActuales.map((sub, idx) => [
      indicePrimerItem + idx + 1,
      sub.nombre,
      sub.categoria_nombre
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 25,
      styles: { fontSize: 10 }
    });

    doc.save("subcategorias.pdf");
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          Lista de Subcategorías
        </h2>
        <button
          onClick={abrirModalCrear}
          className="px-4 py-2 bg-blue-600 text-white rounded w-full sm:w-auto"
        >
          Nueva Subcategoría
        </button>
      </div>

      {/* Filtro y botón PDF */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={busquedaTemp}
            onChange={e => setBusquedaTemp(e.target.value)}
            placeholder="Buscar por subcategoría..."
            className="border px-2 py-1 rounded w-full sm:w-48"
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
        <table className="min-w-full bg-white shadow rounded text-sm">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3">N°</th>
              <th className="p-3">Sub Categoría</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {subcategoriasActuales.map((sub, index) => (
              <tr key={sub.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{indicePrimerItem + index + 1}</td>
                <td className="p-3">{sub.nombre}</td>
                <td className="p-3">{sub.categoria_nombre}</td>
                <td className="p-3 space-x-2">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mb-1 sm:mb-0"
                    onClick={() => abrirModalEditar(sub)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    onClick={() => manejarEliminar(sub.id)}
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
        {subcategoriasActuales.map((sub, index) => (
          <div key={sub.id} className="bg-white shadow rounded border p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-blue-700">
                {indicePrimerItem + index + 1}. {sub.nombre}
              </span>
            </div>
            <div className="text-sm mb-1">
              <span className="font-semibold">Categoría:</span>{" "}
              {sub.categoria_nombre}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                className="bg-yellow-500 text-white px-2 py-2 rounded hover:bg-yellow-600 w-full"
                onClick={() => abrirModalEditar(sub)}
              >
                Editar
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-2 rounded w-full"
                onClick={() => manejarEliminar(sub.id)}
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

      {modalAbierto && (
        <ModalSubcategoria
          cerrarModal={() => setModalAbierto(false)}
          onGuardar={obtenerSubcategorias}
          subcategoriaSeleccionada={subcategoriaSeleccionada}
        />
      )}
    </div>
  );
}

export default SubCategorias;