'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { theme } from '../../styles/theme';
import type { IProducto, ICategoria } from '../../types/api.types';
import MainLayout from '../../components/layout/MainLayoutNext';
import { AddProductForm } from '../../components/inventory/AddProductForm';
import { getProducts } from '../../services/stock.service';
import { listCategories } from '../../services/stock.service';

export default function InventoryPage() {
  const { data: session } = useSession();
  const [productos, setProductos] = useState<IProducto[]>([]);
  const [categories, setCategories] = useState<ICategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

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

    if (session) {
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
            style={{ background: theme.colors.primary, color: theme.colors.textOnPrimary, padding: '8px 16px', borderRadius: theme.borderRadius.md, border: 'none' }}
          >
            Agregar Producto
          </button>
        </div>

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
                        <button style={{ color: theme.colors.primary, marginRight: '12px', background: 'transparent', border: 'none', cursor: 'pointer' }}>Editar</button>
                        <button style={{ color: theme.colors.danger, background: 'transparent', border: 'none', cursor: 'pointer' }}>Eliminar</button>
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
      </div>
    </MainLayout>
  );
}
