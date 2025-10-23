import React, { useState } from 'react';
import { theme } from '../../styles/theme';

interface IconButtonProps {
  icon: string;
  notification?: boolean;
  onClick?: () => void; // CORRECCIÓN: Añadimos la prop opcional onClick
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  notification,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const styles: { [key: string]: React.CSSProperties } = {
    button: {
      position: 'relative',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '10px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      color: theme.colors.textSecondary,
      transition: 'background-color 0.2s',
      backgroundColor: isHovered ? theme.colors.background : 'transparent',
    },
    notificationDot: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: theme.colors.danger,
      border: `2px solid ${theme.colors.surface}`,
    },
  };

  return (
    <button
      style={styles.button}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick} // CORRECCIÓN: Pasamos el onClick al elemento <button> real
    >
      {icon}
      {notification && <span style={styles.notificationDot}></span>}
    </button>
  );
};
