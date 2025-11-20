'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { theme } from '../../styles/theme';
import type { IProducto } from '../../types/api.types';
import MainLayout from '../../components/layout/MainLayoutNext';
import { AddProductForm } from '../../components/inventory/AddProductForm';
import { FilterPanel } from '../../components/inventory/FilterPanel';
import { ProductTableHeader } from '../../components/inventory/ProductTableHeader';
import { toast } from 'sonner';

export default function InventoryPage() {
  const [productos, setProductos] = useState<IProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // filtros y paginación
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const [overlayPos, setOverlayPos] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    const mockProducts: IProducto[] = [
      {
        id: 1,
        nombre: 'Laptop Pro 15',
        descripcion: 'Laptop profesional de alto rendimiento',
        precio: 1299.99,
        stockDisponible: 25,
        stockReservado: 5,
        stockTotal: 30,
        vendedorId: 1,
        categoriaId: 1,
        categoria: 'Electrónicos',
        pesoKg: 2.1,
        fechaCreacion: '2025-01-15T10:00:00Z',
        fechaActualizacion: '2025-10-20T15:30:00Z',
        imagenes: [],
      },
      {
        id: 2,
        nombre: 'Mouse Inalámbrico',
        descripcion: 'Mouse ergonómico con conectividad Bluetooth',
        precio: 45.99,
        stockDisponible: 150,
        stockReservado: 10,
        stockTotal: 160,
        vendedorId: 1,
        categoriaId: 2,
        categoria: 'Accesorios',
        pesoKg: 0.12,
        fechaCreacion: '2025-02-01T09:00:00Z',
        fechaActualizacion: '2025-10-18T11:45:00Z',
        imagenes: [],
      },
      {
        id: 3,
        nombre: 'Cable USB-C 1m',
        descripcion: 'Cable de carga y datos',
        precio: 9.99,
        stockDisponible: 320,
        stockReservado: 0,
        stockTotal: 320,
        vendedorId: 1,
        categoriaId: 2,
        categoria: 'Accesorios',
        pesoKg: 0.02,
        fechaCreacion: '2025-03-05T09:00:00Z',
        fechaActualizacion: '2025-10-10T09:45:00Z',
        imagenes: [],
      },
    ];

    setTimeout(() => {
      try {
        const raw = localStorage.getItem('local_products_v1');
        if (raw) {
          setProductos(JSON.parse(raw));
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('No se pudo leer localStorage productos', err);
      }
      setProductos(mockProducts);
      setLoading(false);
    }, 600);
  }, []);

  const categories = useMemo(() => {
    const setCat = new Set<string>();
    productos.forEach((p) => p.categoria && setCat.add(p.categoria));
    return Array.from(setCat);
  }, [productos]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return productos.filter((p) => {
      if (category && p.categoria !== category) return false;
      if (!q) return true;
      return (
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        (p.categoria || '').toLowerCase().includes(q)
      );
    });
  }, [productos, search, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const persistProducts = (next: IProducto[]) => {
    try {
      localStorage.setItem('local_products_v1', JSON.stringify(next));
    } catch (err) {
      console.warn('Error guardando productos en localStorage', err);
    }
  };

  const handleAddProduct = (product: IProducto) => {
    setProductos((prev) => {
      const next = [product, ...prev];
      persistProducts(next);
      return next;
    });
    setShowAddForm(false);
    toast.success(`Producto "${product.nombre}" agregado`);
  };

  const handleDeleteProduct = (id: number) => {
    setProductos((prev) => {
      const next = prev.filter((p) => p.id !== id);
      persistProducts(next);
      return next;
    });
    toast.success('Producto eliminado');
  };

  return (
    <MainLayout>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: theme.spacing.lg }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: theme.colors.textPrimary }}>Inventario</h1>
              <p style={{ color: theme.colors.textSecondary }}>Gestión de productos y stock</p>
            </div>

            <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
              <button
                ref={buttonRef}
                onClick={() => {
                  setShowFilters((s) => {
                    const next = !s;
                    if (next && buttonRef.current) {
                      const r = buttonRef.current.getBoundingClientRect();
                      const overlayWidth = 340;
                      const margin = 8;
                      const viewportW = window.innerWidth || document.documentElement.clientWidth;
                      let left = Math.round(r.left);
                      // clamp so overlay stays within viewport
                      left = Math.min(Math.max(left, margin), Math.max(viewportW - overlayWidth - margin, margin));
                      setOverlayPos({ left, top: Math.round(r.bottom + 8) });
                    }
                    return next;
                  });
                }}
                style={{
                  background: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  padding: '8px 12px',
                  borderRadius: theme.borderRadius.md,
                  cursor: 'pointer',
                  color: theme.colors.textPrimary,
                }}
              >
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              </button>

              <input
                placeholder='Buscar producto, descripción o categoría...'
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{ padding: '8px 12px', borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}
              />

              <select
                value={category ?? ''}
                onChange={(e) => {
                  setCategory(e.target.value || null);
                  setPage(1);
                }}
                style={{ padding: '8px 12px', borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}
              >
                <option value=''>Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                style={{ padding: '8px 12px', borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <button
                onClick={() => setShowAddForm(true)}
                style={{ background: theme.colors.primary, color: theme.colors.textOnPrimary, padding: '8px 16px', borderRadius: theme.borderRadius.md, border: 'none' }}
              >
                Agregar Producto
              </button>
            </div>
          </div>
          {/* Overlay de filtros: aparece por encima del listado cuando showFilters=true */}
          {showFilters && overlayPos && (
            <div style={{ position: 'fixed', top: overlayPos.top, left: overlayPos.left, zIndex: 1200 }}>
              <div style={{ width: 340, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 12px 40px rgba(2,6,23,0.6)', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}>
                <div style={{ padding: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowFilters(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.colors.textSecondary }}>Cerrar ✕</button>
                </div>
                <div style={{ padding: theme.spacing.lg }}>
                  <FilterPanel />
                </div>
              </div>
            </div>
          )}

          <div style={{ backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.sm, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', color: theme.colors.textSecondary }}>Cargando productos...</div>
            ) : (
              <div>
                <ProductTableHeader />
                <div>
                  {paginated.map((producto) => (
                    <div key={producto.id} style={{ borderBottom: `1px solid ${theme.colors.border}`, padding: theme.spacing.md, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.textPrimary }}>{producto.nombre}</div>
                        <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>{producto.descripcion}</div>
                      </div>
                      <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
                        <div style={{ color: theme.colors.textSecondary }}>{producto.categoria}</div>
                        <div>
                          <strong>{producto.stockDisponible}</strong> uds
                        </div>
                        <div style={{ color: theme.colors.textSecondary }}>${producto.precio.toFixed(2)}</div>
                        <div>
                          <button
                            onClick={() => toast(`Editar ${producto.nombre} (pendiente)`)}
                            style={{ color: theme.colors.primary, marginRight: '12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(producto.id)}
                            style={{ color: theme.colors.danger, background: 'transparent', border: 'none', cursor: 'pointer' }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación simple */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md }}>
                  <div style={{ color: theme.colors.textSecondary }}>
                    Mostrando {Math.min((page - 1) * pageSize + 1, filtered.length)} - {Math.min(page * pageSize, filtered.length)} de {filtered.length}
                  </div>

                  <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      style={{ padding: '6px 10px', borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}
                    >
                      Anterior
                    </button>
                    <div style={{ color: theme.colors.textSecondary }}>Página {page} / {totalPages}</div>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      style={{ padding: '6px 10px', borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal para agregar producto */}
          {showAddForm && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
              <div style={{ background: theme.colors.surface, borderRadius: theme.borderRadius.lg, maxWidth: '64rem', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: `1px solid ${theme.colors.border}` }}>
                <div style={{ padding: '16px', borderBottom: `1px solid ${theme.colors.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: theme.colors.textPrimary }}>Agregar Nuevo Producto</h2>
                    <button onClick={() => setShowAddForm(false)} style={{ color: theme.colors.textSecondary, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <AddProductForm
                  onClose={() => setShowAddForm(false)}
                  onAdd={(p) => {
                    handleAddProduct(p);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
