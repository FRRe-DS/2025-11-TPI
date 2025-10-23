'use client';

import { useApiOperations } from '@/lib/useAuthenticatedApi';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion?: string;
}

export function ProductosExample() {
  const { data: session } = useSession();
  const { get, post, isAuthenticated, isLoading } = useApiOperations();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar productos
  const loadProductos = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await get<{data: Producto[]}>('/api/productos');
      setProductos(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar productos');
      console.error('Error loading productos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para crear un producto de ejemplo
  const createExampleProducto = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newProducto = {
        nombre: `Producto ${Date.now()}`,
        precio: Math.floor(Math.random() * 1000) + 100,
        descripcion: 'Producto creado desde el frontend autenticado',
        stockInicial: 10
      };
      
      await post('/api/productos', newProducto);
      await loadProductos(); // Recargar la lista
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear producto');
      console.error('Error creating producto:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      loadProductos();
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Autenticación Requerida
          </h3>
          <p className="text-yellow-700">
            Por favor, inicia sesión con Keycloak para acceder a los productos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
          <p className="text-gray-600">
            Usuario autenticado: <span className="font-medium">{session.user?.name}</span>
          </p>
          {session.user?.roles && session.user.roles.length > 0 && (
            <p className="text-sm text-gray-500">
              Roles: {session.user.roles.join(', ')}
            </p>
          )}
        </div>
        <button
          onClick={createExampleProducto}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Creando...' : 'Crear Producto de Ejemplo'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadProductos}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Lista de Productos ({productos.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando productos...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay productos disponibles
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {productos.map((producto) => (
              <div key={producto.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {producto.nombre}
                    </h4>
                    {producto.descripcion && (
                      <p className="text-gray-600 mt-1">{producto.descripcion}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ${producto.precio.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">ID: {producto.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
