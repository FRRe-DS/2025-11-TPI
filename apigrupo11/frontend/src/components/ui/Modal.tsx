import React, { useEffect } from 'react';
import { theme } from '../../styles/theme';
import { IconButton } from './IconButton'; // Reutilizamos nuestro IconButton

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
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
    backgroundColor: 'rgba(17, 24, 39, 0.6)', // Usamos un color de fondo oscuro semitransparente
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    opacity: 0,
    transition: 'opacity 0.2s ease-in-out',
    pointerEvents: 'none',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg, // Bordes más redondeados
    boxShadow:
      '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    zIndex: 1001,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    transform: 'scale(0.95)',
    transition: 'transform 0.2s ease-in-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.colors.border}`,
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
  },
  title: {
    fontSize: theme.fontSizes.h3,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    margin: 0,
  },
  body: {
    padding: theme.spacing.lg,
    overflowY: 'auto',
  },
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = '600px',
}) => {
  // Efecto para evitar el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function para restaurar el scroll si el componente se desmonta
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const backdropStyle = {
    ...styles.backdrop,
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
  } as React.CSSProperties;

  const contentStyle = {
    ...styles.modalContent,
    width,
    transform: isOpen ? 'scale(1)' : 'scale(0.95)',
  } as React.CSSProperties;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={backdropStyle} onClick={handleBackdropClick}>
      <div style={contentStyle}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <IconButton icon="❌" onClick={onClose} />
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
};
