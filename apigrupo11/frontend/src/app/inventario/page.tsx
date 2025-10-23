'use client';

import React, { useEffect, useState } from 'react';
import type { IProducto } from '../../types/api.types';
import MainLayout from '../../components/layout/MainLayoutNext';
import { AddProductForm } from '../../components/inventory/AddProductForm';

export default function InventoryPage() {
  const [productos, setProductos] = useState<IProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Datos de ejemplo para mostrar la página
    const mockProducts: IProducto[] = [
      {
        id: 1,
        nombre: "Laptop Pro 15",
        descripcion: "Laptop profesional de alto rendimiento",
        precio: 1299.99,
        stockDisponible: 25,
        stockReservado: 5,
        stockTotal: 30,
        vendedorId: 1,
        categoriaId: 1,
        categoria: "Electrónicos",
        pesoKg: 2.1,
        fechaCreacion: "2025-01-15T10:00:00Z",
        fechaActualizacion: "2025-10-20T15:30:00Z",
        imagenes: []
      },
      {
        id: 2,
        nombre: "Mouse Inalámbrico",
        descripcion: "Mouse ergonómico con conectividad Bluetooth",
        precio: 45.99,
        stockDisponible: 150,
        stockReservado: 10,
        stockTotal: 160,
        vendedorId: 1,
        categoriaId: 1,
        categoria: "Accesorios",
        pesoKg: 0.12,
        fechaCreacion: "2025-02-01T09:00:00Z",
        fechaActualizacion: "2025-10-18T11:45:00Z",
        imagenes: []
      }
    ];
    
    setTimeout(() => {
      setProductos(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
            <p className="text-gray-600">Gestión de productos y stock</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Agregar Producto
          </button>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">Cargando productos...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productos.map((producto) => (
                    <tr key={producto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {producto.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {producto.descripcion}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {producto.categoria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Disponible: {producto.stockDisponible}</div>
                          <div className="text-gray-500">Reservado: {producto.stockReservado}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${producto.precio.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          Editar
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal para agregar producto */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Agregar Nuevo Producto</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <AddProductForm onClose={() => setShowAddForm(false)} />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
