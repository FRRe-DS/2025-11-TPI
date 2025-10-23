'use client';

import type React from 'react';
import { useEffect } from 'react';
import { theme } from '../../styles/theme';
// import { useNavigate } from 'react-router-dom'; // <--- ELIMINADO

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}

const styles: { [key: string]: React.CSSProperties } = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    zIndex: 1000,
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
    pointerEvents: 'none',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100%',
    backgroundColor: theme.colors.surface,
    boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  title: {
    fontSize: theme.fontSizes.h3,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: theme.colors.textSecondary,
    padding: '4px 8px',
    borderRadius: theme.borderRadius.sm,
    transition: 'background-color 0.2s',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing.lg,
  },
  // --- 'logoutButton' ELIMINADO de 'styles' ---
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  children,
  width = '400px',
}) => {
  // const navigate = useNavigate(); // <--- ELIMINADO

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // --- 'handleLogout' ELIMINADO ---

  const backdropStyle = {
    ...styles.backdrop,
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
  } as React.CSSProperties;

  const sidebarStyle = {
    ...styles.sidebar,
    width,
    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
  } as React.CSSProperties;

  return (
    <>
      <div style={backdropStyle} onClick={onClose} />
      <div style={sidebarStyle}>
        <div style={styles.header}>
          <h3 style={styles.title}>Filtros</h3>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.background;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ✕
          </button>
        </div>
        <div style={styles.body}>
          {children}
          {/* --- Botón de 'Cerrar Sesión' ELIMINADO del JSX --- */}
        </div>
      </div>
    </>
  );
};
