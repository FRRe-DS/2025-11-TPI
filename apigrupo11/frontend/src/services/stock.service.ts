import type { IProducto, IApiListResponse } from '../types/api.types';

export function getProducts(): Promise<IApiListResponse<IProducto>> {
  const mockProducts: IProducto[] = [
    {
      id: 1,
      nombre: 'Laptop Pro X1',
      descripcion: 'Laptop de alto rendimiento para profesionales',
      precio: 1499.99,
      stockDisponible: 15,
      stockReservado: 3,
      stockTotal: 18,
      vendedorId: 1,
      categoriaId: 1,
      categoria: 'Electrónica',
      pesoKg: 1.8,
      fechaCreacion: '2025-01-15T10:00:00Z',
      fechaActualizacion: '2025-09-20T15:30:00Z',
      imagenes: [
        {
          url: 'https://placehold.co/400x400/6366F1/FFFFFF?text=Laptop',
          esPrincipal: true,
        },
      ],
      dimensiones: { largo: 35, ancho: 24, alto: 2 },
      ubicacion: {
        almacen: 'Depo A',
        pasillo: 'A1',
        estante: 'E3',
        nivel: 'N2',
      },
    },
    {
      id: 2,
      nombre: 'Monitor Gamer Curvo 27"',
      descripcion: 'Monitor con alta tasa de refresco para gaming.',
      precio: 399.99,
      stockDisponible: 30,
      stockReservado: 5,
      stockTotal: 35,
      vendedorId: 1,
      categoriaId: 1,
      categoria: 'Electrónica',
      pesoKg: 4.5,
      fechaCreacion: '2025-02-20T11:00:00Z',
      fechaActualizacion: '2025-10-01T12:00:00Z',
      imagenes: [
        {
          url: 'https://placehold.co/400x400/10B981/FFFFFF?text=Monitor',
          esPrincipal: true,
        },
      ],
      dimensiones: { largo: 61, ancho: 45, alto: 18 },
      ubicacion: {
        almacen: 'Depo B',
        pasillo: 'B2',
        estante: 'E1',
        nivel: 'N1',
      },
    },
    {
      id: 3,
      nombre: 'Teclado Mecánico RGB',
      descripcion: 'Teclado con switches Cherry MX Red.',
      precio: 129.99,
      stockDisponible: 0,
      stockReservado: 0,
      stockTotal: 0,
      vendedorId: 2,
      categoriaId: 2,
      categoria: 'Accesorios',
      pesoKg: 0.9,
      fechaCreacion: '2025-03-10T09:00:00Z',
      fechaActualizacion: '2025-08-15T18:00:00Z',
      imagenes: [
        {
          url: 'https://placehold.co/400x400/EF4444/FFFFFF?text=Teclado',
          esPrincipal: true,
        },
      ],
      dimensiones: { largo: 44, ancho: 13, alto: 3 },
      ubicacion: {
        almacen: 'Depo A',
        pasillo: 'A3',
        estante: 'E2',
        nivel: 'N3',
      },
    },
    {
      id: 4,
      nombre: 'Mouse Inalámbrico Pro',
      descripcion: 'Mouse ergonómico con sensor de alta precisión.',
      precio: 79.99,
      stockDisponible: 45,
      stockReservado: 8,
      stockTotal: 53,
      vendedorId: 1,
      categoriaId: 2,
      categoria: 'Accesorios',
      pesoKg: 0.15,
      fechaCreacion: '2025-04-05T14:00:00Z',
      fechaActualizacion: '2025-10-10T09:30:00Z',
      imagenes: [
        {
          url: 'https://placehold.co/400x400/F59E0B/FFFFFF?text=Mouse',
          esPrincipal: true,
        },
      ],
      dimensiones: { largo: 12, ancho: 6, alto: 4 },
      ubicacion: {
        almacen: 'Depo C',
        pasillo: 'C1',
        estante: 'E4',
        nivel: 'N1',
      },
    },
    {
      id: 5,
      nombre: 'Webcam HD 1080p',
      descripcion: 'Cámara web con micrófono integrado y enfoque automático.',
      precio: 89.99,
      stockDisponible: 22,
      stockReservado: 2,
      stockTotal: 24,
      vendedorId: 2,
      categoriaId: 1,
      categoria: 'Electrónica',
      pesoKg: 0.3,
      fechaCreacion: '2025-05-12T08:00:00Z',
      fechaActualizacion: '2025-10-15T16:45:00Z',
      imagenes: [
        {
          url: 'https://placehold.co/400x400/8B5CF6/FFFFFF?text=Webcam',
          esPrincipal: true,
        },
      ],
      dimensiones: { largo: 9, ancho: 7, alto: 6 },
      ubicacion: {
        almacen: 'Depo B',
        pasillo: 'B1',
        estante: 'E2',
        nivel: 'N2',
      },
    },
    {
      id: 6,
      nombre: 'Auriculares Bluetooth',
      descripcion: 'Auriculares inalámbricos con cancelación de ruido activa.',
      precio: 199.99,
      stockDisponible: 8,
      stockReservado: 1,
      stockTotal: 9,
      vendedorId: 1,
      categoriaId: 2,
      categoria: 'Accesorios',
      pesoKg: 0.25,
      fechaCreacion: '2025-06-18T10:30:00Z',
      fechaActualizacion: '2025-10-18T11:20:00Z',
      imagenes: [
        {
          url: 'https://placehold.co/400x400/EC4899/FFFFFF?text=Auriculares',
          esPrincipal: true,
        },
      ],
      dimensiones: { largo: 18, ancho: 16, alto: 8 },
      ubicacion: {
        almacen: 'Depo A',
        pasillo: 'A2',
        estante: 'E1',
        nivel: 'N4',
      },
    },
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: mockProducts,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalItems: mockProducts.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    }, 1000);
  });
}
