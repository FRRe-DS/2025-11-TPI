'use client';

import type React from 'react';
import { theme } from '../../styles/theme';
import { Button } from '../ui/Button';

interface SectionHeaderProps {
  title: string;
  onSearch?: (query: string) => void;
  onFilterClick?: () => void;
  onAddClick?: () => void;
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.lg,
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.lg,
    flex: 1,
  },
  title: {
    fontSize: theme.fontSizes.h1,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    margin: 0,
    letterSpacing: '-0.5px',
    minWidth: '150px',
  },
  searchWrapper: {
    position: 'relative',
    flex: 1,
    maxWidth: '500px',
  },
  searchInput: {
    width: '100%',
    padding: `10px 16px 10px 40px`,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.border}`,
    fontSize: theme.fontSizes.body,
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: theme.colors.background,
    color: theme.colors.textPrimary,
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: theme.colors.textSecondary,
    fontSize: '18px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onSearch,
  onFilterClick,
  onAddClick,
}) => {
  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <h2 style={styles.title}>{title}</h2>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar productos..."
            style={styles.searchInput}
            onChange={(e) => onSearch?.(e.target.value)}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary;
              e.currentTarget.style.boxShadow = `0 0 0 3px rgba(99, 102, 241, 0.1)`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.colors.border;
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>
      <div style={styles.actions}>
        {onFilterClick && (
          <Button variant="secondary" onClick={onFilterClick}>
            🔽 Filtrar
          </Button>
        )}
        {onAddClick && <Button onClick={onAddClick}>+ Añadir Producto</Button>}
      </div>
    </header>
  );
};
