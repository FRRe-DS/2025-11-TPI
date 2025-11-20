"use client";

import React, { useState, useEffect } from "react";
import { theme } from '../../styles/theme';
import MainLayout from '../../components/layout/MainLayoutNext';

interface Reserva {
  id: number;
  cliente: string;
  productosCant: number;
  productos: { nombre: string; sku: string; cantidad: number }[];
  fecha: string;
  estado: 'Activa' | 'Completada' | 'Cancelada';
}

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function obtenerReservas() {
      try {
        const res = await fetch(
          "http://localhost:3000/api/reservas?usuarioId=1&page=1&limit=20",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        if (!res.ok) throw new Error("Error obteniendo reservas");

        const data = await res.json();
        setReservas(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    obtenerReservas();
  }, []);




  return (
    <MainLayout>
      <div style={{ display: 'block', gap: theme.spacing.lg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: theme.colors.textPrimary }}>Reservas</h1>
            <p style={{ color: theme.colors.textSecondary }}>Listado de reservas: cliente, cantidad de productos reservados y detalles.</p>
          </div>
        </div>

        <div style={{ marginTop: theme.spacing.md, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.sm, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: theme.colors.textPrimary }}>
              <thead style={{ backgroundColor: theme.colors.darkBgSecondary }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Cliente</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Cantidad</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Productos</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Fecha</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{r.cliente}</td>
                    <td style={{ padding: '12px' }}>{r.productosCant}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {r.productos.map((p, idx) => (
                          <div key={idx} style={{ color: theme.colors.textSecondary, fontSize: '13px' }}>
                            {p.nombre} <span style={{ color: theme.colors.textSecondary }}>({p.sku})</span> — x{p.cantidad}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: theme.colors.textSecondary }}>{r.fecha}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '6px 10px', borderRadius: theme.borderRadius.md, backgroundColor: r.estado === 'Activa' ? '#2980b9' : r.estado === 'Completada' ? '#27ae60' : '#95a5a6', color: theme.colors.textOnPrimary, fontWeight: 700, fontSize: '13px' }}>{r.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
