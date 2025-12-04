'use client';

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
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
import { theme } from '../../styles/theme';

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
  const { data: session } = useSession();
  const [productos, setProductos] = useState<any[]>([]);

  // Check for token refresh error
  useEffect(() => {
    if ((session as any)?.error === 'RefreshAccessTokenError') {
      signOut({ callbackUrl: '/login' });
    }
  }, [session]);

  useEffect(() => {
    // Left intentionally empty: removed productos recientes fetch to simplify dashboard UI
  }, [session]);

  // ===== Datos de ejemplo para charts y stats =====
  const ventasMensuales = { labels: ["Ene","Feb","Mar","Abr","May","Jun"], datasets: [{ label:"Ventas", data:[3500,4800,4100,5500,7000,7520], borderColor:"#7c3aed", backgroundColor:"rgba(124, 58, 237, 0.1)", fill:true, tension:0.4 }] };
  const categoriasStock = { labels:["Electrónicos","Ropa","Hogar","Deportes","Libros"], datasets:[{ data:[35,25,20,15,5], backgroundColor:["#7c3aed","#10b981","#f59e0b","#3b82f6","#ef4444"], borderWidth:0 }]};
  const productosPopulares = { labels:["Laptop Pro","Smartphone X","Auriculares BT","Tablet Air","Monitor 4K"], datasets:[{ label:"Existencias", data:[220,150,190,180,260], backgroundColor:"#7c3aed" }]};
  const totalExistencias = categoriasStock.datasets[0].data.reduce((s:any, x:any) => s + Number(x), 0);
  const stats = { totalProductos:1247, stockBajo:23, ventasMes:45832, almacenes:4 };

  const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <div style={{ backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.sm, border: `1px solid ${theme.colors.border}` }}>
      <div style={{ display:'flex', alignItems:'center' }}>
        <div style={{ padding:'12px', borderRadius: theme.borderRadius.md, background:color }}>
          <Icon className="text-white text-xl"/>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-200">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div style={{ display:'block', gap: theme.spacing.lg }}>
        <div>
          <h1 style={{ fontSize:'1.875rem', fontWeight:700, color: theme.colors.textPrimary }}>Dashboard</h1>
          <p style={{ color: theme.colors.textSecondary }}>Resumen general del inventario</p>
        </div>

        {/* Stats Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(1, 1fr)', gap: theme.spacing.md }}>
          <StatCard icon={FaBox} title="Total Productos" value={stats.totalProductos} color={theme.colors.primary} />
          <StatCard icon={FaChartLine} title="Almacenes" value={stats.almacenes} color={theme.colors.primary} />
        </div>

        {/* Charts y productos recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div style={{ backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.sm, border:`1px solid ${theme.colors.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
            <h3 style={{ fontSize:'1.125rem', fontWeight:600, marginBottom: theme.spacing.sm, color:theme.colors.textPrimary }}>Cantidad total de existencias</h3>
            <div style={{ fontSize: '3rem', fontWeight:700, color: theme.colors.textPrimary }}>{totalExistencias}</div>
          </div>
          <div style={{ backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.sm, border:`1px solid ${theme.colors.border}` }}>
            <h3 style={{ fontSize:'1.125rem', fontWeight:600, marginBottom: theme.spacing.sm, color:theme.colors.textPrimary }}>Distribución por Categorías</h3>
            <div style={{ height:'250px', display:'flex', justifyContent:'center' }}>
              <Doughnut data={categoriasStock} options={{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom'}}}} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.sm, border:`1px solid ${theme.colors.border}` }}>
          <h3 style={{ fontSize:'1.125rem', fontWeight:600, marginBottom: theme.spacing.sm, color:theme.colors.textPrimary }}>Productos con más existencias</h3>
          <div style={{ height:'300px' }}>
            <Bar data={productosPopulares} options={{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true, grid:{color:'rgba(0,0,0,0.1)'}}, x:{grid:{display:false}}}}} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
