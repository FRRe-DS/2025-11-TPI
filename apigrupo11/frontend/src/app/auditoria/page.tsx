 'use client';

import React from 'react';
import MainLayout from '../../components/layout/MainLayoutNext';
import { theme } from '../../styles/theme';

interface Movimiento {
  timestamp: string;
  producto: string;
  sku: string;
  tipo: "Entrada" | "Salida" | "Reserva" | "Ajuste" | "Liberacion";
  cambio: number;
  usuario: string;
  motivo: string;
}

export default function AuditPage() {
  const movimientos: Movimiento[] = [
    {
      timestamp: "2025-10-18 14:30:15",
      producto: "Laptop Pro 15",
      sku: "LPT-15-69-512",
      tipo: "Salida",
      cambio: -5,
      usuario: "api_ventas",
      motivo: "Venta Orden #1234",
    },
    {
      timestamp: "2025-10-18 10:15:00",
      producto: "Mouse Inalámbrico",
      sku: "PRT-MSE-BLK",
      tipo: "Entrada",
      cambio: 200,
      usuario: "admin_almacen",
      motivo: "Recepción proveedor",
    },
    {
      timestamp: "2025-10-17 18:05:45",
      producto: "Teclado Mecánico",
      sku: "TKL-MEC-RGB",
      tipo: "Reserva",
      cambio: -1,
      usuario: "api_ventas",
      motivo: "Reserva Orden #1209",
    },
    {
      timestamp: "2025-10-17 11:20:10",
      producto: "Webcam HD 1080p",
      sku: "HDM-1080P",
      tipo: "Ajuste",
      cambio: -2,
      usuario: "juan_perez",
      motivo: "Rotura detectada",
    },
    {
      timestamp: "2025-10-16 16:45:30",
      producto: "Monitor 4K 27",
      sku: "MON-4K-27",
      tipo: "Entrada",
      cambio: 15,
      usuario: "maria_gonzalez",
      motivo: "Compra mensual",
    },
    {
      timestamp: "2025-10-16 09:10:22",
      producto: "Auriculares Gaming",
      sku: "AUR-GMG-RGB",
      tipo: "Liberacion",
      cambio: 3,
      usuario: "api_ventas",
      motivo: "Cancelación Orden #1187",
    },
  ];

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Entrada':
        return { background: 'rgba(74, 222, 128, 0.12)', color: theme.colors.success };
      case 'Salida':
        return { background: 'rgba(248, 113, 113, 0.08)', color: theme.colors.danger };
      case 'Reserva':
        return { background: 'rgba(59, 130, 246, 0.08)', color: theme.colors.primary };
      case 'Ajuste':
        return { background: 'rgba(251, 191, 36, 0.08)', color: theme.colors.warning };
      case 'Liberacion':
        return { background: 'rgba(124, 92, 255, 0.08)', color: theme.colors.primary };
      default:
        return { background: 'rgba(255,255,255,0.02)', color: theme.colors.textSecondary };
    }
  };

  const getCambioColor = (cambio: number) => {
    return cambio > 0 ? theme.colors.success : theme.colors.danger;
  };

  return (
    <MainLayout>
      <div style={{ display: 'block', gap: theme.spacing.lg }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: theme.colors.textPrimary }}>Auditoría</h1>
          <p style={{ color: theme.colors.textSecondary }}>Registro de movimientos de stock</p>
        </div>

        {/* Filtros */}
        <div style={{ backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.sm, border: `1px solid ${theme.colors.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: theme.spacing.md }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: theme.colors.textSecondary, marginBottom: '8px' }}>Fecha desde</label>
              <input type="date" style={{ width: '100%', padding: '8px', borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.border}`, background: theme.colors.background, color: theme.colors.textPrimary }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: theme.colors.textSecondary, marginBottom: '8px' }}>Fecha hasta</label>
              <input type="date" style={{ width: '100%', padding: '8px', borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.border}`, background: theme.colors.background, color: theme.colors.textPrimary }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: theme.colors.textSecondary, marginBottom: '8px' }}>Tipo de movimiento</label>
              <select style={{ width: '100%', padding: '8px', borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.border}`, background: theme.colors.background, color: theme.colors.textPrimary }}>
                <option value="">Todos</option>
                <option value="Entrada">Entrada</option>
                <option value="Salida">Salida</option>
                <option value="Reserva">Reserva</option>
                <option value="Ajuste">Ajuste</option>
                <option value="Liberacion">Liberación</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: theme.colors.textSecondary, marginBottom: '8px' }}>Usuario</label>
              <input type="text" placeholder="Filtrar por usuario" style={{ width: '100%', padding: '8px', borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.border}`, background: theme.colors.background, color: theme.colors.textPrimary }} />
            </div>
          </div>
          <div style={{ marginTop: theme.spacing.md, display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{ background: theme.colors.primary, color: theme.colors.textOnPrimary, padding: '8px 12px', borderRadius: theme.borderRadius.md, border: 'none' }}>Aplicar Filtros</button>
          </div>
        </div>

        {/* Tabla de movimientos */}
        <div style={{ backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.sm, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: theme.colors.textPrimary }}>
              <thead style={{ backgroundColor: theme.colors.darkBgSecondary }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fecha y Hora</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Producto</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tipo</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cambio</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Usuario</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((movimiento, index) => (
                  <tr key={index} style={{ borderBottom: `1px solid ${theme.colors.border}`, backgroundColor: index % 2 === 0 ? theme.colors.surface : theme.colors.darkBg }}>
                    <td style={{ padding: '12px', color: theme.colors.textSecondary }}>{movimiento.timestamp}</td>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.textPrimary }}>{movimiento.producto}</div>
                        <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>{movimiento.sku}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, background: getTipoColor(movimiento.tipo).background, color: getTipoColor(movimiento.tipo).color }}>{movimiento.tipo}</span>
                    </td>
                    <td style={{ padding: '12px', color: getCambioColor(movimiento.cambio), fontWeight: 600 }}>{movimiento.cambio > 0 ? '+' : ''}{movimiento.cambio}</td>
                    <td style={{ padding: '12px', color: theme.colors.textSecondary }}>{movimiento.usuario}</td>
                    <td style={{ padding: '12px', color: theme.colors.textSecondary }}>{movimiento.motivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        <div style={{ backgroundColor: theme.colors.surface, padding: '12px', borderTop: `1px solid ${theme.colors.border}`, borderRadius: `0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Mostrando 1 a 6 de 342 movimientos</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ padding: '6px 10px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.sm, background: 'transparent', color: theme.colors.textPrimary }}>Anterior</button>
              <button style={{ padding: '6px 10px', borderRadius: theme.borderRadius.sm, background: theme.colors.primary, color: theme.colors.textOnPrimary }}>1</button>
              <button style={{ padding: '6px 10px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.sm, background: 'transparent', color: theme.colors.textPrimary }}>2</button>
              <button style={{ padding: '6px 10px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.sm, background: 'transparent', color: theme.colors.textPrimary }}>3</button>
              <button style={{ padding: '6px 10px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.sm, background: 'transparent', color: theme.colors.textPrimary }}>Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
