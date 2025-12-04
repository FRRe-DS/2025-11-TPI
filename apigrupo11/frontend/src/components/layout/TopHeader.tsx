import React, { useState, useRef, useEffect } from 'react';
import { theme } from '../../styles/theme';
import { IconButton } from '../ui/IconButton';
import { FiUser } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    backgroundColor: theme.colors.surface,
    height: '72px',
    boxSizing: 'border-box',
    borderBottom: `1px solid ${theme.colors.border}`,
    boxShadow: '0 2px 8px rgba(16,24,40,0.04)',
    position: 'relative',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '800',
    margin: 0,
    color: theme.colors.textPrimary,
    letterSpacing: '-0.5px',
  },
  centerTitle: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: '64px',
    right: 0,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    minWidth: '200px',
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    zIndex: 1000,
    padding: theme.spacing.sm,
  },
  dropdownItem: {
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    cursor: 'pointer',
    color: theme.colors.textPrimary,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    position: 'absolute',
    right: theme.spacing.lg,
    top: '50%',
    transform: 'translateY(-50%)',
  },
};

const TopHeader: React.FC = () => {
  const [showAccount, setShowAccount] = useState(false);
  const router = useRouter();
  const accountRef = useRef<HTMLDivElement | null>(null);


  return (
    <header style={styles.header}>
      <div style={styles.centerTitle}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>Stock system</h1>
      </div>
      <div style={styles.actions}>
        <div style={{ position: 'relative' }} ref={accountRef}>
          <IconButton icon={<FiUser />} onClick={() => router.push('/perfil')} />
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
