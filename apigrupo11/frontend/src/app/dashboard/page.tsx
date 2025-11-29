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
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState<string | null>(null);

  // Check for token refresh error
  useEffect(() => {
    if ((session as any)?.error === 'RefreshAccessTokenError') {
      signOut({ callbackUrl: '/login' });
    }
  }, [session]);

  useEffect(() => {
    const fetchProductos = async () => {
      if (!session?.accessToken) {
        setLoadingProductos(false);
        setErrorProductos('No hay token de sesión disponible');
        return;
      }

      try {
        // URL correcta para Docker en Windows
        const response = await fetch('http://localhost:3000/api/productos?page=1&limit=5', {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProductos(data.data || []);
          setErrorProductos(null);
        } else {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${text}`);
        }
      } catch (error: any) {
        console.error('Error fetching productos:', error);
        setErrorProductos(error.message);
      } finally {
        setLoadingProductos(false);
      }
    };

    fetchProductos();
  }, [session]);

  // ===== Datos de ejemplo para charts y stats =====
  const ventasMensuales = { labels: ["Ene","Feb","Mar","Abr","May","Jun"], datasets: [{ label:"Ventas", data:[3500,4800,4100,5500,7000,7520], borderColor:"#7c3aed", backgroundColor:"rgba(124, 58, 237, 0.1)", fill:true, tension:0.4 }] };
  const ventasCompras = { labels:["Ene","Feb","Mar","Abr","May","Jun"], datasets:[{ label:"Compras", data:[3000,2500,2800,3300,2900,3200], borderColor:"#ef4444", backgroundColor:"rgba(239, 68, 68, 0.1)", fill:true, tension:0.4 }, { label:"Ventas", data:[3500,4800,4100,5500,7000,7520], borderColor:"#7c3aed", backgroundColor:"rgba(124, 58, 237, 0.1)", fill:true, tension:0.4 }]};
  const categoriasStock = { labels:["Electrónicos","Ropa","Hogar","Deportes","Libros"], datasets:[{ data:[35,25,20,15,5], backgroundColor:["#7c3aed","#10b981","#f59e0b","#3b82f6","#ef4444"], borderWidth:0 }]};
  const productosPopulares = { labels:["Laptop Pro","Smartphone X","Auriculares BT","Tablet Air","Monitor 4K"], datasets:[{ label:"Unidades Vendidas", data:[120,150,90,80,60], backgroundColor:"#7c3aed" }]};
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
          <StatCard icon={FaWarehouse} title="Stock Bajo" value={stats.stockBajo} color={theme.colors.warning} />
          <StatCard icon={FaShoppingCart} title="Ventas del Mes" value={stats.ventasMes} color={theme.colors.success} />
          <StatCard icon={FaChartLine} title="Almacenes" value={stats.almacenes} color={theme.colors.primary} />
        </div>

        {/* Charts y productos recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div style={{ backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.sm, border:`1px solid ${theme.colors.border}` }}>
            <h3 style={{ fontSize:'1.125rem', fontWeight:600, marginBottom: theme.spacing.sm, color:theme.colors.textPrimary }}>Ventas Mensuales</h3>
            <div style={{ height:'250px' }}>
              <Line data={ventasMensuales} options={{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true, grid:{color:'rgba(0,0,0,0.1)'}}, x:{grid:{display:false}} }}} />
            </div>
          </div>
          <div style={{ backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.sm, border:`1px solid ${theme.colors.border}` }}>
            <h3 style={{ fontSize:'1.125rem', fontWeight:600, marginBottom: theme.spacing.sm, color:theme.colors.textPrimary }}>Distribución por Categorías</h3>
            <div style={{ height:'250px', display:'flex', justifyContent:'center' }}>
              <Doughnut data={categoriasStock} options={{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom'}}}} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.sm, border:`1px solid ${theme.colors.border}` }}>
          <h3 style={{ fontSize:'1.125rem', fontWeight:600, marginBottom: theme.spacing.sm, color:theme.colors.textPrimary }}>Comparación Ventas vs Compras</h3>
          <div style={{ height:'300px' }}>
            <Line data={ventasCompras} options={{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:true, position:'top'}}, scales:{ y:{beginAtZero:true, grid:{color:'rgba(0,0,0,0.1)'}}, x:{grid:{display:false}}}}} />
          </div>
        </div>

        <div style={{ backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.sm, border:`1px solid ${theme.colors.border}` }}>
          <h3 style={{ fontSize:'1.125rem', fontWeight:600, marginBottom: theme.spacing.sm, color:theme.colors.textPrimary }}>Productos Más Populares</h3>
          <div style={{ height:'300px' }}>
            <Bar data={productosPopulares} options={{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true, grid:{color:'rgba(0,0,0,0.1)'}}, x:{grid:{display:false}}}}} />
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.sm, border:`1px solid ${theme.colors.border}` }}>
          <h3 className="text-lg font-semibold mb-4">Productos Recientes (API)</h3>

          {loadingProductos && <div className="text-center py-8 text-gray-500">Cargando productos...</div>}

          {errorProductos && <div className="text-red-500 text-center py-4">Error al cargar productos: {errorProductos}</div>}

          {!loadingProductos && !errorProductos && productos.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-100 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-100 uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-100 uppercase tracking-wider">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-100 uppercase tracking-wider">Stock</th>
                  </tr>
                </thead>
                <tbody className="bg-primary divide-y divide-gray-200">
                  {productos.map((producto) => (
                    <tr key={producto.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{producto.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{producto.descripcion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">${producto.precio}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{producto.stockDisponible}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loadingProductos && !errorProductos && productos.length === 0 && (
            <div className="text-center py-8 text-gray-500">{session ? 'No hay productos disponibles' : 'Inicia sesión para ver los productos'}</div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
