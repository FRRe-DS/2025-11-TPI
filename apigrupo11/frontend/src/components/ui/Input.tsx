import React from 'react';
import { theme } from '../../styles/theme';

// Heredamos todas las props de un input HTML (`input`)
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Un label opcional para mostrar encima del input
  error?: string; // Un mensaje de error opcional para mostrar debajo
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing.md, // Usamos espaciado medio
    fontFamily: theme.fonts.family,
  },
  label: {
    marginBottom: theme.spacing.xs, // Usamos espaciado extra pequeño (4px)
    fontWeight: '600', // Semi-Bold
    fontSize: theme.fontSizes.body,
    color: theme.colors.textPrimary,
  },
  input: {
    padding: '10px',
    fontSize: theme.fontSizes.body,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm, // Usamos 4px del tema
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
  },
  error: {
    color: theme.colors.danger, // Usamos el color de peligro
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSizes.caption,
  },
};

export const Input = ({ label, error, ...props }: InputProps) => {
  return (
    <div style={styles.container}>
      {label && <label style={styles.label}>{label}</label>}
      <input
        style={{
          ...styles.input,
          // Cambia el color del borde si hay un error
          borderColor: error ? theme.colors.danger : theme.colors.border,
        }}
        {...props}
      />
      {error && <span style={styles.error}>{error}</span>}
    </div>
  );
};
