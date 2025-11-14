// src/pages/DashboardPage.tsx
import React from "react";
import { theme } from '../styles/theme';
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
import { TrendingUp, Warehouse, ShoppingCart, Package } from "lucide-react";

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

// Wrapper components para resolver problemas de tipos con React 19
const ChartIcon = () => <TrendingUp size={30} color="#7c3aed" />;
const WarehouseIcon = () => <Warehouse size={30} color="#3b82f6" />;
const ShoppingIcon = () => <ShoppingCart size={30} color="#f59e0b" />;
const BoxIcon = () => <Package size={30} color="#10b981" />;

export const DashboardPage: React.FC = () => {
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
        backgroundColor: "#f59e0b",
      },
      {
        label: "Ventas",
        data: [4000, 4200, 5000, 6200, 6900, 7500],
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const productosMasVendidos = {
    labels: [
      "Mouse",
      "Teclado",
      "Auriculares",
      "Monitor",
      "Silla Gamer",
      "Notebook",
    ],
    datasets: [
      {
        label: "Productos",
        data: [120, 90, 80, 70, 65, 60],
        backgroundColor: [
          "#3b82f6",
          "#8b5cf6",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#6366f1",
        ],
      },
    ],
  };

  // Opciones para controlar el tamaño de los gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.2,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          font: { size: 12 },
          color: theme.colors.textSecondary,
        },
      },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(230,238,248,0.04)' },
        ticks: { color: theme.colors.textSecondary, font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: theme.colors.textSecondary, font: { size: 11 } },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.3, // Más compacto para el doughnut
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: { size: 11 },
          color: theme.colors.textSecondary,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(11,19,32,0.95)',
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
      },
    },
    cutout: '50%', // Hace el agujero del centro más grande
  };

  // ===== Interfaz visual =====
  return (
    <div style={{ padding: '2rem', backgroundColor: theme.colors.background, color: theme.colors.textPrimary, minHeight: '100vh', overflowY: 'auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '0.5rem', color: theme.colors.textPrimary }}>
        Panel de Control
      </h1>
      <p style={{ color: theme.colors.textSecondary, marginBottom: '2rem' }}>
        Resumen general del estado del stock y las ventas.
      </p>

      {/* ===== Tarjetas ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div style={cardStyle}>
          <ChartIcon />
          <h3 style={cardTitle}>Ventas Totales</h3>
          <p style={cardValue}>$7,520.00</p>
          <span style={{ color: "#10b981" }}>+13.6% este mes</span>
        </div>

        <div style={cardStyle}>
          <WarehouseIcon />
          <h3 style={cardTitle}>Valor de Stock</h3>
          <p style={cardValue}>$115,960.00</p>
          <span style={{ color: "#ef4444" }}>-2.3% mes anterior</span>
        </div>

        <div style={cardStyle}>
          <ShoppingIcon />
          <h3 style={cardTitle}>Productos Vendidos</h3>
          <p style={cardValue}>8</p>
          <span style={{ color: "#10b981" }}>+47.1% este mes</span>
        </div>

        <div style={cardStyle}>
          <BoxIcon />
          <h3 style={cardTitle}>Stock Activo</h3>
          <p style={cardValue}>11 productos</p>
          <span style={{ color: "#f59e0b" }}>+3 nuevos ingresos</span>
        </div>
      </div>

      {/* ===== Gráficos ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
          gap: "2rem",
          paddingBottom: "2rem",
        }}
      >
        <div style={{ ...chartCard, minHeight: "350px" }}>
          <h3 style={chartTitle}>Evolución de Ventas</h3>
          <div style={{ height: "280px" }}>
            <Line data={ventasMensuales} options={chartOptions} />
          </div>
        </div>

        <div style={{ ...chartCard, minHeight: "350px" }}>
          <h3 style={chartTitle}>Ventas vs Compras</h3>
          <div style={{ height: "280px" }}>
            <Bar data={ventasCompras} options={chartOptions} />
          </div>
        </div>

        <div style={{ ...chartCard, minHeight: "350px", gridColumn: "1 / -1", maxWidth: "500px", margin: "0 auto" }}>
          <h3 style={chartTitle}>Productos Más Vendidos</h3>
          <div style={{ height: "280px", display: "flex", justifyContent: "center" }}>
            <Doughnut data={productosMasVendidos} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== Estilos Reutilizables =====
const cardStyle: React.CSSProperties = {
  backgroundColor: theme.colors.surface,
  borderRadius: '12px',
  padding: '1.5rem',
  boxShadow: theme.shadows.sm,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.5rem',
};

const cardTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: theme.colors.textSecondary,
};

const cardValue: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 700,
  color: theme.colors.textPrimary,
};

const chartCard: React.CSSProperties = {
  backgroundColor: theme.colors.surface,
  borderRadius: '12px',
  padding: '1.5rem',
  boxShadow: theme.shadows.sm,
};

const chartTitle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  marginBottom: '1rem',
  color: theme.colors.textPrimary,
};

export default DashboardPage;
