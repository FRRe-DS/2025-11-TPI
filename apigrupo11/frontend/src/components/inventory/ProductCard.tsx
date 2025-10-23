import React from 'react';
import type { IProducto } from '../../types/api.types';
import { theme } from '../../styles/theme';
import { Button } from '../ui/Button';

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto auto auto',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    marginBottom: theme.spacing.sm,
    transition: 'box-shadow 0.2s, border-color 0.2s',
    cursor: 'pointer',
  },
  image: {
    width: '50px',
    height: '50px',
    borderRadius: theme.borderRadius.sm,
    objectFit: 'cover',
    backgroundColor: theme.colors.background,
  },
  info: {},
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: theme.colors.textPrimary,
    margin: 0,
  },
  details: {
    fontSize: theme.fontSizes.caption,
    color: theme.colors.textSecondary,
    marginTop: '4px',
  },
  stockIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
    marginLeft: '8px',
  },
  columnText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.textSecondary,
    textAlign: 'left',
  },
};

interface ProductCardProps {
  product: IProducto;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const stockColor =
    product.stockDisponible > 10
      ? theme.colors.success
      : product.stockDisponible > 0
        ? theme.colors.warning
        : theme.colors.danger;

  const formattedDate = new Date(product.fechaActualizacion).toLocaleDateString(
    'es-AR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  );

  return (
    <div
      style={styles.card}
      onMouseOver={(e) =>
        (e.currentTarget.style.borderColor = theme.colors.primary)
      }
      onMouseOut={(e) =>
        (e.currentTarget.style.borderColor = theme.colors.border)
      }
    >
      <img
        src={
          product.imagenes[0]?.url ||
          'https://placehold.co/50x50/F9FAFB/E5E7EB?text=Img'
        }
        alt={product.nombre}
        style={styles.image}
      />
      <div style={styles.info}>
        <h4 style={styles.title}>{product.nombre}</h4>
        <p style={styles.details}>
          Stock: {product.stockDisponible}
          <span
            style={{ ...styles.stockIndicator, backgroundColor: stockColor }}
          ></span>
        </p>
      </div>
      <div style={styles.columnText}>
        <p
          style={{
            fontSize: '12px',
            color: theme.colors.textSecondary,
            margin: 0,
            marginBottom: '4px',
          }}
        >
          ACTUALIZADO
        </p>
        <p
          style={{
            fontWeight: '600',
            color: theme.colors.textPrimary,
            margin: 0,
          }}
        >
          {formattedDate}
        </p>
      </div>
      <div style={styles.columnText}>
        <p
          style={{
            fontSize: '12px',
            color: theme.colors.textSecondary,
            margin: 0,
            marginBottom: '4px',
          }}
        >
          CATEGORÍA
        </p>
        <p
          style={{
            fontWeight: '600',
            color: theme.colors.textPrimary,
            margin: 0,
          }}
        >
          {product.categoria}
        </p>
      </div>
      <div>
        <Button
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            alert(`Acciones para ${product.nombre}`);
          }}
        >
          ...
        </Button>
      </div>
    </div>
  );
};
