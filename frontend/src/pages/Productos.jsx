import { useEffect, useState } from "react";
import { useAuth  } from "../auth/useAuth";
import axios from "axios";
import FormularioProducto from "../components/FormularioProducto";
import { toast } from 'react-toastify';

const Productos = () => {
  const { token } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  

  const obtenerProductos = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/productos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

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
      await axios.patch(`http://localhost:4000/api/productos/${id}/estado`, {
        estado: !estadoActual,
      }, config);

      toast.success(`Producto ${!estadoActual ? "activado" : "desactivado"} correctamente`);
      obtenerProductos(); // Actualizar lista
      } catch (error) {
        console.error("Error al cambiar el estado del producto:", error);
        toast.error("Ocurrió un error al cambiar el estado del producto");
      }
  };

  const handleEliminar = async (id) => {
  const confirmar = window.confirm("¿Estás seguro que deseas eliminar este producto permanentemente?");
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



  if (loading) return <p>Cargando productos...</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Listado de Productos</h1>
        <button onClick={abrirModalNuevo} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Registrar producto
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm text-left">
          <thead className="bg-gray-100">
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Precio</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Categoría</th>
              <th className="px-4 py-2">Proveedor</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Imagen</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{producto.id}</td>
                <td className="px-4 py-2">{producto.nombre}</td>
                <td className="px-4 py-2">Bs {producto.precio}</td>
                <td className="px-4 py-2">{producto.stock}</td>
                <td className="px-4 py-2">{producto.descripcion}</td>
                <td className="px-4 py-2">{producto.categoria_nombre}</td>
                <td className="px-4 py-2">{producto.proveedor_nombre}</td>
                <td className="px-4 py-2">
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
                  <button onClick={() => abrirModalEditar(producto)} className="bg-blue-600 text-white px-2 py-2 rounded hover:bg-blue-700">Editar</button>
                  <button
                    onClick={() => cambiarEstadoProducto(producto.id, producto.estado)}
                    className={`px-2 py-1 rounded text-white ${
                      producto.estado ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {producto.estado ? "Desactivar" : "Activar"}
                  </button>
                  
                  <button onClick={() => handleEliminar(producto.id)} className="bg-red-600 text-white px-2 py-2 rounded hover:bg-red-700">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl relative">
            <button
              onClick={cerrarModal}
              className="absolute top-2 right-3 text-gray-600 text-xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {productoEditar ? "Editar producto" : "Registrar producto"}
            </h2>
            <FormularioProducto producto={productoEditar} onSuccess={handleExito} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Productos;