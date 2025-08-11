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

  if (!resumen) return <p className="text-center mt-10 dark:text-gray-100">Cargando datos...</p>;

  return (
    <div className="p-2 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Resumen del Inventario</h1>
      {/* Tarjetas responsivas */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card titulo="Productos Totales" valor={resumen.productosTotales} color="bg-blue-500 dark:bg-blue-700" icono={<FaBoxOpen/>}/>
        <Card titulo="Total Stock" valor={resumen.totalStock} color="bg-yellow-500 dark:bg-yellow-700" icono={<FaChartLine/>}/>
        <Card titulo="Reposiciones Pendientes" valor={resumen.reposPendientes} color="bg-red-500 dark:bg-red-700" icono={<FaClipboardList/>}/>
        <Card titulo="Movimientos Hoy" valor={resumen.movHoy} color="bg-green-500 dark:bg-green-700" icono={<FaCalendarDay/>}/>
      </div>

      {/* Tabla productos con menor stock */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Top 5 Productos con menor stock</h2>
        <div className="overflow-x-auto rounded-lg shadow dark:bg-gray-800">
          <table className="min-w-[320px] w-full border border-gray-200 dark:border-gray-700 text-left text-sm bg-white dark:bg-gray-800 dark:text-gray-100">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-2 border-b dark:border-gray-700">Producto</th>
                <th className="p-2 border-b dark:border-gray-700">Stock</th>
              </tr>
            </thead>
            <tbody>
              {resumen.productosBajoStock && resumen.productosBajoStock.length === 0 ? (
                <tr>
                  <td colSpan="2" className="p-2 text-center text-gray-500 dark:text-gray-400">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                resumen.productosBajoStock?.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-2 border-b dark:border-gray-700">{prod.nombre}</td>
                    <td className="p-2 border-b dark:border-gray-700">{prod.stock}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico movimientos */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-2 sm:p-6 rounded-xl shadow-lg overflow-x-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Movimientos del Mes</h2>
        <div className="min-w-[320px]">
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
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                title: { display: false },
              },
            }}
            height={260}
          />
        </div>
      </div>

    </div>
  );
}

function Card({ titulo, valor, color, icono }) {
  return (
    <div className={`flex flex-col xs:flex-row items-center p-4 sm:p-6 rounded-xl text-white shadow-lg ${color}`}>
      <div className="flex items-center justify-center mb-2 xs:mb-0 xs:mr-6">
        <span className="text-4xl sm:text-5xl">{icono}</span>
      </div>
      <div className="text-center xs:text-left">
        <h2 className="text-base sm:text-lg">{titulo}</h2>
        <p className="text-2xl sm:text-3xl font-bold">{valor}</p>
      </div>
    </div>
  );
}
