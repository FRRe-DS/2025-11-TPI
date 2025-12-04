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
                    <th style={{ padding: '12px', textAlign: 'left' }}>ID Reserva</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>ID Compra</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Productos</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Usuario</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Fecha Creación</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Expira</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.map((r: any, idx) => (
                    <tr key={r.idReserva ?? `res-${idx}`} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>#{r.idReserva ?? idx + 1}</td>
                      <td style={{ padding: '12px', color: theme.colors.textSecondary, fontFamily: 'monospace' }}>
                        {r.idCompra || '-'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {r.productos && r.productos.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {r.productos.map((prod: any) => (
                              <div key={prod.id} style={{ 
                                fontSize: '13px',
                                padding: '4px 8px',
                                backgroundColor: theme.colors.darkBgSecondary,
                                borderRadius: theme.borderRadius.sm,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <span style={{ fontWeight: 500 }}>{prod.nombreProducto}</span>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: theme.colors.textSecondary }}>
                                  <span>Cant: {prod.cantidad}</span>
                                  <span>${prod.precioUnitario.toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                            <div style={{ 
                              fontSize: '13px', 
                              fontWeight: 700, 
                              marginTop: '4px',
                              color: theme.colors.primary 
                            }}>
                              Total: ${r.productos.reduce((sum: number, p: any) => sum + (p.cantidad * p.precioUnitario), 0).toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: theme.colors.textSecondary }}>Sin productos</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', color: theme.colors.textSecondary }}>
                        Usuario #{r.usuarioId}
                      </td>
                      <td style={{ padding: '12px', color: theme.colors.textSecondary, fontSize: '13px' }}>
                        {new Date(r.fechaCreacion).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td style={{ padding: '12px', color: theme.colors.textSecondary, fontSize: '13px' }}>
                        {r.expiresAt ? new Date(r.expiresAt).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '6px 10px',
                          borderRadius: theme.borderRadius.md,
                          backgroundColor:
                            r.estado === 'pendiente' ? '#f39c12' :
                            r.estado === 'confirmada' ? '#27ae60' :
                            r.estado === 'cancelada' ? '#e74c3c' :
                            r.estado === 'expirada' ? '#95a5a6' : '#3498db',
                          color: theme.colors.textOnPrimary,
                          fontWeight: 700,
                          fontSize: '13px',
                          textTransform: 'capitalize'
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
