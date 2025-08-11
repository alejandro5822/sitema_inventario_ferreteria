import { useState, useEffect } from "react";
import { useAuth } from "../auth/useAuth";

const Configuraciones = () => {
  const { usuario, token } = useAuth();
  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [correo, setCorreo] = useState(usuario?.correo || "");
  const [tema, setTema] = useState(localStorage.getItem("tema") || "claro");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "oscuro");
  }, [tema]);

  const guardarTema = () => {
    localStorage.setItem("tema", tema);
    document.documentElement.classList.toggle("dark", tema === "oscuro");
    alert(`Tema cambiado a ${tema}`);
  };

  const actualizarPerfil = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`http://localhost:4000/api/usuarios/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, correo })
      });

      if (!resp.ok) throw new Error("Error al actualizar el perfil");
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar el perfil");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Configuraciones</h1>
      {/* Perfil */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
        <h2 className="text-xl mb-3 font-semibold text-gray-700 dark:text-gray-100">Actualizar Perfil</h2>
        <form onSubmit={actualizarPerfil} className="space-y-3">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border p-2 w-full rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="border p-2 w-full rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Guardar cambios
          </button>
        </form>
      </div>
      {/* Tema */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="text-xl mb-3 font-semibold text-gray-700 dark:text-gray-100">Tema</h2>
        <select
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          className="border p-2 rounded mr-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="claro">Claro</option>
          <option value="oscuro">Oscuro</option>
        </select>
        <button
          onClick={guardarTema}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Guardar Tema
        </button>
      </div>
    </div>
  );
}

export default Configuraciones;
