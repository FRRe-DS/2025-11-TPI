import React from 'react';
import { theme } from '../../styles/theme';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.h1,
    color: theme.colors.textPrimary,
    margin: 0,
  },
  countBadge: {
    backgroundColor: theme.colors.background,
    color: theme.colors.textSecondary,
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: theme.fontSizes.caption,
    fontWeight: '600',
  },
  actionsSection: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
};

interface InventoryHeaderProps {
  productCount: number;
  onAddProduct: () => void;
}

export const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  productCount,
  onAddProduct,
}) => {
  return (
    <header style={styles.header}>
      <div style={styles.titleSection}>
        <h1 style={styles.title}>Inventario</h1>
        <span style={styles.countBadge}>{productCount} productos</span>
      </div>
      <div style={styles.actionsSection}>
        <Input placeholder="Buscar producto..." style={{ minWidth: '300px' }} />
        <Button onClick={onAddProduct}>Añadir Producto</Button>
      </div>
    </header>
  );
};
