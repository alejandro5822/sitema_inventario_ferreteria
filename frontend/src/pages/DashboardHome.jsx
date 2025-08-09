import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import { FaBoxOpen, FaChartLine, FaClipboardList, FaCalendarDay  } from "react-icons/fa";

export default function DashboardHome() {
  const { token } = useAuth();
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/dashboard/resumen", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setResumen(data))
      .catch((err) => console.error("Error cargando dashboard:", err));
  }, [token]);

  if (!resumen) return <p className="text-center mt-10">Cargando datos...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Resumen del Inventario</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card titulo="Productos Totales" valor={resumen.productosTotales} color="bg-blue-500" icono={<FaBoxOpen/>}/>
        <Card titulo="Total Stock" valor={resumen.totalStock} color="bg-yellow-500" icono={<FaChartLine/>}/>
        <Card titulo="Reposiciones Pendientes" valor={resumen.reposPendientes} color="bg-red-500" icono={<FaClipboardList/>}/>
        <Card titulo="Movimientos Hoy" valor={resumen.movHoy} color="bg-green-500" icono={<FaCalendarDay/>}/>
      </div>

      {/* Tabla productos con menor stock */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Top 5 Productos con menor stock</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border-b">Producto</th>
                <th className="p-2 border-b">Stock</th>
              </tr>
            </thead>
            <tbody>
              {resumen.productosBajoStock && resumen.productosBajoStock.length === 0 ? (
                <tr>
                  <td colSpan="2" className="p-2 text-center text-gray-500">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                resumen.productosBajoStock?.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50">
                    <td className="p-2 border-b">{prod.nombre}</td>
                    <td className="p-2 border-b">{prod.stock}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico movimientos */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Movimientos del Mes</h2>
        <Bar
          data={{
            labels: resumen.movimientosMes.map((m) => m.dia),
            datasets: [
              {
                label: "Entradas",
                data: resumen.movimientosMes.map((m) => m.entradas),
                backgroundColor: "rgba(34,197,94,0.7)",
              },
              {
                label: "Salidas",
                data: resumen.movimientosMes.map((m) => m.salidas),
                backgroundColor: "rgba(239,68,68,0.7)",
              },
            ],
          }}
        />
      </div>

    </div>
  );
}

function Card({ titulo, valor, color, icono }) {
  return (
    <div className={`flex p-6 rounded-xl text-white shadow-lg ${color}`}>
      <div className="flex items-center justify-center mr-8">
        <span className="text-5xl">{icono}</span>
      </div>
      <div>
        <h2 className="text-lg">{titulo}</h2>
        <p className="text-3xl font-bold">{valor}</p>
      </div>
    </div>
  );
}
