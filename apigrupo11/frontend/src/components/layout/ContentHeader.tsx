'use client';

import type React from 'react';
import { theme } from '../../styles/theme';
import { IconButton } from '../ui/IconButton';

interface ContentHeaderProps {
  title: string;
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
    height: '72px',
    boxSizing: 'border-box',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.h1,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    margin: 0,
    letterSpacing: '-0.5px',
  },
  searchWrapper: {
    position: 'relative',
    width: '400px',
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

export const ContentHeader: React.FC<ContentHeaderProps> = ({ title }) => {
  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <h1 style={styles.title}>{title}</h1>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar productos..."
            style={styles.searchInput}
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
        <IconButton icon="⚙️" />
        <IconButton icon="🔔" />
        <IconButton icon="👤" notification />
      </div>
    </header>
  );
};
