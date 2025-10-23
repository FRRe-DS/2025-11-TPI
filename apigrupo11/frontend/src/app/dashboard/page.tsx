'use client';

import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
  BarElement,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { FaBox, FaChartLine, FaShoppingCart, FaWarehouse } from "react-icons/fa";
import MainLayout from '../../components/layout/MainLayoutNext';

ChartJS.register(
  ArcElement,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
);

export default function DashboardPage() {
  // ===== Datos de ejemplo =====
  const ventasMensuales = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    datasets: [
      {
        label: "Ventas",
        data: [3500, 4800, 4100, 5500, 7000, 7520],
        borderColor: "#7c3aed",
        backgroundColor: "rgba(124, 58, 237, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const ventasCompras = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    datasets: [
      {
        label: "Compras",
        data: [3000, 2500, 2800, 3300, 2900, 3200],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Ventas",
        data: [3500, 4800, 4100, 5500, 7000, 7520],
        borderColor: "#7c3aed",
        backgroundColor: "rgba(124, 58, 237, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const categoriasStock = {
    labels: ["Electrónicos", "Ropa", "Hogar", "Deportes", "Libros"],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          "#7c3aed",
          "#10b981",
          "#f59e0b",
          "#3b82f6",
          "#ef4444",
        ],
        borderWidth: 0,
      },
    ],
  };

  const productosPopulares = {
    labels: ["Laptop Pro", "Smartphone X", "Auriculares BT", "Tablet Air", "Monitor 4K"],
    datasets: [
      {
        label: "Unidades Vendidas",
        data: [120, 150, 90, 80, 60],
        backgroundColor: "#7c3aed",
      },
    ],
  };

  const stats = {
    totalProductos: 1247,
    stockBajo: 23,
    ventasMes: 45832,
    almacenes: 4,
  };

  const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="text-white text-xl" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Resumen general del inventario</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={FaBox}
            title="Total Productos"
            value={stats.totalProductos}
            color="bg-blue-500"
          />
          <StatCard
            icon={FaWarehouse}
            title="Stock Bajo"
            value={stats.stockBajo}
            color="bg-yellow-500"
          />
          <StatCard
            icon={FaShoppingCart}
            title="Ventas del Mes"
            value={stats.ventasMes}
            color="bg-green-500"
          />
          <StatCard
            icon={FaChartLine}
            title="Almacenes"
            value={stats.almacenes}
            color="bg-purple-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Ventas Mensuales</h3>
            <div style={{ height: '250px' }}>
              <Line
                data={ventasMensuales}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Stock Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Distribución por Categorías</h3>
            <div style={{ height: '250px' }} className="flex justify-center">
              <Doughnut
                data={categoriasStock}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Comparación Ventas vs Compras</h3>
          <div style={{ height: '300px' }}>
            <Line
              data={ventasCompras}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Popular Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Productos Más Populares</h3>
          <div style={{ height: '300px' }}>
            <Bar
              data={productosPopulares}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
