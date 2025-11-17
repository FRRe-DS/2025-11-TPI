import React, { useState } from 'react';
import { theme } from '../../styles/theme';

interface IconButtonProps {
  icon: React.ReactNode;
  notification?: boolean;
  badgeCount?: number;
  onClick?: () => void; // CORRECCIÓN: Añadimos la prop opcional onClick
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  notification,
  badgeCount,
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
      minWidth: '18px',
      height: '18px',
      borderRadius: '18px',
      backgroundColor: theme.colors.danger,
      border: `2px solid rgba(255,255,255,0.06)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.colors.textOnDark,
      fontSize: '12px',
      padding: '0 5px',
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
      {typeof (badgeCount) !== 'undefined' && badgeCount! > 0 ? (
        <span style={styles.notificationDot}>{badgeCount}</span>
      ) : (
        notification && <span style={styles.notificationDot}></span>
      )}
    </button>
  );
};
