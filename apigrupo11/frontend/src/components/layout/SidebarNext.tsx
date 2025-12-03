'use client';

import type React from 'react';
// import { useRouter } from 'next/navigation'; // <-- 1. Ya no lo necesitamos para el logout
import { signOut } from 'next-auth/react'; // <-- 2. Importamos signOut
import { theme } from '../../styles/theme';
import { SidebarLinkNext } from './SidebarLinkNext';
import { FiHome, FiBox, FiSearch, FiLogOut, FiClipboard } from 'react-icons/fi';

export const SidebarNext: React.FC = () => {
  // const router = useRouter(); // <-- 1. Ya no lo necesitamos

  const handleLogout = () => {
    // 3. Llamamos a signOut()
    // Esto destruye la sesión y nos redirige a la URL
    // que le pasemos en 'callbackUrl'.
    signOut({
      callbackUrl: '/login',
    });
  };

  const styles: { [key: string]: React.CSSProperties } = {
    // ... (Todos tus estilos están perfectos) ...
    sidebar: {
      width: '260px',
      background: `linear-gradient(180deg, ${theme.colors.darkBg} 0%, ${theme.colors.darkBgSecondary} 100%)`,
      padding: `${theme.spacing.lg} 0`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRight: `1px solid ${theme.colors.darkBorder}`,
      flexShrink: 0,
      borderRadius: `0 ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0`,
      margin: `${theme.spacing.sm} 0 ${theme.spacing.sm} ${theme.spacing.sm}`,
    },
    nav: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      padding: `0 ${theme.spacing.md}`,
    },
    logoutSection: {
      padding: `0 ${theme.spacing.md}`,
      borderTop: `1px solid ${theme.colors.darkBorder}`,
      paddingTop: theme.spacing.md,
    },
    logoutButton: {
      width: '100%',
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      backgroundColor: 'transparent',
      border: `1px solid ${theme.colors.darkBorder}`,
      borderRadius: theme.borderRadius.md,
      color: theme.colors.textSecondary,
      fontSize: theme.fontSizes.body,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
      transition: 'all 0.2s ease',
    },
  };

  return (
    <aside style={styles.sidebar}>
      <nav style={styles.nav}>
        <SidebarLinkNext to="/dashboard" icon={<FiHome />}>Dashboard</SidebarLinkNext>
        <SidebarLinkNext to="/inventario" icon={<FiBox />}>Inventario</SidebarLinkNext>
        <SidebarLinkNext to="/reservas" icon={<FiClipboard />}>Reservas</SidebarLinkNext>
        <SidebarLinkNext to="/auditoria" icon={<FiSearch />}>Auditoría</SidebarLinkNext>
      </nav>

      <div style={styles.logoutSection}>
        <button
          style={styles.logoutButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              theme.colors.darkBgSecondary;
            e.currentTarget.style.borderColor = theme.colors.primary;
            e.currentTarget.style.color = theme.colors.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = theme.colors.darkBorder;
            e.currentTarget.style.color = theme.colors.textSecondary;
          }}
          onClick={handleLogout} // <-- Llama a la nueva función
        >
          <FiLogOut style={{ marginRight: theme.spacing.sm }} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarNext;