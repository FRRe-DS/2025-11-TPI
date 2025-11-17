'use client';

import React from 'react'; // Eliminamos useState, ya no es necesario
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react'; // <-- 1. Importamos hooks
import { theme } from '../../styles/theme';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession(); // <-- 2. Obtenemos el estado de la sesión

  // --- Lógica de Sesión ---
  React.useEffect(() => {
    // Si la sesión está "authenticated", redirigimos al dashboard
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Si está cargando, mostramos un loader
  if (status === 'loading') {
    return <div>Cargando...</div>; // Puedes estilizar esto
  }

  // --- Función de Login ---
  // Esta función ahora es mucho más simple
  const handleLogin = () => {
    // 3. Llamamos a signIn y le decimos que use el proveedor "keycloak"
    signIn('keycloak', {
      // Opcional: A dónde volver después del login
      callbackUrl: '/dashboard', 
    });
  };

  // Si no está autenticado, mostramos tu página de login
  // pero con la lógica del botón cambiada.
  if (status === 'unauthenticated') {
    return (
      <div
        style={{
          /* ... (Tu estilo de contenedor principal se mantiene) ... */
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
            /* ... (Tu estilo de caja de login se mantiene) ... */
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
              /* ... (Tu estilo de H1 se mantiene) ... */
              fontSize: theme.fontSizes.h1,
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: theme.spacing.lg,
              color: theme.colors.primary,
            }}
          >
            Stock Manager
          </h1>

          {/* 4. Eliminamos el formulario y los inputs */}
          {/* Ya no capturamos usuario/contraseña aquí */}

          <button
            type="button" // <-- Cambiado de "submit" a "button"
            onClick={handleLogin} // <-- Llamamos a nuestra nueva función
            style={{
              /* ... (Tu estilo de botón se mantiene) ... */
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
              e.currentTarget.style.backgroundColor = theme.colors.primaryDark;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary;
            }}
          >
            Iniciar Sesión con Keycloak
          </button>

          <div
            style={{
              /* ... (Tu estilo de footer se mantiene) ... */
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

  // Por defecto (mientras se determina el estado)
  return null;
}