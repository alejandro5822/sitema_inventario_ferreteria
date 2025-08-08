// src/pages/Categorias.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import CategoriaFormModal from "../components/CategoriaFormModal";
import { toast } from 'react-toastify';

const Categorias = () => {
  const { token } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

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
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar esta categoría?");
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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Lista de Categorías</h2>
        <button
          onClick={abrirModalNueva}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nueva Categoría
        </button>
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-3">ID</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Descripcion</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{cat.id}</td>
              <td className="p-3">{cat.nombre}</td>
              <td className="p-3">{cat.descripcion || "Sin descripción"}</td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => abrirModalEditar(cat)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Editar
                </button>
                {/* Más acciones como eliminar o desactivar se agregarán luego */}
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded" 
                  onClick={() => manejarEliminar(cat.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
