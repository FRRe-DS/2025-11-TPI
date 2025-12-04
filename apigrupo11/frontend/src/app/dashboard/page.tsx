'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
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
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  FaBox,
  FaChartLine,
  FaShoppingCart,
  FaWarehouse,
} from 'react-icons/fa';
import MainLayout from '../../components/layout/MainLayoutNext';
import { theme } from '../../styles/theme';
import { getProducts } from '../../services/stock.service';

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
  const [loading, setLoading] = useState(true);
  const [categoriaViewMode, setCategoriaViewMode] = useState<
    'existencias' | 'dinero'
  >('existencias');
  const [chartData, setChartData] = useState<any>({
    categoriasStock: null,
    categoriasDinero: null,
    productosPopulares: null,
    totalExistencias: 0,
    stats: { totalProductos: 0, stockBajo: 0, ventasMes: 0, almacenes: 1 },
  });

  // Check for token refresh error
  useEffect(() => {
    if ((session as any)?.error === 'RefreshAccessTokenError') {
      signOut({ callbackUrl: '/login' });
    }
  }, [session]);

  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      try {
        const token = (session as any)?.accessToken;
        let allProducts: any[] = [];
        let page = 1;
        let hasNext = true;
        const limit = 100;

        while (hasNext) {
          const resp = await getProducts(token, page, limit);
          const items = Array.isArray(resp?.data) ? resp.data : [];
          allProducts = allProducts.concat(items);
          hasNext = (resp as any)?.pagination?.hasNextPage || false;
          page += 1;
        }

        setProductos(allProducts);

        // Procesar datos para gráficos
        const totalExistencias = allProducts.reduce(
          (sum: number, p: any) => sum + (p.stockDisponible || 0),
          0
        );
        const stockBajo = allProducts.filter(
          (p: any) => (p.stockDisponible || 0) < 50
        ).length;

        // Agrupar por categoría
        const categoriaMap = new Map<string, number>();
        const categoriaDineroMap = new Map<string, number>();

        const colores = [
          '#7c3aed',
          '#10b981',
          '#a46b08ff',
          '#3b82f6',
          '#ef4444',
          '#06b6d4',
          '#ec4899',
          '#14b8a6',
          '#f97316',
          '#a855f7',
          '#d946ef',
          '#84cc16',
          '#0ea5e9',
          '#6366f1',
          '#f43f5e',
          '#a21caf',
          '#eab308',
          '#9333ea',
          '#0891b2',
          '#059669',
          '#f472b6',
          '#ca8a04',
        ];

        allProducts.forEach((p: any) => {
          const cat = p.categoria || 'Sin categoría';
          const stock = p.stockDisponible || 0;
          const precio = p.precio || 0;

          categoriaMap.set(cat, (categoriaMap.get(cat) || 0) + stock);
          categoriaDineroMap.set(
            cat,
            (categoriaDineroMap.get(cat) || 0) + stock * precio
          );
        });

        const categoriasLabels = Array.from(categoriaMap.keys());
        const categoriasDataExistencias = Array.from(categoriaMap.values());
        const categoriasDataDinero = Array.from(categoriaDineroMap.values());

        const categoriasStock = {
          labels: categoriasLabels,
          datasets: [
            {
              data: categoriasDataExistencias,
              backgroundColor: colores.slice(0, categoriasLabels.length),
              borderWidth: 0,
            },
          ],
        };

        const categoriasDinero = {
          labels: categoriasLabels,
          datasets: [
            {
              data: categoriasDataDinero.map((v: number) =>
                parseFloat(v.toFixed(2))
              ),
              backgroundColor: colores.slice(0, categoriasLabels.length),
              borderWidth: 0,
            },
          ],
        };

        // Productos con más existencias (top 5)
        const topProductos = [...allProducts]
          .sort(
            (a: any, b: any) =>
              (b.stockDisponible || 0) - (a.stockDisponible || 0)
          )
          .slice(0, 5);

        const productosPopulares = {
          labels: topProductos.map((p: any) => p.nombre || 'N/A'),
          datasets: [
            {
              label: 'Existencias',
              data: topProductos.map((p: any) => p.stockDisponible || 0),
              backgroundColor: '#7c3aed',
            },
          ],
        };

        setChartData({
          categoriasStock,
          categoriasDinero,
          productosPopulares,
          totalExistencias,
          stats: {
            totalProductos: allProducts.length,
            stockBajo,
            ventasMes: 0,
          },
        });
      } catch (err) {
        console.error('Error cargando productos:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      cargarProductos();
    }
  }, [session]);

  // ===== Datos de ejemplo para charts y stats =====
  const ventasMensuales = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ventas',
        data: [3500, 4800, 4100, 5500, 7000, 7520],
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };
  const categoriasStock =
    categoriaViewMode === 'existencias'
      ? chartData.categoriasStock || {
          labels: [],
          datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }],
        }
      : chartData.categoriasDinero || {
          labels: [],
          datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }],
        };
  const productosPopulares = chartData.productosPopulares || {
    labels: [],
    datasets: [{ label: 'Existencias', data: [], backgroundColor: '#7c3aed' }],
  };
  const totalExistencias = chartData.totalExistencias;
  const stats = chartData.stats;

  const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows.sm,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            padding: '12px',
            borderRadius: theme.borderRadius.md,
            background: color,
          }}
        >
          <Icon className="text-white text-xl" />
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
      <div style={{ display: 'block', gap: theme.spacing.lg }}>
        <div>
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 700,
              color: theme.colors.textPrimary,
            }}
          >
            Dashboard
          </h1>
          <p style={{ color: theme.colors.textSecondary }}>
            Resumen general del inventario
          </p>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: theme.spacing.xl,
              color: theme.colors.textSecondary,
            }}
          >
            Cargando datos...
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: theme.spacing.lg,
                marginBottom: theme.spacing.lg,
              }}
            >
              <StatCard
                icon={FaBox}
                title="Total Productos"
                value={stats.totalProductos}
                color={theme.colors.primary}
              />
              <StatCard
                icon={FaChartLine}
                title="Total Existencias"
                value={totalExistencias}
                color={theme.colors.primary}
              />
            </div>

            {/* Charts y productos recientes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                style={{
                  backgroundColor: theme.colors.surface,
                  padding: theme.spacing.lg,
                  borderRadius: theme.borderRadius.lg,
                  boxShadow: theme.shadows.sm,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: theme.spacing.md,
                    color: theme.colors.textPrimary,
                  }}
                >
                  Productos con más existencias
                </h3>
                <div style={{ height: '300px' }}>
                  {productosPopulares.labels.length > 0 ? (
                    <Bar
                      data={productosPopulares}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.1)' },
                          },
                          x: { grid: { display: false } },
                        },
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        color: theme.colors.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                      }}
                    >
                      Sin datos de productos
                    </div>
                  )}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: theme.colors.surface,
                  padding: theme.spacing.lg,
                  borderRadius: theme.borderRadius.lg,
                  boxShadow: theme.shadows.sm,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: theme.colors.textPrimary,
                      margin: 0,
                    }}
                  >
                    Distribución por Categorías
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setCategoriaViewMode('existencias')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: theme.borderRadius.sm,
                        border: 'none',
                        background:
                          categoriaViewMode === 'existencias'
                            ? theme.colors.primary
                            : theme.colors.border,
                        color:
                          categoriaViewMode === 'existencias'
                            ? theme.colors.textOnPrimary
                            : theme.colors.textSecondary,
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      Existencias
                    </button>
                    <button
                      onClick={() => setCategoriaViewMode('dinero')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: theme.borderRadius.sm,
                        border: 'none',
                        background:
                          categoriaViewMode === 'dinero'
                            ? theme.colors.primary
                            : theme.colors.border,
                        color:
                          categoriaViewMode === 'dinero'
                            ? theme.colors.textOnPrimary
                            : theme.colors.textSecondary,
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      Dinero Acumulado
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    height: '300px',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {categoriasStock.labels.length > 0 ? (
                    <Doughnut
                      data={categoriasStock}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } },
                      }}
                    />
                  ) : (
                    <div style={{ color: theme.colors.textSecondary }}>
                      Sin datos de categorías
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
