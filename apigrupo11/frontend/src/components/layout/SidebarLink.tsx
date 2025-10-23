'use client';

import type React from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { theme } from '../../styles/theme';

interface SidebarLinkProps {
  to: string;
  icon: string;
  children: React.ReactNode;
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({
  to,
  icon,
  children,
}) => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const isActive = location.pathname === to;

  const styles: { [key: string]: React.CSSProperties } = {
    link: {
      display: 'flex',
      alignItems: 'center',
      padding: `12px ${theme.spacing.md}`,
      borderRadius: theme.borderRadius.md,
      color: isActive ? theme.colors.textOnDark : theme.colors.textSecondary,
      backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
      textDecoration: 'none',
      fontSize: theme.fontSizes.body,
      fontWeight: isActive ? '600' : '500',
      transition: 'all 0.2s ease',
      border: isActive
        ? `1px solid rgba(99, 102, 241, 0.3)`
        : '1px solid transparent',
    },
    linkHover: {
      backgroundColor: isActive
        ? 'rgba(99, 102, 241, 0.2)'
        : 'rgba(255, 255, 255, 0.05)',
      color: theme.colors.textOnDark,
    },
    icon: {
      marginRight: '12px',
      fontSize: '20px',
      width: '24px',
      textAlign: 'center',
      opacity: isActive ? 1 : 0.7,
    },
  };

  const linkStyle = {
    ...styles.link,
    ...(isHovered ? styles.linkHover : {}),
  };

  return (
    <Link
      to={to}
      style={linkStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={styles.icon}>{icon}</span>
      {children}
    </Link>
  );
};
