import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import FormularioProducto from "../components/FormularioProducto";
import ReposicionForm from "../components/ReposicionForm";
import { toast } from "react-toastify";
import {
  FaDollyFlatbed,
  FaPen,
  FaToggleOn,
  FaToggleOff,
  FaTrash,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png"; // Ajusta la ruta si es necesario
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Productos = () => {
  const { token, usuario } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);

  //modal reposicion
  const [mostrarModalReposicion, setMostrarModalReposicion] = useState(false);
  const [productoReposicion, setProductoReposicion] = useState(null);

  const itemsPorPagina = 3;
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [tipoBusqueda, setTipoBusqueda] = useState("nombre");
  const [valorBusqueda, setValorBusqueda] = useState("");
  const [valorBusquedaTemp, setValorBusquedaTemp] = useState(""); // <-- Nueva línea

  // Obtener productos desde el backend con filtros y paginación
  const obtenerProductos = async (
    tipo = tipoBusqueda,
    valor = valorBusqueda,
    pagina = paginaActual,
    limite = itemsPorPagina
  ) => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:4000/api/productos/buscar",
        {
          params: {
            tipo,
            valor,
            pagina,
            limite,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProductos(res.data.productos || []);
      setTotalPaginas(res.data.totalPaginas || 1);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      setProductos([]);
      setTotalPaginas(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerProductos();
    // eslint-disable-next-line
  }, [tipoBusqueda, valorBusqueda, paginaActual]);

  const abrirModalNuevo = () => {
    setProductoEditar(null); // modo nuevo
    setMostrarModal(true);
  };

  const abrirModalEditar = (producto) => {
    setProductoEditar(producto);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
  };

  const handleExito = () => {
    obtenerProductos();
    cerrarModal();
  };

  const cambiarEstadoProducto = async (id, estadoActual) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(
        `http://localhost:4000/api/productos/${id}/estado`,
        {
          estado: !estadoActual,
        },
        config
      );

      toast.success(
        `Producto ${!estadoActual ? "activado" : "desactivado"} correctamente`
      );
      obtenerProductos(); // Actualizar lista
    } catch (error) {
      console.error("Error al cambiar el estado del producto:", error);
      toast.error("Ocurrió un error al cambiar el estado del producto");
    }
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro que deseas eliminar este producto permanentemente?"
    );
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:4000/api/productos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");

      toast.success("Producto eliminado permanentemente");
      obtenerProductos(); // Recarga la lista
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar el producto");
    }
  };

  //abrir modal reposicion
  const abrirModalReposicion = (producto) => {
    setProductoReposicion(producto);
    setMostrarModalReposicion(true);
  };

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();

    // Logo (ajusta posición/tamaño según tu logo)
    doc.addImage(logo, "PNG", 10, 8, 20, 20);

    doc.setFontSize(16);
    doc.text("Listado de Productos", 35, 18);

    const columns = [
      "N°",
      "Nombre",
      "Precio Venta",
      "Precio Compra",
      "Stock",
      "Descripción",
      "Categoría",
      "Proveedor",
      "Estado",
    ];
    const rows = productos.map((producto, index) => [
      (paginaActual - 1) * itemsPorPagina + index + 1,
      producto.nombre,
      `Bs ${producto.precio}`,
      `Bs ${producto.precio_compra}`,
      producto.stock,
      producto.descripcion,
      producto.categoria_nombre,
      producto.proveedor_nombre,
      producto.estado ? "Activo" : "Inactivo",
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }, // azul
      alternateRowStyles: { fillColor: [230, 240, 250] },
      margin: { left: 10, right: 10 },
    });

    doc.save("productos.pdf");
  };

  const exportarExcel = () => {
    const columns = [
      "N°",
      "Nombre",
      "Precio Venta",
      "Precio Compra",
      "Stock",
      "Descripción",
      "Categoría",
      "Proveedor",
      "Estado",
    ];
    const rows = productos.map((producto, index) => [
      (paginaActual - 1) * itemsPorPagina + index + 1,
      producto.nombre,
      `Bs ${producto.precio}`,
      `Bs ${producto.precio_compra}`,
      producto.stock,
      producto.descripcion,
      producto.categoria_nombre,
      producto.proveedor_nombre,
      producto.estado ? "Activo" : "Inactivo",
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([columns, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "productos.xlsx");
  };

  if (loading) return <p className="dark:text-gray-100">Cargando productos...</p>;

  return (
    <div className="p-2 sm:p-4 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Título y botón registrar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h1 className="text-xl font-bold text-center sm:text-left dark:text-gray-100">
          Listado de Productos
        </h1>
        <button
          onClick={abrirModalNuevo}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
        >
          + Registrar producto
        </button>
      </div>

      {/* Filtros y botones de exportación */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
        {/* Filtros */}
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
            <option value="nombre">Nombre</option>
            <option value="categoria">Categoría</option>
            <option value="proveedor">Proveedor</option>
            <option value="estado">Estado</option>
          </select>

          {tipoBusqueda === "estado" ? (
            <select
              value={valorBusqueda}
              onChange={(e) => {
                setValorBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="border px-2 py-1 rounded w-full sm:w-auto dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
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
        {/* Botones de exportación */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={exportarPDF}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full sm:w-auto"
          >
            Imprimir PDF
          </button>
          <button
            onClick={exportarExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto"
          >
            Imprimir Excel
          </button>
        </div>
      </div>

      {/* Tabla para pantallas medianas y grandes */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full border text-sm text-left bg-white dark:bg-gray-800 dark:text-gray-100">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100">
              <th className="px-3 py-2">N°</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Precio Venta</th>
              <th className="px-3 py-2">Precio Compra</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Descripción</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2">Proveedor</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Imagen</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto, index) => (
              <tr key={producto.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-3 py-2">
                  {(paginaActual - 1) * itemsPorPagina + index + 1}
                </td>
                <td className="px-3 py-2">{producto.nombre}</td>
                <td className="px-3 py-2">Bs {producto.precio}</td>
                <td className="px-3 py-2">Bs {producto.precio_compra}</td>
                <td className="px-3 py-2">{producto.stock}</td>
                <td className="px-3 py-2">{producto.descripcion}</td>
                <td className="px-3 py-2">{producto.categoria_nombre}</td>
                <td className="px-3 py-2">{producto.proveedor_nombre}</td>
                <td className="px-3 py-2">
                  {producto.estado ? (
                    <span className="text-green-600 font-semibold">Activo</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Inactivo</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {producto.imagen_url ? (
                    <img
                      src={`http://localhost:4000${producto.imagen_url}`}
                      alt={producto.nombre}
                      className="w-16 h-16 object-cover"
                    />
                  ) : (
                    "Sin imagen"
                  )}
                </td>
                <td className="flex px-4 py-2 space-x-2">
                  <button
                    onClick={() => abrirModalReposicion(producto)}
                    className={`px-3 py-3 rounded text-white ${
                      producto.stock <= 10
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={producto.stock > 10}
                  >
                    <FaDollyFlatbed />
                  </button>
                  <button
                    onClick={() => abrirModalEditar(producto)}
                    className="bg-blue-600 text-white px-3 py-3 rounded hover:bg-blue-700"
                  >
                    <FaPen />
                  </button>
                  <button
                    onClick={() =>
                      cambiarEstadoProducto(producto.id, producto.estado)
                    }
                    className={`px-3 py-3 rounded text-white ${
                      producto.estado
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {producto.estado ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                  <button
                    onClick={() => handleEliminar(producto.id)}
                    className="bg-red-600 text-white px-3 py-3 rounded hover:bg-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards para móviles */}
      <div className="sm:hidden flex flex-col gap-4">
        {productos.map((producto, index) => (
          <div key={producto.id} className="bg-white dark:bg-gray-800 dark:text-gray-100 shadow rounded border p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-blue-700 dark:text-blue-300">
                {(paginaActual - 1) * itemsPorPagina + index + 1}. {producto.nombre}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {producto.estado ? (
                  <span className="text-green-600 font-semibold">Activo</span>
                ) : (
                  <span className="text-red-600 font-semibold">Inactivo</span>
                )}
              </span>
            </div>
            <div className="text-sm mb-1"><span className="font-semibold">Precio Venta:</span> Bs {producto.precio}</div>
            <div className="text-sm mb-1"><span className="font-semibold">Precio Compra:</span> Bs {producto.precio_compra}</div>
            <div className="text-sm mb-1"><span className="font-semibold">Stock:</span> {producto.stock}</div>
            <div className="text-sm mb-1"><span className="font-semibold">Descripción:</span> {producto.descripcion}</div>
            <div className="text-sm mb-1"><span className="font-semibold">Categoría:</span> {producto.categoria_nombre}</div>
            <div className="text-sm mb-1"><span className="font-semibold">Proveedor:</span> {producto.proveedor_nombre}</div>
            <div className="text-sm mb-1">
              <span className="font-semibold">Imagen:</span>{" "}
              {producto.imagen_url ? (
                <img
                  src={`http://localhost:4000${producto.imagen_url}`}
                  alt={producto.nombre}
                  className="w-16 h-16 object-cover mt-1"
                />
              ) : (
                "Sin imagen"
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => abrirModalReposicion(producto)}
                className={`px-2 py-2 rounded text-white w-full ${
                  producto.stock <= 10
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                disabled={producto.stock > 10}
              >
                <FaDollyFlatbed />
              </button>
              <button
                onClick={() => abrirModalEditar(producto)}
                className="bg-blue-600 text-white px-2 py-2 rounded hover:bg-blue-700 w-full"
              >
                <FaPen />
              </button>
              <button
                onClick={() =>
                  cambiarEstadoProducto(producto.id, producto.estado)
                }
                className={`px-2 py-2 rounded text-white w-full ${
                  producto.estado
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {producto.estado ? <FaToggleOn /> : <FaToggleOff />}
              </button>
              <button
                onClick={() => handleEliminar(producto.id)}
                className="bg-red-600 text-white px-2 py-2 rounded hover:bg-red-700 w-full"
              >
                <FaTrash />
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

      {/* Modal reposición */}
      {mostrarModalReposicion && productoReposicion && (
        <ReposicionForm
          producto={productoReposicion}
          onCerrar={() => setMostrarModalReposicion(false)}
          onSuccess={() => {
            toast.success("Reposición solicitada");
            setMostrarModalReposicion(false);
            obtenerProductos();
          }}
          token={token}
        />
      )}

      {/* Modal producto */}
      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 dark:text-gray-100 p-6 rounded shadow-lg w-full max-w-2xl relative">
            <button
              onClick={cerrarModal}
              className="absolute top-2 right-3 text-gray-600 dark:text-gray-200 text-xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {productoEditar ? "Editar producto" : "Registrar producto"}
            </h2>
            <FormularioProducto
              producto={productoEditar}
              onSuccess={handleExito}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;
