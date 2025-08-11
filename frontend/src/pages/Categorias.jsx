// src/pages/Categorias.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import CategoriaFormModal from "../components/CategoriaFormModal";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Categorias = () => {
  const { token, usuario} = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaTemp, setBusquedaTemp] = useState("");

  // Paginación
  const itemsPorPagina = 5;
  const [paginaActual, setPaginaActual] = useState(1);
  const totalPaginas = Math.ceil(categorias.length / itemsPorPagina);
  const indicePrimerItem = (paginaActual - 1) * itemsPorPagina;
  const indiceUltimoItem = indicePrimerItem + itemsPorPagina;
  const categoriasActuales = categorias.slice(
    indicePrimerItem,
    indiceUltimoItem
  );

  // Filtrado por nombre
  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Paginación sobre filtrados
  const totalPaginasFiltradas = Math.ceil(
    categoriasFiltradas.length / itemsPorPagina
  );
  const indicePrimerItemFiltrado = (paginaActual - 1) * itemsPorPagina;
  const indiceUltimoItemFiltrado = indicePrimerItemFiltrado + itemsPorPagina;
  const categoriasActualesFiltradas = categoriasFiltradas.slice(
    indicePrimerItemFiltrado,
    indiceUltimoItemFiltrado
  );

  const obtenerCategorias = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/categorias", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const abrirModalNueva = () => {
    setCategoriaSeleccionada(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setMostrarModal(true);
  };

  const manejarEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar esta categoría?"
    );
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:4000/api/categorias/${id}`, {
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
      toast.success("Categoría eliminada correctamente");
      obtenerCategorias(); // Refrescar lista
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
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
    // Logo (opcional)
    doc.addImage('/logo.png', 'PNG', 10, 8, 20, 20); // Si tienes logo en public o src/assets

    doc.setFontSize(14);
    doc.text("Lista de Categorías", 15, 15);

    const columns = ["#", "Nombre", "Descripción"];
    const rows = categoriasActualesFiltradas.map((cat, idx) => [
      indicePrimerItemFiltrado + idx + 1,
      cat.nombre,
      cat.descripcion || "Sin descripción",
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 25,
      styles: { fontSize: 10 },
    });

    doc.save("categorias.pdf");
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Título y botón nueva categoría */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left dark:text-gray-100">
          Lista de Categorías
        </h2>
        <button
          onClick={abrirModalNueva}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
        >
          + Nueva Categoría
        </button>
      </div>

      {/* Filtro y botón PDF */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={busquedaTemp}
            onChange={(e) => setBusquedaTemp(e.target.value)}
            placeholder="Buscar por categoria..."
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
        <table className="min-w-full bg-white dark:bg-gray-800 dark:text-gray-100 shadow rounded text-sm">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Descripcion</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categoriasActualesFiltradas.map((cat, index) => (
              <tr key={cat.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3">{indicePrimerItemFiltrado + index + 1}</td>
                <td className="p-3">{cat.nombre}</td>
                <td className="p-3">{cat.descripcion || "Sin descripción"}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => abrirModalEditar(cat)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mb-1 sm:mb-0"
                  >
                    Editar
                  </button>
                  {usuario.rol_nombre === "Administrador" && (
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    onClick={() => manejarEliminar(cat.id)}
                  >
                    Eliminar
                  </button>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards para móviles */}
      <div className="sm:hidden flex flex-col gap-4">
        {categoriasActualesFiltradas.map((cat, index) => (
          <div key={cat.id} className="bg-white dark:bg-gray-800 dark:text-gray-100 shadow rounded border p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-blue-700 dark:text-blue-300">
                {indicePrimerItemFiltrado + index + 1}. {cat.nombre}
              </span>
            </div>
            <div className="text-sm mb-1">
              <span className="font-semibold">Descripción:</span>{" "}
              {cat.descripcion || "Sin descripción"}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => abrirModalEditar(cat)}
                className="bg-yellow-500 text-white px-2 py-2 rounded hover:bg-yellow-600 w-full"
              >
                Editar
              </button>
              {usuario.rol_nombre === "Administrador" && (
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-2 rounded w-full"
                  onClick={() => manejarEliminar(cat.id)}
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {totalPaginasFiltradas > 1 && (
        <div className="flex flex-wrap justify-center items-center mt-4 gap-2">
          <button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded dark:text-gray-100"
          >
            Anterior
          </button>
          {[...Array(totalPaginasFiltradas)].map((_, i) => (
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
            disabled={paginaActual === totalPaginasFiltradas}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded dark:text-gray-100"
          >
            Siguiente
          </button>
        </div>
      )}

      {mostrarModal && (
        <CategoriaFormModal
          categoria={categoriaSeleccionada}
          cerrar={() => {
            setMostrarModal(false);
            obtenerCategorias(); // Refrescar después de guardar
          }}
        />
      )}
    </div>
  );
};

export default Categorias;
