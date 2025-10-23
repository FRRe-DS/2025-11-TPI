'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { theme } from '../../styles/theme';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
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
            marginBottom: theme.spacing.lg,
            color: theme.colors.primary,
          }}
        >
          Stock Manager
        </h1>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: theme.spacing.md }}>
            <label
              style={{
                display: 'block',
                marginBottom: theme.spacing.sm,
                fontWeight: '600',
                fontSize: theme.fontSizes.body,
                color: theme.colors.textPrimary,
              }}
            >
              Usuario
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              style={{
                width: '100%',
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.background,
                color: theme.colors.textPrimary,
                fontSize: theme.fontSizes.body,
                boxSizing: 'border-box',
              }}
              placeholder="Ingresa tu usuario"
              required
            />
          </div>

          <div style={{ marginBottom: theme.spacing.lg }}>
            <label
              style={{
                display: 'block',
                marginBottom: theme.spacing.sm,
                fontWeight: '600',
                fontSize: theme.fontSizes.body,
                color: theme.colors.textPrimary,
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              style={{
                width: '100%',
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.background,
                color: theme.colors.textPrimary,
                fontSize: theme.fontSizes.body,
                boxSizing: 'border-box',
              }}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.md,
              border: 'none',
              backgroundColor: theme.colors.primary,
              color: 'white',
              fontSize: theme.fontSizes.body,
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary;
            }}
          >
            Iniciar Sesión
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: theme.spacing.lg,
            fontSize: theme.fontSizes.small,
            color: theme.colors.textSecondary,
          }}
        >
          Sistema de Gestión de Inventario
        </div>
      </div>
    </div>
  );
}
