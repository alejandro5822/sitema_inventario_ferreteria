import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHome,
  FaBoxes,
  FaTags,
  FaList,
  FaTruck,
  FaExchangeAlt,
  FaChartLine,
  FaUsers,
  FaUserShield,
  FaCog,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState('null');

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <aside className="w-56 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-bold mb-6">InventarioApp</h2>

      {/* INICIO */}
      <Link to="/" className="flex items-center gap-2 mb-4 hover:text-yellow-400">
        <FaHome /> Inicio
      </Link>

      {/* INVENTARIO */}
      <div>
        <button onClick={() => toggleMenu('inventario')} className="flex items-center justify-between w-full mb-2 hover:text-yellow-400">
          <span className="flex items-center gap-2">
            <FaBoxes /> Inventario
          </span>
          {openMenu === 'inventario' ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {openMenu === 'inventario' && (
          <ul className="ml-6 space-y-2 pt-2">
            <li><Link to="/productos" className="hover:text-yellow-400">Productos</Link></li>
            <li><Link to="/categorias" className="hover:text-yellow-400">Categorías</Link></li>
            <li><Link to="/subcategorias" className="hover:text-yellow-400">Subcategorías</Link></li>
            <li><Link to="/proveedores" className="hover:text-yellow-400">Proveedores</Link></li>
          </ul>
        )}
      </div>

      {/* MOVIMIENTOS */}
      <div>
        <button onClick={() => toggleMenu('movimientos')} className="flex items-center justify-between w-full mt-4 hover:text-yellow-400">
          <span className="flex items-center gap-2">
            <FaExchangeAlt /> Movimientos
          </span>
          {openMenu === 'movimientos' ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {openMenu === 'movimientos' && (
          <ul className="ml-6 space-y-2 pt-2">
            <li><Link to="/movimientos" className="hover:text-yellow-400">Registro</Link></li>
          </ul>
        )}
      </div>

      {/* HISTORIAL */}
      <div>
        <button onClick={() => toggleMenu('historial')} className="flex items-center justify-between w-full mt-4 hover:text-yellow-400">
          <span className="flex items-center gap-2">
            <FaChartLine /> Historial
          </span>
          {openMenu === 'historial' ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {openMenu === 'historial' && (
          <ul className="ml-6 space-y-2 pt-2">
            <li><Link to="/historial-stock" className="hover:text-yellow-400">Historial de Stock</Link></li>
          </ul>
        )}
      </div>

      {/* USUARIOS */}
      <div>
        <button onClick={() => toggleMenu('usuarios')} className="flex items-center justify-between w-full mt-4 hover:text-yellow-400">
          <span className="flex items-center gap-2">
            <FaUsers /> Usuarios
          </span>
          {openMenu === 'usuarios' ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {openMenu === 'usuarios' && (
          <ul className="ml-6 space-y-2 pt-2">
            <li><Link to="/usuarios" className="hover:text-yellow-400">Lista de Usuarios</Link></li>
            <li><Link to="/roles" className="hover:text-yellow-400">Roles</Link></li>
          </ul>
        )}
      </div>

      {/* CONFIGURACIÓN */}
      <Link to="/configuracion" className="flex items-center gap-2 mt-6 hover:text-yellow-400">
        <FaCog /> Configuración
      </Link>
    </aside>
  );
};

export default Sidebar;
