import React from 'react';
import { theme } from '../../styles/theme';

// Definimos las variantes de estilo que nuestro botón puede tener.
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';

// Heredamos las props nativas de un botón HTML
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
}

// Estilo base general para todos los botones
const baseStyle: React.CSSProperties = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: theme.borderRadius.md, // Usamos 8px del tema
  cursor: 'pointer',
  fontSize: theme.fontSizes.body,
  fontWeight: '700',
  transition: 'background-color 0.2s',
  fontFamily: theme.fonts.body,
};

// Mapeo de variantes a colores del tema
const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: theme.colors.primary, // Usando #103B87
    color: theme.colors.surface, // Blanco
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
    color: theme.colors.surface,
  },
  danger: {
    backgroundColor: theme.colors.danger, // Usando #EF4444
    color: theme.colors.surface,
  },
  success: {
    backgroundColor: theme.colors.success, // Usando #10B981
    color: theme.colors.surface,
  },
};

export const Button = ({
  children,
  variant = 'primary',
  ...props
}: ButtonProps) => {
  const style = { ...baseStyle, ...variantStyles[variant] };

  // Opcional: Estilo simple para el hover, aunque lo ideal sería usar CSS puro.
  // Para simplificar, usaremos un estilo fijo para demostrar funcionalidad.

  return (
    <button style={style} {...props}>
      {children}
    </button>
  );
};
