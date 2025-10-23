'use client';

import React from "react";
import MainLayout from '../../components/layout/MainLayoutNext';

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
      case "Entrada":
        return "bg-green-100 text-green-800";
      case "Salida":
        return "bg-red-100 text-red-800";
      case "Reserva":
        return "bg-blue-100 text-blue-800";
      case "Ajuste":
        return "bg-yellow-100 text-yellow-800";
      case "Liberacion":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCambioColor = (cambio: number) => {
    return cambio > 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auditoría</h1>
          <p className="text-gray-600">Registro de movimientos de stock</p>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha desde
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha hasta
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de movimiento
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Todos</option>
                <option value="Entrada">Entrada</option>
                <option value="Salida">Salida</option>
                <option value="Reserva">Reserva</option>
                <option value="Ajuste">Ajuste</option>
                <option value="Liberacion">Liberación</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                placeholder="Filtrar por usuario"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Aplicar Filtros
            </button>
          </div>
        </div>

        {/* Tabla de movimientos */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cambio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimientos.map((movimiento, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movimiento.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {movimiento.producto}
                        </div>
                        <div className="text-sm text-gray-500">
                          {movimiento.sku}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(movimiento.tipo)}`}>
                        {movimiento.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getCambioColor(movimiento.cambio)}`}>
                        {movimiento.cambio > 0 ? '+' : ''}{movimiento.cambio}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movimiento.usuario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movimiento.motivo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Mostrando 1 a 6 de 342 movimientos
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded text-sm">
                Anterior
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm">
                3
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
