import type React from 'react';
import { theme } from '../../styles/theme';
import { IconButton } from '../ui/IconButton';

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    backgroundColor: theme.colors.background,
    height: '64px',
    boxSizing: 'border-box',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
    color: theme.colors.textPrimary,
    letterSpacing: '-0.5px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
};

const TopHeader: React.FC = () => {
  return (
    <header style={styles.header}>
      <h1 style={styles.logoText}>Stock</h1>
      <div style={styles.actions}>
        <IconButton icon="⚙️" />
        <IconButton icon="🔔" />
        <IconButton icon="👤" notification />
      </div>
    </header>
  );
};

export default TopHeader;
