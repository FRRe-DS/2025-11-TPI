// src/styles/theme.ts

// Define todos los colores, tipografía y espaciado que usaremos
// en toda la aplicación.
export const theme = {
  colors: {
    // Colores principales (acentos)
    primary: '#7C5CFF', // púrpura-azulado suave
    primaryDark: '#5B3EDF',
    secondary: '#94A3B8',

    // Fondos oscuros
    darkBg: '#0B1220', // Very dark navy
    darkBgSecondary: '#0F1724',
    darkBorder: '#1F2A37',

    // Superficies y elementos
    background: '#071020', // fondo general oscuro
    surface: '#0B1320', // tarjetas y paneles
    border: '#16202B',

  // Colores de Texto (claro sobre fondos oscuros)
  textPrimary: '#E6EEF8',
  textSecondary: '#A9B6C2',
  // texto sobre botones/elementos primary (debe ser claro)
  textOnPrimary: '#F1F5F9',
  // texto sobre fondos oscuros generales
  textOnDark: '#E6EEF8',

    // Colores Semánticos (mantener contraste)
    success: '#4ADE80',
    warning: '#FBBF24',
    danger: '#F87171',
  },

  fonts: {
    body: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },

  fontSizes: {
    h1: '28px',
    h2: '24px',
    h3: '20px',
    body: '15px',
    caption: '13px',
    medium: '16px',
    small: '12px',
  },

  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
  },

  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 6px 18px -6px rgba(0, 0, 0, 0.6)',
    lg: '0 18px 50px -20px rgba(0, 0, 0, 0.7)',
  },
};
