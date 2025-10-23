'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import type { IProducto } from '../types/api.types';
import { getProducts } from '../services/stock.service';
import { SectionHeader } from '../components/layout/SectionHeader';
import { FilterPanel } from '../components/inventory/FilterPanel';
import { ProductTableHeader } from '../components/inventory/ProductTableHeader';
import { ProductTableRow } from '../components/inventory/ProductTableRow';
import { theme } from '../styles/theme';
import { Modal } from '../components/ui/Modal';
import { Sidebar } from '../components/ui/Sidebar';
// --- (INICIO) MODIFICACIÓN ---
// 1. Importamos el formulario que creamos
import { AddProductForm } from '../components/inventory/AddProductForm';
// --- (FIN) MODIFICACIÓN ---

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  tableContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.xl,
    marginTop: 0,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.border}`,
    overflow: 'hidden',
    minHeight: '600px',
  },
  tableContent: {
    flex: 1,
    overflowY: 'auto',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.h3,
    fontWeight: '500',
  },
};

export const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<IProducto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      const response = await getProducts();
      setProducts(response.data);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  // --- (INICIO) MODIFICACIÓN ---
  // Creamos una función explícita para cerrar el modal de añadir
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    // Opcional: Aquí podrías añadir lógica para recargar la tabla si se añadió un producto
    // loadProducts();
  };
  // --- (FIN) MODIFICACIÓN ---

  return (
    <div style={styles.container}>
      <SectionHeader
        title="Inventario"
        onFilterClick={() => setIsFilterModalOpen(true)}
        onAddClick={() => setIsAddModalOpen(true)} // Esto abre el modal
      />

      <div style={styles.tableContainer}>
        {isLoading ? (
          <div style={styles.loading}>Cargando inventario...</div>
        ) : (
          <>
            <ProductTableHeader />
            <div style={styles.tableContent}>
              {products.map((product) => (
                <ProductTableRow key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- Modal de Filtros (Sin cambios) --- */}
      <Sidebar
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      >
        <FilterPanel />
      </Sidebar>

      {/* --- (INICIO) MODIFICACIÓN --- */}
      {/* 2. Modificamos el Modal de Añadir Producto */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal} // Usamos la nueva función
        title="Añadir Nuevo Producto"
        width="700px" // Le damos un ancho adecuado al formulario
      >
        {/* 3. Reemplazamos el <p> con el formulario real */}
        {/* Le pasamos la función 'onClose' para que el botón "Cancelar" funcione */}
        <AddProductForm onClose={handleCloseAddModal} />
      </Modal>
      {/* --- (FIN) MODIFICACIÓN --- */}
    </div>
  );
};

export default InventoryPage;
