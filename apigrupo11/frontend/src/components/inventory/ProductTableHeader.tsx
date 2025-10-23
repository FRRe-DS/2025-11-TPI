import type React from 'react';
import { theme } from '../../styles/theme';

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'grid',
    gridTemplateColumns: '80px 100px 2fr 140px 120px 160px 180px 150px 60px',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background,
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    borderBottom: `2px solid ${theme.colors.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerText: {
    fontSize: theme.fontSizes.small,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: 0,
  },
};

export const ProductTableHeader: React.FC = () => {
  return (
    <div style={styles.header}>
      <p style={styles.headerText}>Imagen</p>
      <p style={styles.headerText}>SKU</p>
      <p style={styles.headerText}>Producto</p>
      <p style={styles.headerText}>Categoría</p>
      <p style={styles.headerText}>Stock Disp.</p>
      <p style={styles.headerText}>Actualizado</p>
      <p style={styles.headerText}>Ubicación</p>
      <p style={styles.headerText}>Stock Info</p>
      <p style={styles.headerText}></p>
    </div>
  );
};
