import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../styles/theme';

// Estilos para el botón
const styles: { [key: string]: React.CSSProperties } = {
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm, // Espacio entre el icono y el texto
    padding: theme.spacing.md,
    width: '100%',
    backgroundColor: 'transparent',
    color: theme.colors.textSecondary, // Un color de texto estándar
    border: 'none',
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.body,
    textAlign: 'left',
    transition: 'background-color 0.2s, color 0.2s',
  },
  icon: {
    fontSize: '18px', // Tamaño del icono
  },
};

export const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleLogout = () => {
    // Limpiamos el localStorage si existe algún dato de sesión
    localStorage.removeItem('loggedIn');
    // Redirigimos al login
    navigate('/login');
  };

  // Cambiamos el estilo al hacer hover para que sea rojo
  const buttonStyle = {
    ...styles.logoutButton,
    backgroundColor: isHovered ? theme.colors.danger : 'transparent',
    color: isHovered ? theme.colors.primary : theme.colors.textSecondary,
  };

  return (
    <button
      style={buttonStyle}
      onClick={handleLogout}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={styles.icon}>🚪</span>
      <span>Cerrar Sesión</span>
    </button>
  );
};
