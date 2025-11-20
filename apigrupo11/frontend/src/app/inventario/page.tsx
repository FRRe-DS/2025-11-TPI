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
    const fetchProductos = async () => {
      try {
        const res = await fetch("https://localhost:3000/api/producto", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store"
        });

        if (!res.ok) throw new Error("Error al obtener productos");

        const data: IProducto[] = await res.json();
        setProductos(data);
      } catch (error) {
        console.error("Error:", error);
        toast.error("No se pudo cargar el inventario");
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
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


  /*Crea un producto*/
  const handleAddProduct = async (product: IProducto) => {
    try {
      const res = await fetch("https://localhost:3000/api/producto", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(product)
      });

      if (!res.ok) throw new Error("Error al crear producto");

      const saved = await res.json();

      setProductos((prev) => [saved, ...prev]);
      toast.success(`Producto "${saved.nombre}" agregado`);
    } catch (error) {
      console.error(error);
      toast.error("Error al agregar producto");
    }

    setShowAddForm(false);
  };

  /*Elimina un producto*/
  const handleDeleteProduct = async (id: number) => {
    try {
      const res = await fetch(`https://localhost:3000/api/producto/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Error al eliminar producto");

      setProductos(prev => prev.filter(p => p.id !== id));
      toast.success("Producto eliminado");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar el producto");
    }
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
