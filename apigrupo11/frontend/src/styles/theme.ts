// src/styles/theme.ts

// Define todos los colores, tipografía y espaciado que usaremos
// en toda la aplicación.
export const theme = {
  colors: {
    // Colores principales
    primary: '#6366F1', // Indigo moderno
    primaryDark: '#4F46E5',
    secondary: '#6B7280',

    darkBg: '#0F172A', // Fondo oscuro para sidebar
    darkBgSecondary: '#1E293B', // Fondo secundario oscuro
    darkBorder: '#334155', // Bordes en tema oscuro

    // Colores Neutrales
    background: '#F8FAFC', // Fondo general más suave
    surface: '#FFFFFF',
    border: '#E2E8F0',

    // Colores de Texto
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textOnPrimary: '#FFFFFF',
    textOnDark: '#F1F5F9', // Text color for dark backgrounds

    // Colores Semánticos
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
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
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
};
