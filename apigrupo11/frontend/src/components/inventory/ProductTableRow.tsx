'use client';

import type React from 'react';
import { useState } from 'react';
import type { IProducto } from '../../types/api.types';
import { theme } from '../../styles/theme';

const styles: { [key: string]: React.CSSProperties } = {
  row: {
    display: 'grid',
    gridTemplateColumns: '80px 100px 2fr 140px 120px 160px 180px 150px 60px',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    borderBottom: `1px solid ${theme.colors.border}`,
    transition: 'background-color 0.15s ease',
    cursor: 'pointer',
  },
  image: {
    width: '60px',
    height: '60px',
    borderRadius: theme.borderRadius.sm,
    objectFit: 'cover',
    backgroundColor: theme.colors.background,
    border: `1px solid ${theme.colors.border}`,
  },
  sku: {
    fontSize: theme.fontSizes.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },
  productName: {
    fontSize: theme.fontSizes.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  productDesc: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  category: {
    fontSize: theme.fontSizes.caption,
    color: theme.colors.textSecondary,
    padding: '4px 10px',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    display: 'inline-block',
    fontWeight: '500',
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  stockBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: theme.fontSizes.body,
    fontWeight: '600',
  },
  stockIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  text: {
    fontSize: theme.fontSizes.caption,
    color: theme.colors.textSecondary,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  stockInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: theme.fontSizes.caption,
    color: theme.colors.textSecondary,
  },
  location: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  menuButton: {
    width: '36px',
    height: '36px',
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    transition: 'all 0.15s ease',
  },
};

interface ProductTableRowProps {
  product: IProducto;
  onDelete?: (productId: number) => void;
}

export const ProductTableRow: React.FC<ProductTableRowProps> = ({
  product,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const stockColor =
    product.stockDisponible > 10
      ? theme.colors.success
      : product.stockDisponible > 0
        ? theme.colors.warning
        : theme.colors.danger;

  const ubicacionText = product.ubicacion
    ? [product.ubicacion.street, product.ubicacion.city, product.ubicacion.state]
        .filter(Boolean)
        .join(', ')
    : 'Sin ubicación';

  const fechaActualizacion = new Date(
    product.fechaActualizacion
  ).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div
      style={{
        ...styles.row,
        backgroundColor: isHovered
          ? theme.colors.background
          : theme.colors.surface,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ ...styles.image, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: theme.colors.textSecondary }}>
        IMG
      </div>

      <span style={styles.sku}>#{product.id}</span>

      <div style={styles.productInfo}>
        <h4 style={styles.productName}>{product.nombre}</h4>
        <p style={styles.productDesc}>{product.descripcion}</p>
      </div>

      <span style={styles.category}>{product.categoria}</span>

      <div style={styles.stockBadge}>
        <span
          style={{ ...styles.stockIndicator, backgroundColor: stockColor }}
        />
        <span>{product.stockDisponible} uds</span>
      </div>

      <p style={styles.text}>{fechaActualizacion}</p>

      <p style={styles.location}>{ubicacionText}</p>

      <div style={styles.stockInfo}>
        <span>Total: {product.stockTotal}</span>
        <span>Reservado: {product.stockReservado}</span>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          style={{
            ...styles.menuButton,
            backgroundColor: isHovered ? theme.colors.surface : 'transparent',
            borderColor: isHovered ? theme.colors.primary : theme.colors.border,
          }}
          onClick={(e) => {
            e.stopPropagation();
            alert(`Editar ${product.nombre}`);
          }}
          title="Editar"
        >
          ✏️
        </button>
        {onDelete && (
          <button
            style={{
              ...styles.menuButton,
              backgroundColor: isHovered ? theme.colors.surface : 'transparent',
              borderColor: isHovered ? theme.colors.danger : theme.colors.border,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product.id);
            }}
            title="Eliminar"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};
