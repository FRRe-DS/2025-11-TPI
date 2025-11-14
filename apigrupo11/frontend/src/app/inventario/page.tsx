'use client';

import React, { useEffect, useState } from 'react';
import { theme } from '../../styles/theme';
import type { IProducto } from '../../types/api.types';
import MainLayout from '../../components/layout/MainLayoutNext';
import { AddProductForm } from '../../components/inventory/AddProductForm';

export default function InventoryPage() {
  const [productos, setProductos] = useState<IProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Datos de ejemplo para mostrar la página
    const mockProducts: IProducto[] = [
      {
        id: 1,
        nombre: "Laptop Pro 15",
        descripcion: "Laptop profesional de alto rendimiento",
        precio: 1299.99,
        stockDisponible: 25,
        stockReservado: 5,
        stockTotal: 30,
        vendedorId: 1,
        categoriaId: 1,
        categoria: "Electrónicos",
        pesoKg: 2.1,
        fechaCreacion: "2025-01-15T10:00:00Z",
        fechaActualizacion: "2025-10-20T15:30:00Z",
        imagenes: []
      },
      {
        id: 2,
        nombre: "Mouse Inalámbrico",
        descripcion: "Mouse ergonómico con conectividad Bluetooth",
        precio: 45.99,
        stockDisponible: 150,
        stockReservado: 10,
        stockTotal: 160,
        vendedorId: 1,
        categoriaId: 1,
        categoria: "Accesorios",
        pesoKg: 0.12,
        fechaCreacion: "2025-02-01T09:00:00Z",
        fechaActualizacion: "2025-10-18T11:45:00Z",
        imagenes: []
      }
    ];
    
    setTimeout(() => {
      // Intentamos cargar desde localStorage
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
    }, 1000);
  }, []);

  const handleAddProduct = (product: IProducto) => {
    setProductos((prev) => {
      const next = [product, ...prev];
      try {
        localStorage.setItem('local_products_v1', JSON.stringify(next));
      } catch (err) {
        console.warn('Error guardando productos en localStorage', err);
      }
      return next;
    });
    setShowAddForm(false);
  };

  // También creamos una notificación local cuando se agrega un producto
  const addProductNotification = (product: IProducto) => {
    try {
      const raw = localStorage.getItem('local_notifications_v1');
      const arr = raw ? JSON.parse(raw) : [];
      const note = {
        id: Date.now(),
        text: `Producto "${product.nombre}" agregado.`,
        read: false,
        date: new Date().toISOString(),
      };
      const next = [note, ...arr];
      localStorage.setItem('local_notifications_v1', JSON.stringify(next));
      // notificamos al header para que recargue
      try {
        window.dispatchEvent(new Event('notificationsUpdated'));
      } catch (e) {
        /* ignore */
      }
    } catch (err) {
      console.warn('No se pudo guardar notificación', err);
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
                      <td style={{ padding: '12px', fontSize: '14px', color: theme.colors.textPrimary }}>${producto.precio.toFixed(2)}</td>
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
                  addProductNotification(p);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
