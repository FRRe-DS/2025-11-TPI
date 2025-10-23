// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Importamos el theme
import { theme } from '../styles/theme';

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.colors.background,
        color: theme.colors.textPrimary,
        fontFamily: theme.fonts.body,
      }}
    >
      <div
        style={{
          background: theme.colors.surface,
          color: theme.colors.textPrimary,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.xl,
          width: '100%',
          maxWidth: '400px',
          boxShadow: theme.shadows.lg,
        }}
      >
        <h1
          style={{
            fontSize: theme.fontSizes.h1,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: theme.spacing.xl,
          }}
        >
          Login
        </h1>
        <form onSubmit={handleLogin}>
          {/* Campo Usuario con Label */}
          <div style={{ marginBottom: theme.spacing.md }}>
            <label
              htmlFor="username"
              style={{
                display: 'block',
                fontWeight: '600',
                fontSize: theme.fontSizes.body,
                marginBottom: theme.spacing.sm,
              }}
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              placeholder="Ingresa tu usuario"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: theme.colors.background,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`,
                fontSize: theme.fontSizes.body,
                boxSizing: 'border-box', // Importante para que el padding no rompa el width
              }}
            />
          </div>

          {/* Campo Contraseña con Label */}
          <div style={{ marginBottom: theme.spacing.lg }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontWeight: '600',
                fontSize: theme.fontSizes.body,
                marginBottom: theme.spacing.sm,
              }}
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              placeholder="Ingresa tu contraseña"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: theme.colors.background,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`,
                fontSize: theme.fontSizes.body,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: theme.colors.darkBg,
              // Texto blanco
              color: theme.colors.textOnPrimary,
              borderRadius: theme.borderRadius.md,
              border: 'none',
              cursor: 'pointer',
              fontSize: theme.fontSizes.medium, // 16px
              fontWeight: '600', // Un poco más grueso
            }}
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
