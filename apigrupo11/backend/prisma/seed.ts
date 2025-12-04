import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['info', 'warn', 'error'],
});

async function main() {
  console.log('🌱 Starting seed...');

  // Limpiar datos existentes y reiniciar secuencias usando TRUNCATE CASCADE
  // TRUNCATE es más eficiente que deleteMany() y automáticamente reinicia las secuencias
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "reserva_productos" RESTART IDENTITY CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "reservas" RESTART IDENTITY CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "producto_categorias" RESTART IDENTITY CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "productos" RESTART IDENTITY CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "categorias" RESTART IDENTITY CASCADE');

  console.log('✅ Cleared existing data and reset sequences');

  // Insertar categorías
  const categorias = [
    { nombre: 'Electrónicos', descripcion: 'Productos electrónicos y tecnológicos' },
    { nombre: 'Ropa', descripcion: 'Vestimenta y accesorios' },
    { nombre: 'Hogar', descripcion: 'Artículos para el hogar y decoración' },
    { nombre: 'Deportes', descripcion: 'Equipamiento deportivo y fitness' },
    { nombre: 'Libros', descripcion: 'Libros físicos y digitales' },
    { nombre: 'Juguetes', descripcion: 'Juguetes para niños y coleccionables' },
    { nombre: 'Alimentos', descripcion: 'Productos alimenticios y bebidas' },
    { nombre: 'Belleza', descripcion: 'Productos de cuidado personal y cosmética' },
    { nombre: 'Automotriz', descripcion: 'Accesorios y repuestos para vehículos' },
    { nombre: 'Mascotas', descripcion: 'Productos para el cuidado de mascotas' },
    { nombre: 'Música', descripcion: 'Instrumentos musicales y accesorios' },
    { nombre: 'Jardín', descripcion: 'Herramientas y decoración para jardín' },
    { nombre: 'Oficina', descripcion: 'Artículos de papelería y oficina' },
    { nombre: 'Salud', descripcion: 'Productos para el cuidado de la salud' },
    { nombre: 'Bebés', descripcion: 'Productos para bebés y maternidad' },
  ];

  const categoriasCreadas = await Promise.all(
    categorias.map(cat => prisma.categoria.create({ data: cat }))
  );

  console.log(`✅ Created ${categoriasCreadas.length} categories`);

  // Crear mapa de categorías
  const catMap: { [key: string]: number } = {};
  categoriasCreadas.forEach((cat, idx) => {
    catMap[categorias[idx].nombre] = cat.id;
  });

  // Insertar productos con sus categorías
  const productosConCategorias = [
    { nombre: 'Laptop Gaming RGB', descripcion: 'Laptop para gaming con iluminación RGB y procesador de alta gama', precio: 1299.99, stock: 15, peso: 2.5, dimensiones: { largoCm: 35, anchoCm: 25, altoCm: 3 }, ubicacion: { street: 'Av. Corrientes 1234', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1043AAZ', country: 'AR' }, imagenes: [{ url: 'https://example.com/laptop1.jpg', esPrincipal: true }], categorias: ['Electrónicos'] },
    { nombre: 'Camiseta Deportiva', descripcion: 'Camiseta transpirable para actividades deportivas', precio: 29.99, stock: 100, peso: 0.2, dimensiones: { largoCm: 70, anchoCm: 50, altoCm: 1 }, ubicacion: { street: 'Av. Santa Fe 5678', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1425BGH', country: 'AR' }, imagenes: [{ url: 'https://example.com/shirt1.jpg', esPrincipal: true }], categorias: ['Ropa', 'Deportes'] },
    { nombre: 'Mesa de Comedor', descripcion: 'Mesa de madera maciza para 6 personas', precio: 599.00, stock: 8, peso: 25.0, dimensiones: { largoCm: 180, anchoCm: 90, altoCm: 75 }, ubicacion: { street: 'Av. Cabildo 9876', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1426AAA', country: 'AR' }, imagenes: [{ url: 'https://example.com/table1.jpg', esPrincipal: true }], categorias: ['Hogar'] },
    { nombre: 'Smartphone X Pro', descripcion: 'Teléfono inteligente con cámara de 108MP y pantalla AMOLED', precio: 899.99, stock: 50, peso: 0.19, dimensiones: { largoCm: 16, anchoCm: 7.5, altoCm: 0.8 }, ubicacion: { street: 'Av. Corrientes 1234', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1043AAZ', country: 'AR' }, imagenes: [{ url: 'https://example.com/phone1.jpg', esPrincipal: true }], categorias: ['Electrónicos'] },
    { nombre: 'Auriculares Bluetooth', descripcion: 'Auriculares inalámbricos con cancelación de ruido activa', precio: 199.99, stock: 75, peso: 0.25, dimensiones: { largoCm: 20, anchoCm: 18, altoCm: 8 }, ubicacion: { street: 'Av. Corrientes 1234', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1043AAZ', country: 'AR' }, imagenes: [{ url: 'https://example.com/headphones1.jpg', esPrincipal: true }], categorias: ['Electrónicos'] },
    { nombre: 'Jean Classic Fit', descripcion: 'Pantalón jean clásico de algodón premium', precio: 59.99, stock: 120, peso: 0.5, dimensiones: { largoCm: 100, anchoCm: 40, altoCm: 2 }, ubicacion: { street: 'Av. Santa Fe 5678', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1425BGH', country: 'AR' }, imagenes: [{ url: 'https://example.com/jeans1.jpg', esPrincipal: true }], categorias: ['Ropa'] },
    { nombre: 'Zapatillas Running', descripcion: 'Zapatillas deportivas con tecnología de amortiguación', precio: 89.99, stock: 60, peso: 0.4, dimensiones: { largoCm: 30, anchoCm: 20, altoCm: 12 }, ubicacion: { street: 'Av. Santa Fe 5678', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1425BGH', country: 'AR' }, imagenes: [{ url: 'https://example.com/shoes1.jpg', esPrincipal: true }], categorias: ['Ropa', 'Deportes'] },
    { nombre: 'Silla Ergonómica', descripcion: 'Silla de oficina con soporte lumbar ajustable', precio: 249.99, stock: 30, peso: 15.0, dimensiones: { largoCm: 65, anchoCm: 65, altoCm: 120 }, ubicacion: { street: 'Av. Cabildo 9876', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1426AAA', country: 'AR' }, imagenes: [{ url: 'https://example.com/chair1.jpg', esPrincipal: true }], categorias: ['Hogar', 'Oficina'] },
    { nombre: 'Lámpara LED Moderna', descripcion: 'Lámpara de pie con control de intensidad y temperatura de color', precio: 79.99, stock: 45, peso: 2.5, dimensiones: { largoCm: 30, anchoCm: 30, altoCm: 150 }, ubicacion: { street: 'Av. Cabildo 9876', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1426AAA', country: 'AR' }, imagenes: [{ url: 'https://example.com/lamp1.jpg', esPrincipal: true }], categorias: ['Hogar'] },
    { nombre: 'Pelota de Fútbol', descripcion: 'Pelota oficial de fútbol tamaño 5', precio: 34.99, stock: 150, peso: 0.43, dimensiones: { largoCm: 22, anchoCm: 22, altoCm: 22 }, ubicacion: { street: 'Av. Santa Fe 5678', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1425BGH', country: 'AR' }, imagenes: [{ url: 'https://example.com/ball1.jpg', esPrincipal: true }], categorias: ['Deportes'] },
    { nombre: 'Bicicleta Mountain Bike', descripcion: 'Bicicleta de montaña con 21 velocidades y suspensión', precio: 449.99, stock: 12, peso: 14.0, dimensiones: { largoCm: 180, anchoCm: 65, altoCm: 110 }, ubicacion: { street: 'Av. Santa Fe 5678', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1425BGH', country: 'AR' }, imagenes: [{ url: 'https://example.com/bike1.jpg', esPrincipal: true }], categorias: ['Deportes'] },
    { nombre: 'El Principito', descripcion: 'Clásico de la literatura universal', precio: 15.99, stock: 200, peso: 0.15, dimensiones: { largoCm: 20, anchoCm: 13, altoCm: 1 }, ubicacion: { street: 'Av. Corrientes 1234', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1043AAZ', country: 'AR' }, imagenes: [{ url: 'https://example.com/book1.jpg', esPrincipal: true }], categorias: ['Libros'] },
    { nombre: 'Cien Años de Soledad', descripcion: 'Obra maestra de Gabriel García Márquez', precio: 18.99, stock: 180, peso: 0.35, dimensiones: { largoCm: 23, anchoCm: 15, altoCm: 3 }, ubicacion: { street: 'Av. Corrientes 1234', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1043AAZ', country: 'AR' }, imagenes: [{ url: 'https://example.com/book2.jpg', esPrincipal: true }], categorias: ['Libros'] },
    { nombre: 'Lego Star Wars Set', descripcion: 'Set de construcción Lego de 500 piezas', precio: 79.99, stock: 40, peso: 0.8, dimensiones: { largoCm: 35, anchoCm: 25, altoCm: 10 }, ubicacion: { street: 'Av. Cabildo 9876', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1426AAA', country: 'AR' }, imagenes: [{ url: 'https://example.com/lego1.jpg', esPrincipal: true }], categorias: ['Juguetes'] },
    { nombre: 'Muñeca Barbie', descripcion: 'Muñeca Barbie edición especial con accesorios', precio: 29.99, stock: 90, peso: 0.3, dimensiones: { largoCm: 30, anchoCm: 15, altoCm: 8 }, ubicacion: { street: 'Av. Cabildo 9876', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1426AAA', country: 'AR' }, imagenes: [{ url: 'https://example.com/barbie1.jpg', esPrincipal: true }], categorias: ['Juguetes'] },
    { nombre: 'Café Colombiano Premium', descripcion: 'Café en grano 100% arábica de origen colombiano - 500g', precio: 24.99, stock: 250, peso: 0.5, dimensiones: { largoCm: 20, anchoCm: 10, altoCm: 8 }, ubicacion: { street: 'Av. Santa Fe 5678', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1425BGH', country: 'AR' }, imagenes: [{ url: 'https://example.com/coffee1.jpg', esPrincipal: true }], categorias: ['Alimentos'] },
    { nombre: 'Aceite de Oliva Extra Virgen', descripcion: 'Aceite de oliva premium - 1 litro', precio: 19.99, stock: 100, peso: 1.0, dimensiones: { largoCm: 25, anchoCm: 8, altoCm: 8 }, ubicacion: { street: 'Av. Santa Fe 5678', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1425BGH', country: 'AR' }, imagenes: [{ url: 'https://example.com/oil1.jpg', esPrincipal: true }], categorias: ['Alimentos'] },
    { nombre: 'Crema Facial Antiarrugas', descripcion: 'Crema facial con ácido hialurónico y colágeno - 50ml', precio: 39.99, stock: 80, peso: 0.1, dimensiones: { largoCm: 8, anchoCm: 8, altoCm: 6 }, ubicacion: { street: 'Av. Cabildo 9876', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1426AAA', country: 'AR' }, imagenes: [{ url: 'https://example.com/cream1.jpg', esPrincipal: true }], categorias: ['Belleza'] },
    { nombre: 'Shampoo Reparador', descripcion: 'Shampoo para cabello dañado con keratina - 400ml', precio: 14.99, stock: 150, peso: 0.45, dimensiones: { largoCm: 20, anchoCm: 8, altoCm: 8 }, ubicacion: { street: 'Av. Cabildo 9876', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1426AAA', country: 'AR' }, imagenes: [{ url: 'https://example.com/shampoo1.jpg', esPrincipal: true }], categorias: ['Belleza'] },
    { nombre: 'Filtro de Aire Automotriz', descripcion: 'Filtro de aire universal para vehículos', precio: 24.99, stock: 70, peso: 0.3, dimensiones: { largoCm: 25, anchoCm: 20, altoCm: 8 }, ubicacion: { street: 'Av. Corrientes 1234', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1043AAZ', country: 'AR' }, imagenes: [{ url: 'https://example.com/filter1.jpg', esPrincipal: true }], categorias: ['Automotriz'] },
    { nombre: 'Aceite de Motor 10W40', descripcion: 'Aceite sintético para motor - 4 litros', precio: 49.99, stock: 55, peso: 3.5, dimensiones: { largoCm: 25, anchoCm: 15, altoCm: 20 }, ubicacion: { street: 'Av. Corrientes 1234', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1043AAZ', country: 'AR' }, imagenes: [{ url: 'https://example.com/oil-motor1.jpg', esPrincipal: true }], categorias: ['Automotriz'] },
    { nombre: 'Alimento Balanceado para Perros', descripcion: 'Alimento premium para perros adultos - 15kg', precio: 64.99, stock: 45, peso: 15.0, dimensiones: { largoCm: 60, anchoCm: 40, altoCm: 15 }, ubicacion: { street: 'Av. Santa Fe 5678', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1425BGH', country: 'AR' }, imagenes: [{ url: 'https://example.com/dogfood1.jpg', esPrincipal: true }], categorias: ['Mascotas'] },
    { nombre: 'Arena para Gatos', descripcion: 'Arena sanitaria aglutinante sin olor - 10kg', precio: 19.99, stock: 85, peso: 10.0, dimensiones: { largoCm: 45, anchoCm: 30, altoCm: 12 }, ubicacion: { street: 'Av. Santa Fe 5678', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1425BGH', country: 'AR' }, imagenes: [{ url: 'https://example.com/catlitter1.jpg', esPrincipal: true }], categorias: ['Mascotas'] },
    { nombre: 'Guitarra Acústica', descripcion: 'Guitarra acústica de cuerdas de acero con funda', precio: 199.99, stock: 20, peso: 2.0, dimensiones: { largoCm: 100, anchoCm: 38, altoCm: 12 }, ubicacion: { street: 'Av. Corrientes 1234', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1043AAZ', country: 'AR' }, imagenes: [{ url: 'https://example.com/guitar1.jpg', esPrincipal: true }], categorias: ['Música'] },
    { nombre: 'Teclado Musical 61 Teclas', descripcion: 'Teclado electrónico con múltiples sonidos y ritmos', precio: 149.99, stock: 25, peso: 4.5, dimensiones: { largoCm: 95, anchoCm: 35, altoCm: 12 }, ubicacion: { street: 'Av. Corrientes 1234', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1043AAZ', country: 'AR' }, imagenes: [{ url: 'https://example.com/keyboard1.jpg', esPrincipal: true }], categorias: ['Música'] },
    { nombre: 'Set de Herramientas de Jardín', descripcion: 'Kit completo con pala, rastrillo y tijeras de podar', precio: 59.99, stock: 35, peso: 3.0, dimensiones: { largoCm: 90, anchoCm: 30, altoCm: 10 }, ubicacion: { street: 'Av. Cabildo 9876', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1426AAA', country: 'AR' }, imagenes: [{ url: 'https://example.com/gardentools1.jpg', esPrincipal: true }], categorias: ['Jardín'] },
    { nombre: 'Maceta Decorativa Grande', descripcion: 'Maceta de cerámica con plato - 40cm diámetro', precio: 34.99, stock: 50, peso: 5.0, dimensiones: { largoCm: 40, anchoCm: 40, altoCm: 35 }, ubicacion: { street: 'Av. Cabildo 9876', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1426AAA', country: 'AR' }, imagenes: [{ url: 'https://example.com/pot1.jpg', esPrincipal: true }], categorias: ['Jardín'] },
    { nombre: 'Cuaderno Universitario A4', descripcion: 'Cuaderno espiral de 200 hojas rayadas', precio: 8.99, stock: 300, peso: 0.5, dimensiones: { largoCm: 30, anchoCm: 21, altoCm: 2 }, ubicacion: { street: 'Av. Corrientes 1234', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1043AAZ', country: 'AR' }, imagenes: [{ url: 'https://example.com/notebook1.jpg', esPrincipal: true }], categorias: ['Oficina'] },
    { nombre: 'Set de Bolígrafos', descripcion: 'Pack de 12 bolígrafos de colores variados', precio: 12.99, stock: 200, peso: 0.15, dimensiones: { largoCm: 20, anchoCm: 10, altoCm: 2 }, ubicacion: { street: 'Av. Corrientes 1234', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1043AAZ', country: 'AR' }, imagenes: [{ url: 'https://example.com/pens1.jpg', esPrincipal: true }], categorias: ['Oficina'] },
    { nombre: 'Termómetro Digital', descripcion: 'Termómetro infrarrojo sin contacto', precio: 29.99, stock: 100, peso: 0.2, dimensiones: { largoCm: 15, anchoCm: 10, altoCm: 5 }, ubicacion: { street: 'Av. Santa Fe 5678', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1425BGH', country: 'AR' }, imagenes: [{ url: 'https://example.com/thermometer1.jpg', esPrincipal: true }], categorias: ['Salud'] },
    { nombre: 'Vitaminas Multivitamínico', descripcion: 'Suplemento vitamínico completo - 60 comprimidos', precio: 19.99, stock: 120, peso: 0.1, dimensiones: { largoCm: 12, anchoCm: 6, altoCm: 6 }, ubicacion: { street: 'Av. Santa Fe 5678', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1425BGH', country: 'AR' }, imagenes: [{ url: 'https://example.com/vitamins1.jpg', esPrincipal: true }], categorias: ['Salud'] },
    { nombre: 'Pañales Recién Nacido', descripcion: 'Paquete de pañales talla RN - 40 unidades', precio: 24.99, stock: 150, peso: 1.5, dimensiones: { largoCm: 35, anchoCm: 25, altoCm: 15 }, ubicacion: { street: 'Av. Cabildo 9876', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1426AAA', country: 'AR' }, imagenes: [{ url: 'https://example.com/diapers1.jpg', esPrincipal: true }], categorias: ['Bebés'] },
    { nombre: 'Biberón Anticólico', descripcion: 'Biberón de 250ml con sistema anticólico', precio: 14.99, stock: 95, peso: 0.15, dimensiones: { largoCm: 20, anchoCm: 8, altoCm: 8 }, ubicacion: { street: 'Av. Cabildo 9876', city: 'Buenos Aires', state: 'CABA', postal_code: 'C1426AAA', country: 'AR' }, imagenes: [{ url: 'https://example.com/bottle1.jpg', esPrincipal: true }], categorias: ['Bebés'] },
  ];

  for (const prod of productosConCategorias) {
    await prisma.producto.create({
      data: {
        nombre: prod.nombre,
        descripcion: prod.descripcion,
        precio: prod.precio,
        stockDisponible: prod.stock,
        pesoKg: prod.peso,
        dimensiones: prod.dimensiones,
        ubicacion: prod.ubicacion,
        imagenes: prod.imagenes,
        categorias: {
          create: prod.categorias.map(catNombre => ({
            categoriaId: catMap[catNombre]
          }))
        }
      }
    });
  }

  console.log(`✅ Created ${productosConCategorias.length} products with categories`);

  // Crear una reserva de ejemplo
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + 7); // 7 días después

  const reservaEjemplo = await prisma.reserva.create({
    data: {
      idCompra: 'COMPRA-2025-001',
      usuarioId: 1, // ID de usuario de ejemplo
      estado: 'confirmado',
      expiresAt: expires,
      createdAt: now,
      productos: {
        create: [
          {
            productoId: 1,
            productoNombre: 'Laptop Gaming RGB',
            cantidad: 2,
            precioUnitario: 1299.99
          },
          {
            productoId: 5,
            productoNombre: 'Auriculares Bluetooth',
            cantidad: 3,
            precioUnitario: 199.99
          },
          {
            productoId: 12,
            productoNombre: 'El Principito',
            cantidad: 5,
            precioUnitario: 15.99
          }
        ]
      }
    }
  });

  console.log(`✅ Created example reservation with ID: ${reservaEjemplo.id}`);

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
