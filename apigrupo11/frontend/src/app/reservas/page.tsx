"use client";

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import MainLayout from '../../components/layout/MainLayoutNext';
import { theme } from '../../styles/theme';
import type { IReserva } from '../../types/api.types';
import { listReservas } from '../../services/reservas.service';

export default function ReservasPage() {
  const { data: session } = useSession();
  const [reservas, setReservas] = useState<IReserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ((session as any)?.error === 'RefreshAccessTokenError') {
      signOut({ callbackUrl: '/login' });
      return;
    }

    const fetchReservas = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = (session as any)?.accessToken;
        const userId = (session as any)?.user?.id;

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        console.debug('[Reservas] listReservas -> baseUrl=', baseUrl, 'tokenPresent=', !!token);

        const response = await listReservas(token, userId, 1, 50);

        setReservas(response.data);
      } catch (err: any) {
        console.error('Error cargando reservas:', err);
        setError(err?.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    const skipAuth = typeof window !== 'undefined' && (['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname));
    if (session || skipAuth) {
      fetchReservas();
    } else {
      setLoading(false);
    }
  }, [session]);

  return (
    <MainLayout>
      <div style={{ display: 'block', gap: theme.spacing.lg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: theme.colors.textPrimary }}>Reservas</h1>
            <p style={{ color: theme.colors.textSecondary }}>Listado de reservas del sistema</p>
          </div>
        </div>

        {/* Mensaje informativo cuando backend no está disponible */}
        {reservas.length > 0 && reservas[0]?.id === 1 && reservas[0]?.productoNombre === 'Laptop HP' && (
          <div style={{ 
            backgroundColor: '#3498db20', 
            border: '1px solid #3498db', 
            borderRadius: theme.borderRadius.md, 
            padding: '12px 16px',
            marginTop: theme.spacing.md,
            color: '#3498db',
            fontSize: '14px',
          }}>
            ℹ️ Mostrando datos de ejemplo (backend no disponible). Para ver datos reales, inicia el backend en puerto 3000.
          </div>
        )}

        <div style={{
          marginTop: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.sm,
          border: `1px solid ${theme.colors.border}`,
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>

            {loading && (
              <div style={{ padding: '24px', color: theme.colors.textSecondary }}>
                Cargando reservas...
              </div>
            )}

            {error && (
              <div style={{ padding: '24px', color: '#ff6b6b' }}>
                Error: {error}
              </div>
            )}

            {!loading && !error && (
              <table style={{ width: '100%', borderCollapse: 'collapse', color: theme.colors.textPrimary }}>
                <thead style={{ backgroundColor: theme.colors.darkBgSecondary }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Producto</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Cantidad</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Usuario</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Fecha</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.map((r, idx) => (
                    <tr key={r.id ?? `res-${idx}`} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{r.id ?? `#${idx+1}`}</td>
                      <td style={{ padding: '12px' }}>{r.productoNombre}</td>
                      <td style={{ padding: '12px' }}>{r.cantidad}</td>
                      <td style={{ padding: '12px', color: theme.colors.textSecondary }}>{r.usuarioId}</td>
                      <td style={{ padding: '12px', color: theme.colors.textSecondary }}>
                        {new Date(r.fechaReserva).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '6px 10px',
                          borderRadius: theme.borderRadius.md,
                          backgroundColor:
                            r.estado === 'activa' ? '#2980b9' :
                            r.estado === 'completada' ? '#27ae60' : '#95a5a6',
                          color: theme.colors.textOnPrimary,
                          fontWeight: 700,
                          fontSize: '13px'
                        }}>
                          {r.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
