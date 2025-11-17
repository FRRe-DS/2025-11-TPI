// src/pages/AuditPage.tsx
import React from "react";
import { theme } from '../styles/theme';

interface Movimiento {
  timestamp: string;
  producto: string;
  sku: string;
  tipo: "Entrada" | "Salida" | "Reserva" | "Ajuste" | "Liberacion";
  cambio: number;
  usuario: string;
  motivo: string;
}

const AuditPage: React.FC = () => {
  const movimientos: Movimiento[] = [
    {
      timestamp: "2025-10-18 14:30:15",
      producto: "Laptop Pro 15”",
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
      timestamp: "2025-10-16 09:00:00",
      producto: "Laptop Pro 15”",
      sku: "LPT-15-69-512",
      tipo: "Liberacion",
      cambio: 1,
      usuario: "sistema",
      motivo: "Reserva expirada",
    },
  ];

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "Entrada":
        return "#27ae60";
      case "Salida":
        return "#e74c3c";
      case "Reserva":
        return "#2980b9";
      case "Ajuste":
        return "#f39c12";
      case "Liberacion":
        return "#8e44ad";
      default:
        return "#7f8c8d";
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: theme.colors.background, minHeight: '100vh' }}>
      <h1 style={{ fontSize: '30px', fontWeight: 700, color: theme.colors.textPrimary }}>
        Gestión de Auditoría
      </h1>
      <p style={{ marginTop: '1rem', color: theme.colors.textSecondary }}>
        Lista de movimientos recientes del stock.
      </p>

      <div style={{ marginTop: '2rem', overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: theme.colors.surface,
            boxShadow: theme.shadows.sm,
            borderRadius: '10px',
            overflow: 'hidden',
            color: theme.colors.textPrimary,
          }}
        >
          <thead style={{ backgroundColor: theme.colors.darkBgSecondary, color: theme.colors.textPrimary }}>
            <tr>
              <th style={{ padding: "12px" }}>Timestamp</th>
              <th style={{ padding: "12px" }}>Producto (SKU)</th>
              <th style={{ padding: "12px" }}>Tipo</th>
              <th style={{ padding: "12px" }}>Cambio</th>
              <th style={{ padding: "12px" }}>Usuario</th>
              <th style={{ padding: "12px" }}>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((mov, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: `1px solid ${theme.colors.border}`,
                  backgroundColor: index % 2 === 0 ? theme.colors.surface : theme.colors.darkBg,
                }}
              >
                <td style={{ padding: '10px 12px', color: theme.colors.textSecondary }}>{mov.timestamp}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: theme.colors.textPrimary }}>
                  {mov.producto}{' '}
                  <span style={{ color: theme.colors.textSecondary, fontSize: '13px' }}>({mov.sku})</span>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span
                    style={{
                      backgroundColor: getTipoColor(mov.tipo),
                      color: theme.colors.textOnPrimary,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    {mov.tipo}
                  </span>
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    color: mov.cambio > 0 ? theme.colors.success : theme.colors.danger,
                    fontWeight: 600,
                  }}
                >
                  {mov.cambio > 0 ? `+${mov.cambio}` : mov.cambio}
                </td>
                <td style={{ padding: '10px 12px', color: theme.colors.textSecondary }}>{mov.usuario}</td>
                <td style={{ padding: '10px 12px', color: theme.colors.textSecondary }}>{mov.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Cambia la exportación a default
export default AuditPage;
