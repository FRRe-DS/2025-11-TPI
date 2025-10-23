'use client';

import Navbar from '@/components/Navbar';
import { ProductosExample } from '@/components/ProductosExample';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Sistema de Gestión - Grupo 11
            </h1>
            <p className="text-gray-600 mt-2">
              Integración con Keycloak para autenticación de APIs
            </p>
          </div>

          {session ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  ✅ Sesión Activa
                </h3>
                <p className="text-green-700">
                  Autenticado como: <span className="font-medium">{session.user?.name}</span>
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Access Token: {session.accessToken ? '***' + session.accessToken.slice(-10) : 'No disponible'}
                </p>
              </div>
              
              <ProductosExample />
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-blue-800 mb-4">
                Bienvenido al Sistema de Gestión
              </h3>
              <p className="text-blue-700 mb-4">
                Para acceder a las funcionalidades del sistema, necesitas iniciar sesión con Keycloak.
              </p>
              <div className="bg-white rounded-lg p-4 text-left">
                <h4 className="font-medium text-gray-900 mb-2">Funcionalidades disponibles:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Gestión de productos con autenticación</li>
                  <li>• APIs protegidas con tokens JWT</li>
                  <li>• Control de acceso basado en roles</li>
                  <li>• Integración completa con Keycloak</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
