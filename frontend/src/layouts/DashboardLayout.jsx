import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useState } from "react";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-600">
      {/* Sidebar ajustado */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} className="sm:w-64 w-0 sm:block hidden" />
      
      <div className="flex-1 flex flex-col">
        {/* Navbar ajustado */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-full">
          <Outlet />
        </main>
      </div>

      {/* Overlay para cerrar Sidebar en móviles */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
