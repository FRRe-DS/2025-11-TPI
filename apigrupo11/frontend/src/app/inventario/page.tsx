'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { theme } from '../../styles/theme';
import type { IProducto, ICategoria } from '../../types/api.types';
import MainLayout from '../../components/layout/MainLayoutNext';
import { AddProductForm } from '../../components/inventory/AddProductForm';
import { getProducts, listCategories, deleteProduct } from '../../services/stock.service';

export default function InventoryPage() {
  const { data: session } = useSession();
  const [productos, setProductos] = useState<IProducto[]>([]);
  const [categories, setCategories] = useState<ICategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<IProducto | null>(null);


  useEffect(() => {
    const loadAllProducts = async () => {
      setLoading(true);
      const token = (session as any)?.accessToken;

      try {
        let page = 1;
        const limit = 50; // tamaño de página razonable
        let all: IProducto[] = [];
        let hasNext = true;

        while (hasNext) {
          const resp = await getProducts(token, page, limit);
          const items = Array.isArray(resp?.data) ? resp.data : [];
          all = all.concat(items);
          const nextUrl = (resp as any)?.pagination?.next;
          if (nextUrl) {
            page += 1;
          } else {
            hasNext = false;
          }
        }

        setProductos(all);
        // Cargar categorías para el formulario
        try {
          const cats = await listCategories(token);
          setCategories(cats);
        } catch (err) {
          console.warn('No se pudieron cargar las categorías:', err);
          setCategories([]);
        }
      } catch (err) {
        console.error('Error cargando productos desde API (paginación):', err);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };

    const skipAuth = typeof window !== 'undefined' && (['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname));
    if (session || skipAuth) {
      loadAllProducts();
    } else {
      setLoading(false);
      setProductos([]);
    }
  }, [session]);

  const handleAddProduct = (product: IProducto) => {
    setProductos((prev) => [product, ...prev]);
    setShowAddForm(false);
  };

  const initiateDelete = (id: number, nombre: string) => {
    setDeleteError(null);
    setDeleteTarget({ id, nombre });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const token = (session as any)?.accessToken;
    
    console.log('[Inventario] Intento de eliminación:', { 
      productId: deleteTarget.id, 
      hasSession: !!session, 
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN'
    });
    
    const productIdToDelete = deleteTarget.id;
    
    // Construir URL base - usar puerto 3000 del backend
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/productos/${productIdToDelete}`;
    
    console.log('[Inventario] DELETE a:', url);
    
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers,
      });
      
      console.log('[Inventario] Respuesta DELETE:', res.status, res.statusText);
      
      // 200, 204 y 404 se consideran éxito (el producto ya no existe)
      if (!res.ok && res.status !== 204 && res.status !== 404) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      
      console.log('[Inventario] Producto eliminado del backend correctamente');
      
      // Solo eliminar del frontend si el backend respondió exitosamente
      setProductos((prev) => prev.filter((p) => p.id !== productIdToDelete));
      setDeleteTarget(null);
      setDeleting(false);
    } catch (err: any) {
      console.error('[Inventario] Error al eliminar del backend:', err);
      setDeleteError(`Error al eliminar el producto: ${err?.message || 'Error desconocido'}`);
      setDeleting(false);
      // NO cerrar el modal para que el usuario vea el error
    }
  };

  return (
    <MainLayout>
      <div style={{ display: 'block', gap: theme.spacing.lg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: theme.colors.textPrimary }}>Inventario</h1>
            <p style={{ color: theme.colors.textSecondary }}>Gestión de productos y stock</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            style={{ background: theme.colors.primary, color: theme.colors.textOnPrimary, padding: '8px 16px', borderRadius: theme.borderRadius.md, border: 'none', cursor: 'pointer' }}
          >
            Agregar Producto
          </button>
        </div>

        {/* Mensaje informativo cuando backend no está disponible */}
        {productos.length > 0 && productos[0]?.id === 1 && productos[0]?.nombre === 'Laptop HP' && (
          <div style={{ 
            backgroundColor: '#3498db20', 
            border: '1px solid #3498db', 
            borderRadius: theme.borderRadius.md, 
            padding: '12px 16px',
            marginTop: theme.spacing.md,
            color: '#3498db',
            fontSize: '14px',
          }}>
            ℹ️ Mostrando datos de ejemplo (backend no disponible). Para ver datos reales, inicia el backend en puerto 3000.
          </div>
        )}

        {/* Tabla de productos */}
        <div style={{ backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.sm, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', color: theme.colors.textSecondary }}>Cargando productos...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: theme.colors.textPrimary }}>
                <thead style={{ backgroundColor: theme.colors.darkBgSecondary }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Producto</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Categoría</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Precio</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.id} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.textPrimary }}>{producto.nombre}</div>
                          <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>{producto.descripcion}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: theme.colors.textPrimary }}>{producto.categoria}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontSize: '14px', color: theme.colors.textPrimary }}>
                          <div>Disponible: {producto.stockDisponible}</div>
                          <div style={{ color: theme.colors.textSecondary }}>Reservado: {producto.stockReservado}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: theme.colors.textPrimary }}>${Number(producto.precio).toFixed(2)}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        <button onClick={() => setEditTarget(producto)} style={{ color: theme.colors.primary, marginRight: '12px', background: 'transparent', border: 'none', cursor: 'pointer' }}>Editar</button>
                        <button onClick={() => initiateDelete(producto.id, producto.nombre)} style={{ color: theme.colors.danger, background: 'transparent', border: 'none', cursor: 'pointer' }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                token={(session as any)?.accessToken}
                categories={categories}
              />
            </div>
          </div>
        )}
        {/*Modal para Editar producto */}
        {editTarget && (
          <div style={{ position: 'fixed',inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px'}}>
            <div style={{ background: theme.colors.surface, borderRadius: theme.borderRadius.lg, maxWidth: '64rem', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: `1px solid ${theme.colors.border}`}}>
              <div style={{ padding: '16px', borderBottom: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: theme.colors.textPrimary }}>Editar Producto</h2>
                  <button
                    onClick={() => setEditTarget(null)} style={{color: theme.colors.textSecondary, background: 'transparent',border: 'none', cursor: 'pointer' }} >
                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <AddProductForm
                mode="edit"
                product={editTarget}
                token={(session as any)?.accessToken}
                categories={categories}
                onClose={() => setEditTarget(null)}
                onUpdate={(updatedProduct) => {
                  setProductos((prev) =>
                    prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
                  );
                  setEditTarget(null);
                }}
              />
            </div>
          </div>
        )}


        {/* Confirmación de eliminación */}
        {deleteTarget && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '16px' }}>
            <div style={{ background: theme.colors.surface, borderRadius: theme.borderRadius.lg, maxWidth: '36rem', width: '100%', border: `1px solid ${theme.colors.border}` }}>
              <div style={{ padding: '16px', borderBottom: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: theme.colors.textPrimary }}>Confirmar eliminación</h3>
                  <button onClick={() => setDeleteTarget(null)} style={{ color: theme.colors.textSecondary, background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                <p style={{ color: theme.colors.textSecondary }}>¿Estás seguro que deseas eliminar el producto <strong>{deleteTarget.nombre}</strong>? Esta acción no se puede deshacer.</p>
                {deleteError && <div style={{ marginTop: theme.spacing.md, color: theme.colors.danger }}>{deleteError}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
                  <button onClick={() => setDeleteTarget(null)} style={{ background: 'transparent', border: `1px solid ${theme.colors.border}`, padding: '8px 12px', borderRadius: theme.borderRadius.md, color: theme.colors.textSecondary }}>Cancelar</button>
                  <button onClick={confirmDelete} disabled={deleting} style={{ background: theme.colors.danger, color: theme.colors.textOnPrimary, padding: '8px 12px', borderRadius: theme.borderRadius.md, border: 'none' }}>{deleting ? 'Eliminando…' : 'Eliminar'}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
