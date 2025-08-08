import { useState, useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import { toast } from "react-toastify";
import axios from "axios";

const UsuarioFormModal = ({ usuario, cerrar }) => {
  const { token } = useAuth();
  const [roles, setRoles] = useState([]);
  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    rol_id: "",
    estado: true,
  });

  useEffect(() => {
    const obtenerRoles = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/roles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(response.data);
      } catch (error) {
        console.error("Error al obtener roles:", error);
      }
    };
    obtenerRoles();
  }, [token]);

  useEffect(() => {
    if (usuario) {
      setFormulario({
        nombre: usuario.nombre || "",
        correo: usuario.correo || "",
        contrasena: "",
        confirmarContrasena: "",
        rol_id: usuario.rol_id || "",
        estado: usuario.estado ?? true,
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario({
      ...formulario,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formulario.contrasena || formulario.confirmarContrasena) {
      if (formulario.contrasena !== formulario.confirmarContrasena) {
        toast.error("Las contraseñas no coinciden");
        return;
      }
    }

    try {
      const method = usuario ? "PUT" : "POST";
      const url = usuario
        ? `http://localhost:4000/api/usuarios/${usuario.id}`
        : "http://localhost:4000/api/usuarios";

      const body = {
        nombre: formulario.nombre,
        correo: formulario.correo,
        rol_id: formulario.rol_id,
        estado: formulario.estado,
      };

      if (!usuario) {
        body.contrasena = formulario.contrasena;
      }

      if (usuario && formulario.contrasena) {
        body.contrasena = formulario.contrasena;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al guardar usuario");
        return;
      }

      toast.success(usuario ? "Usuario actualizado" : "Usuario registrado");
      cerrar();
      if (typeof onExito === "function") onExito();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      toast.error("Error al guardar usuario");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
        <h3 className="text-lg font-bold mb-4">
          {usuario ? "Editar Usuario" : "Nuevo Usuario"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nombre"
            value={formulario.nombre}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Nombre completo"
            required
          />
          <input
            type="email"
            name="correo"
            value={formulario.correo}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Correo electrónico"
            required
          />
          <input
            type="password"
            name="contrasena"
            value={formulario.contrasena}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Contraseña"
            required={!usuario}
          />
          <input
            type="password"
            name="confirmarContrasena"
            value={formulario.confirmarContrasena}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Confirmar contraseña"
            required={!usuario}
          />
          <select
            name="rol_id"
            value={formulario.rol_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Seleccione un rol</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="estado"
              checked={formulario.estado}
              onChange={handleChange}
            />
            Activo
          </label>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={cerrar}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {usuario ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsuarioFormModal;
