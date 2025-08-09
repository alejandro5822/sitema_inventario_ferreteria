import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import { toast } from 'react-toastify';

export default function FormularioProducto({ onSuccess, producto = null }) {
  const { token } = useAuth();
  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    precio_compra: "",
    stock: "",
    categoria_id: "",
    subcategoria_id: "",
    proveedor_id: "",
    imagen: null,
  });

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    if (producto) {
      setFormulario({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        precio_compra: producto.precio_compra,
        stock: producto.stock,
        categoria_id: producto.categoria_id,
        subcategoria_id: producto.subcategoria_id,
        proveedor_id: producto.proveedor_id,
        imagen: null,
      });
    }
  }, [producto]);

  useEffect(() => {
    const obtenerDatos = async () => {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [resCat, resSub, resProv] = await Promise.all([
        axios.get("http://localhost:4000/api/categorias", config),
        axios.get("http://localhost:4000/api/subcategorias", config),
        axios.get("http://localhost:4000/api/proveedores", config),
      ]);
      setCategorias(resCat.data);
      setSubcategorias(resSub.data);
      setProveedores(resProv.data);
    };

    obtenerDatos();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen") {
      setFormulario({ ...formulario, imagen: files[0] });
    } else {
      setFormulario({ ...formulario, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in formulario) {
      if (formulario[key]) {
        formData.append(key, formulario[key]);
      }
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (producto) {
        // Modo edición
        await axios.put(
          `http://localhost:4000/api/productos/${producto.id}`,
          formData,
          config
        );
        toast.success("Producto actualizado correctamente");
      } else {
        // Modo creación
        await axios.post("http://localhost:4000/api/productos", formData, config);
        toast.success("Producto creado correctamente");
      }

      onSuccess(); // Refrescar listado
    } catch (error) {
      console.error("Error al guardar producto:", error);
      toast.error("Error al actualizar el producto");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded shadow"
    >
      <input
        type="text"
        name="nombre"
        value={formulario.nombre}
        onChange={handleChange}
        placeholder="Nombre del producto"
        required
        className="border px-3 py-2 rounded"
      />
      <input
        type="number"
        name="precio"
        value={formulario.precio}
        onChange={handleChange}
        placeholder="Precio"
        required
        className="border px-3 py-2 rounded"
      />
      <input
        type="number"
        name="precio_compra"
        value={formulario.precio_compra}
        onChange={handleChange}
        placeholder="Precio de compra"
        required
        className="border px-3 py-2 rounded"
      />
      <input
        type="number"
        name="stock"
        value={formulario.stock}
        onChange={handleChange}
        placeholder="Stock"
        required
        className="border px-3 py-2 rounded"
      />
      <textarea
        name="descripcion"
        value={formulario.descripcion}
        onChange={handleChange}
        placeholder="Descripción"
        rows="2"
        className="border px-3 py-2 rounded md:col-span-2"
      ></textarea>

      <select
        name="categoria_id"
        value={formulario.categoria_id}
        onChange={handleChange}
        className="border px-3 py-2 rounded"
        required
      >
        <option value="">Seleccione categoría</option>
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nombre}
          </option>
        ))}
      </select>

      <select
        name="subcategoria_id"
        value={formulario.subcategoria_id}
        onChange={handleChange}
        className="border px-3 py-2 rounded"
      >
        <option value="">Seleccione subcategoría</option>
        {subcategorias
          .filter((sub) => sub.categoria_id == formulario.categoria_id)
          .map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.nombre}
            </option>
          ))}
      </select>

      <select
        name="proveedor_id"
        value={formulario.proveedor_id}
        onChange={handleChange}
        className="border px-3 py-2 rounded"
      >
        <option value="">Seleccione proveedor</option>
        {proveedores.map((prov) => (
          <option key={prov.id} value={prov.id}>
            {prov.nombre}
          </option>
        ))}
      </select>

      <input
        type="file"
        name="imagen"
        onChange={handleChange}
        accept="image/*"
        className="border px-3 py-2 rounded"
      />

      <button
        type="submit"
        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 md:col-span-2"
      >
        {producto ? "Actualizar producto" : "Registrar producto"}
      </button>
    </form>
  );
}
