'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { theme } from '../../styles/theme';
import type { IProducto, ICategoria } from '../../types/api.types';
import MainLayout from '../../components/layout/MainLayoutNext';
import { AddProductForm } from '../../components/inventory/AddProductForm';
import {
  getProducts,
  listCategories,
  deleteProduct,
} from '../../services/stock.service';
import {
  MdFilterList,
  MdAttachMoney,
  MdInventory2,
  MdCategory,
} from 'react-icons/md';

// Solución para usar react-icons sin errores de tipo
const FilterIcon = MdFilterList as any as React.FC<{ size?: number }>;
const MoneyIcon = MdAttachMoney as any as React.FC<{ size?: number }>;
const InventoryIcon = MdInventory2 as any as React.FC<{ size?: number }>;
const CategoryIcon = MdCategory as any as React.FC<{ size?: number }>;

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const [productos, setProductos] = useState<IProducto[]>([]);
  const [categories, setCategories] = useState<ICategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProducto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,
    minStock: 0,
    maxStock: 10000,
    categoria: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,
    minStock: 0,
    maxStock: 10000,
    categoria: '',
  });

  useEffect(() => {
    const loadAllProducts = async () => {
      const token = (session as any)?.accessToken;

      // Skip fetch if no token and not in a "skipAuth" environment, or if session is still loading
      const skipAuth =
        typeof window !== 'undefined' &&
        ['localhost', '127.0.0.1', '0.0.0.0'].includes(
          window.location.hostname
        );

      // Si se requiere autenticación en el backend y no tenemos token, no intentamos el fetch
      // para evitar el error 401 en la consola.
      if (!token && !skipAuth) {
        // Opcional: Podrías redirigir al login aquí o simplemente no cargar nada
        setLoading(false);
        return;
      }

      setLoading(true);

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
        // Si falla la carga (ej. 401), dejamos la lista vacía o manejamos el error visualmente
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'loading') return; // Wait for session to load

    loadAllProducts();
  }, [session, status]);

  const handleAddProduct = (product: IProducto) => {
    setProductos((prev) => [product, ...prev]);
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleUpdateProduct = (updatedProduct: IProducto) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleEditClick = (product: IProducto) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);
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
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN',
    });

    const productIdToDelete = deleteTarget.id;

    // Construir URL base - usar puerto 3000 del backend
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/productos/${productIdToDelete}`;

    console.log('[Inventario] DELETE a:', url);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
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
      setDeleteError(
        `Error al eliminar el producto: ${err?.message || 'Error desconocido'}`
      );
      setDeleting(false);
      // NO cerrar el modal para que el usuario vea el error
    }
  };

  // Filtrar productos por búsqueda y filtros avanzados
  const filteredProductos = productos.filter((producto) => {
    const matchesSearch = producto.nombre
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPrice =
      producto.precio >= appliedFilters.minPrice &&
      producto.precio <= appliedFilters.maxPrice;
    const matchesStock =
      producto.stockDisponible >= appliedFilters.minStock &&
      producto.stockDisponible <= appliedFilters.maxStock;
    const matchesCategory =
      appliedFilters.categoria === '' ||
      producto.categoria === appliedFilters.categoria;

    return matchesSearch && matchesPrice && matchesStock && matchesCategory;
  });

  const handleResetFilters = () => {
    const defaultFilters = {
      minPrice: 0,
      maxPrice: 10000,
      minStock: 0,
      maxStock: 10000,
      categoria: '',
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  return (
    <MainLayout>
      <div style={{ display: 'block', gap: theme.spacing.lg }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.875rem',
                fontWeight: 700,
                color: theme.colors.textPrimary,
              }}
            >
              Inventario
            </h1>
            <p style={{ color: theme.colors.textSecondary }}>
              Gestión de productos y stock
            </p>
          </div>
          <div style={{ display: 'flex', gap: theme.spacing.md }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: showFilters
                  ? theme.colors.primary
                  : theme.colors.border,
                color: showFilters
                  ? theme.colors.textOnPrimary
                  : theme.colors.textSecondary,
                padding: '8px 16px',
                borderRadius: theme.borderRadius.md,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FilterIcon size={18} />
              Filtros
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowAddForm(true);
              }}
              style={{
                background: theme.colors.primary,
                color: theme.colors.textOnPrimary,
                padding: '8px 16px',
                borderRadius: theme.borderRadius.md,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Agregar Producto
            </button>
          </div>
        </div>

        {/* Mensaje informativo cuando backend no está disponible */}
        {productos.length > 0 &&
          productos[0]?.id === 1 &&
          productos[0]?.nombre === 'Laptop HP' && (
            <div
              style={{
                backgroundColor: '#3498db20',
                border: '1px solid #3498db',
                borderRadius: theme.borderRadius.md,
                padding: '12px 16px',
                marginTop: theme.spacing.md,
                color: '#3498db',
                fontSize: '14px',
              }}
            >
              ℹ️ Mostrando datos de ejemplo (backend no disponible). Para ver
              datos reales, inicia el backend en puerto 3000.
            </div>
          )}

        {/* Panel de Filtros */}
        {showFilters && (
          <div
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.md,
              border: `1px solid ${theme.colors.border}`,
              padding: 'clamp(16px, 4%, 24px)',
              marginBottom: theme.spacing.lg,
              marginTop: theme.spacing.lg,
            }}
          >
            {/* Título del panel */}
            <div style={{ marginBottom: '20px' }}>
              <h3
                style={{
                  fontSize: 'clamp(14px, 5vw, 16px)',
                  fontWeight: 700,
                  color: theme.colors.textPrimary,
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FilterIcon size={20} />
                Filtrar productos
              </h3>
              <p
                style={{
                  fontSize: 'clamp(12px, 3vw, 13px)',
                  color: theme.colors.textSecondary,
                  margin: '4px 0 0 0',
                }}
              >
                Ajusta los filtros y presiona Aplicar
              </p>
            </div>

            {/* Grid de filtros - responsive */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'clamp(16px, 3%, 24px)',
                marginBottom: '24px',
              }}
            >
              {/* Rango de Precio */}
              <div>
                <label
                  style={{
                    color: theme.colors.textPrimary,
                    fontSize: 'clamp(12px, 4vw, 14px)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                  }}
                >
                  <MoneyIcon size={18} />
                  Rango de Precio
                </label>
                <p
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: 'clamp(11px, 3vw, 12px)',
                    margin: '0 0 8px 0',
                  }}
                >
                  ${filters.minPrice} - ${filters.maxPrice}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: 'clamp(8px, 2%, 12px)',
                    flexWrap: 'wrap',
                  }}
                >
                  <input
                    type="number"
                    placeholder="$0"
                    step="1"
                    value={filters.minPrice || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minPrice:
                          e.target.value === '' ? 0 : Number(e.target.value),
                      })
                    }
                    style={{
                      flex: 1,
                      minWidth: '80px',
                      padding: 'clamp(8px, 2%, 12px) clamp(10px, 2%, 14px)',
                      borderRadius: theme.borderRadius.sm,
                      border: `2px solid ${theme.colors.border}`,
                      backgroundColor: theme.colors.darkBgSecondary,
                      color: theme.colors.textPrimary,
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      (e.target as any).style.borderColor =
                        theme.colors.primary;
                      (
                        e.target as any
                      ).style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`;
                    }}
                    onBlur={(e) => {
                      (e.target as any).style.borderColor = theme.colors.border;
                      (e.target as any).style.boxShadow = 'none';
                    }}
                  />
                  <input
                    type="number"
                    placeholder="$10000"
                    step="1"
                    value={filters.maxPrice || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        maxPrice:
                          e.target.value === ''
                            ? 10000
                            : Number(e.target.value),
                      })
                    }
                    style={{
                      flex: 1,
                      minWidth: '80px',
                      padding: 'clamp(8px, 2%, 12px) clamp(10px, 2%, 14px)',
                      borderRadius: theme.borderRadius.sm,
                      border: `2px solid ${theme.colors.border}`,
                      backgroundColor: theme.colors.darkBgSecondary,
                      color: theme.colors.textPrimary,
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      (e.target as any).style.borderColor =
                        theme.colors.primary;
                      (
                        e.target as any
                      ).style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`;
                    }}
                    onBlur={(e) => {
                      (e.target as any).style.borderColor = theme.colors.border;
                      (e.target as any).style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Rango de Cantidad */}
              <div>
                <label
                  style={{
                    color: theme.colors.textPrimary,
                    fontSize: 'clamp(12px, 4vw, 14px)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                  }}
                >
                  <InventoryIcon size={18} />
                  Rango de Cantidad
                </label>
                <p
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: 'clamp(11px, 3vw, 12px)',
                    margin: '0 0 8px 0',
                  }}
                >
                  {filters.minStock} - {filters.maxStock} unidades
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: 'clamp(8px, 2%, 12px)',
                    flexWrap: 'wrap',
                  }}
                >
                  <input
                    type="number"
                    placeholder="0"
                    step="1"
                    value={filters.minStock || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minStock:
                          e.target.value === '' ? 0 : Number(e.target.value),
                      })
                    }
                    style={{
                      flex: 1,
                      minWidth: '80px',
                      padding: 'clamp(8px, 2%, 12px) clamp(10px, 2%, 14px)',
                      borderRadius: theme.borderRadius.sm,
                      border: `2px solid ${theme.colors.border}`,
                      backgroundColor: theme.colors.darkBgSecondary,
                      color: theme.colors.textPrimary,
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      (e.target as any).style.borderColor =
                        theme.colors.primary;
                      (
                        e.target as any
                      ).style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`;
                    }}
                    onBlur={(e) => {
                      (e.target as any).style.borderColor = theme.colors.border;
                      (e.target as any).style.boxShadow = 'none';
                    }}
                  />
                  <input
                    type="number"
                    placeholder="10000"
                    step="1"
                    value={filters.maxStock || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        maxStock:
                          e.target.value === ''
                            ? 10000
                            : Number(e.target.value),
                      })
                    }
                    style={{
                      flex: 1,
                      minWidth: '80px',
                      padding: 'clamp(8px, 2%, 12px) clamp(10px, 2%, 14px)',
                      borderRadius: theme.borderRadius.sm,
                      border: `2px solid ${theme.colors.border}`,
                      backgroundColor: theme.colors.darkBgSecondary,
                      color: theme.colors.textPrimary,
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      (e.target as any).style.borderColor =
                        theme.colors.primary;
                      (
                        e.target as any
                      ).style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`;
                    }}
                    onBlur={(e) => {
                      (e.target as any).style.borderColor = theme.colors.border;
                      (e.target as any).style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label
                  style={{
                    color: theme.colors.textPrimary,
                    fontSize: 'clamp(12px, 4vw, 14px)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                  }}
                >
                  <CategoryIcon size={18} />
                  Categoría
                </label>
                <p
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: 'clamp(11px, 3vw, 12px)',
                    margin: '0 0 8px 0',
                  }}
                >
                  {filters.categoria || 'Todas las categorías'}
                </p>
                <select
                  value={filters.categoria}
                  onChange={(e) =>
                    setFilters({ ...filters, categoria: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: 'clamp(8px, 2%, 12px) clamp(10px, 2%, 14px)',
                    borderRadius: theme.borderRadius.sm,
                    border: `2px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.darkBgSecondary,
                    color: theme.colors.textPrimary,
                    fontSize: 'clamp(12px, 3vw, 14px)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    (e.target as any).style.borderColor = theme.colors.primary;
                    (
                      e.target as any
                    ).style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`;
                  }}
                  onBlur={(e) => {
                    (e.target as any).style.borderColor = theme.colors.border;
                    (e.target as any).style.boxShadow = 'none';
                  }}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botones de acción */}
            <div
              style={{
                display: 'flex',
                gap: 'clamp(8px, 2%, 12px)',
                paddingTop: '20px',
                borderTop: `1px solid ${theme.colors.border}`,
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={handleApplyFilters}
                style={{
                  padding: 'clamp(8px, 2%, 12px) clamp(16px, 4%, 28px)',
                  background: theme.colors.primary,
                  color: theme.colors.textOnPrimary,
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  cursor: 'pointer',
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  boxShadow: `0 4px 12px ${theme.colors.primary}40`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => {
                  (e.target as any).style.transform = 'translateY(-2px)';
                  (
                    e.target as any
                  ).style.boxShadow = `0 6px 16px ${theme.colors.primary}60`;
                }}
                onMouseLeave={(e) => {
                  (e.target as any).style.transform = 'translateY(0)';
                  (
                    e.target as any
                  ).style.boxShadow = `0 4px 12px ${theme.colors.primary}40`;
                }}
              >
                ✓ Aplicar Filtros
              </button>
              <button
                onClick={handleResetFilters}
                style={{
                  padding: 'clamp(8px, 2%, 12px) clamp(16px, 4%, 28px)',
                  background: 'transparent',
                  border: `2px solid ${theme.colors.border}`,
                  color: theme.colors.textSecondary,
                  borderRadius: theme.borderRadius.md,
                  cursor: 'pointer',
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => {
                  (e.target as any).style.borderColor = theme.colors.primary;
                  (e.target as any).style.color = theme.colors.primary;
                }}
                onMouseLeave={(e) => {
                  (e.target as any).style.borderColor = theme.colors.border;
                  (e.target as any).style.color = theme.colors.textSecondary;
                }}
              >
                ↻ Limpiar
              </button>
            </div>
          </div>
        )}

        {/* Campo de búsqueda */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: theme.spacing.lg,
            marginTop: theme.spacing.lg,
          }}
        >
          <input
            type="text"
            placeholder="Buscar producto por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: theme.borderRadius.md,
              border: `2px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.darkBgSecondary,
              color: theme.colors.textPrimary,
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              (e.target as any).style.borderColor = theme.colors.primary;
              (
                e.target as any
              ).style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`;
            }}
            onBlur={(e) => {
              (e.target as any).style.borderColor = theme.colors.border;
              (e.target as any).style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Tabla de productos */}
        <div
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.shadows.sm,
            border: `1px solid ${theme.colors.border}`,
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px',
                color: theme.colors.textSecondary,
              }}
            >
              Cargando productos...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  color: theme.colors.textPrimary,
                }}
              >
                <thead
                  style={{ backgroundColor: theme.colors.darkBgSecondary }}
                >
                  <tr>
                    <th
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: theme.colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Producto
                    </th>
                    <th
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: theme.colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Categoría
                    </th>
                    <th
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: theme.colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Stock
                    </th>
                    <th
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: theme.colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Precio
                    </th>
                    <th
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: theme.colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProductos.map((producto) => (
                    <tr
                      key={producto.id}
                      style={{
                        borderBottom: `1px solid ${theme.colors.border}`,
                      }}
                    >
                      <td style={{ padding: '12px' }}>
                        <div>
                          <div
                            style={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: theme.colors.textPrimary,
                            }}
                          >
                            {producto.nombre}
                          </div>
                          <div
                            style={{
                              fontSize: '13px',
                              color: theme.colors.textSecondary,
                            }}
                          >
                            {producto.descripcion}
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: theme.colors.textPrimary,
                        }}
                      >
                        {producto.categoria}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div
                          style={{
                            fontSize: '14px',
                            color: theme.colors.textPrimary,
                          }}
                        >
                          <div>Disponible: {producto.stockDisponible}</div>
                          <div style={{ color: theme.colors.textSecondary }}>
                            Reservado: {producto.stockReservado}
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: theme.colors.textPrimary,
                        }}
                      >
                        ${Number(producto.precio).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        <button
                          onClick={() => handleEditClick(producto)}
                          style={{
                            color: theme.colors.primary,
                            marginRight: '12px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() =>
                            initiateDelete(producto.id, producto.nombre)
                          }
                          style={{
                            color: theme.colors.danger,
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal para agregar/editar producto */}
        {showAddForm && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '16px',
            }}
          >
            <div
              style={{
                background: theme.colors.surface,
                borderRadius: theme.borderRadius.lg,
                maxWidth: '64rem',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div
                style={{
                  padding: '16px',
                  borderBottom: `1px solid ${theme.colors.border}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <h2
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    {editingProduct
                      ? 'Editar Producto'
                      : 'Agregar Nuevo Producto'}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    style={{
                      color: theme.colors.textSecondary,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <svg
                      style={{ width: '20px', height: '20px' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <AddProductForm
                onClose={handleCloseForm}
                onAdd={handleAddProduct}
                onUpdate={handleUpdateProduct}
                token={(session as any)?.accessToken}
                categories={categories}
                mode={editingProduct ? 'edit' : 'create'}
                product={editingProduct}
              />
            </div>
          </div>
        )}

        {/* Confirmación de eliminación */}
        {deleteTarget && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 60,
              padding: '16px',
            }}
          >
            <div
              style={{
                background: theme.colors.surface,
                borderRadius: theme.borderRadius.lg,
                maxWidth: '36rem',
                width: '100%',
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div
                style={{
                  padding: '16px',
                  borderBottom: `1px solid ${theme.colors.border}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    Confirmar eliminación
                  </h3>
                  <button
                    onClick={() => setDeleteTarget(null)}
                    style={{
                      color: theme.colors.textSecondary,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                <p style={{ color: theme.colors.textSecondary }}>
                  ¿Estás seguro que deseas eliminar el producto{' '}
                  <strong>{deleteTarget.nombre}</strong>? Esta acción no se
                  puede deshacer.
                </p>
                {deleteError && (
                  <div
                    style={{
                      marginTop: theme.spacing.md,
                      color: theme.colors.danger,
                    }}
                  >
                    {deleteError}
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: theme.spacing.md,
                    marginTop: theme.spacing.lg,
                  }}
                >
                  <button
                    onClick={() => setDeleteTarget(null)}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${theme.colors.border}`,
                      padding: '8px 12px',
                      borderRadius: theme.borderRadius.md,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    style={{
                      background: theme.colors.danger,
                      color: theme.colors.textOnPrimary,
                      padding: '8px 12px',
                      borderRadius: theme.borderRadius.md,
                      border: 'none',
                    }}
                  >
                    {deleting ? 'Eliminando…' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
