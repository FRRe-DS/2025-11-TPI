import type React from 'react';
import { theme } from '../../styles/theme';
import { Button } from '../ui/Button';

const styles: { [key: string]: React.CSSProperties } = {
  panel: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    height: '100%',
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  statusContainer: {
    display: 'flex',
    gap: theme.spacing.sm,
  },
  statusButton: {
    flex: 1,
    padding: '8px 12px',
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.caption,
  },
  statusButtonActive: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.primary,
    fontWeight: '600',
  },
  count: {
    float: 'right',
    color: theme.colors.textSecondary,
  },
  select: {
    width: '100%',
    padding: '10px',
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.body,
    backgroundColor: theme.colors.surface,
  },
  footer: {
    marginTop: 'auto',
  },
  buttonContainer: {
    display: 'flex',
    gap: theme.spacing.md,
    marginTop: 'auto',
    paddingTop: theme.spacing.lg,
  },
};

export const FilterPanel: React.FC = () => {
  return (
    <div style={styles.panel}>
      <div>
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Estado del Producto</h4>
          <div style={styles.statusContainer}>
            <button
              style={{ ...styles.statusButton, ...styles.statusButtonActive }}
            >
              Todos <span style={styles.count}>6000</span>
            </button>
            <button style={styles.statusButton}>
              Activo <span style={styles.count}>5200</span>
            </button>
          </div>
        </div>
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Ordenar</h4>
          <select style={styles.select}>
            <option>Alfabético: A-Z</option>
            <option>Alfabético: Z-A</option>
            <option>Mayor Stock</option>
          </select>
        </div>
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Categoría</h4>
          <select style={styles.select}>
            <option>Todas las categorías</option>
            <option>Electrónica</option>
            <option>Accesorios</option>
          </select>
        </div>
      </div>
      <div style={styles.buttonContainer}>
        <Button variant="secondary" style={{ flex: 1 }}>
          Borrar Filtros
        </Button>
        <Button variant="primary" style={{ flex: 1 }}>
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
};
