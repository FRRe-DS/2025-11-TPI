-- PostgreSQL Database Schema for Stock Management System

-- Create database (run this manually first)
-- CREATE DATABASE stock_management;

-- Drop tables if they exist (for development)
DROP TABLE IF EXISTS reserva_productos;
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS producto_categorias;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    stock_disponible INTEGER NOT NULL DEFAULT 0 CHECK (stock_disponible >= 0),
    peso_kg DECIMAL(8,3) CHECK (peso_kg >= 0),
    dimensiones JSONB, -- {largoCm, anchoCm, altoCm}
    ubicacion JSONB,   -- {street, city, state, postal_code, country}
    imagenes JSONB,    -- array of {url, esPrincipal}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product-Category junction table (many-to-many relationship)
CREATE TABLE producto_categorias (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL,
    categoria_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    UNIQUE(producto_id, categoria_id)
);

-- Reservations table
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    id_compra VARCHAR(255) NOT NULL UNIQUE,
    usuario_id INTEGER NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('pendiente', 'confirmado', 'cancelado')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    motivo_cancelacion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reservation products table (items in a reservation)
CREATE TABLE reserva_productos (
    id SERIAL PRIMARY KEY,
    reserva_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    UNIQUE(reserva_id, producto_id)
);

-- Indexes for better performance
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_productos_precio ON productos(precio);
CREATE INDEX idx_productos_stock ON productos(stock_disponible);
CREATE INDEX idx_producto_categorias_producto ON producto_categorias(producto_id);
CREATE INDEX idx_producto_categorias_categoria ON producto_categorias(categoria_id);
CREATE INDEX idx_reservas_usuario ON reservas(usuario_id);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_reservas_expires ON reservas(expires_at);
CREATE INDEX idx_reserva_productos_reserva ON reserva_productos(reserva_id);
CREATE INDEX idx_reserva_productos_producto ON reserva_productos(producto_id);

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservas_updated_at BEFORE UPDATE ON reservas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO categorias (nombre, descripcion) VALUES
    ('Electrónicos', 'Productos electrónicos y tecnológicos'),
    ('Ropa', 'Vestimenta y accesorios'),
    ('Hogar', 'Artículos para el hogar y decoración'),
    ('Deportes', 'Equipamiento deportivo y fitness'),
    ('Libros', 'Libros físicos y digitales');

INSERT INTO productos (nombre, descripcion, precio, stock_disponible, peso_kg, dimensiones, ubicacion, imagenes) VALUES
    (
        'Laptop Gaming RGB',
        'Laptop para gaming con iluminación RGB y procesador de alta gama',
        1299.99,
        15,
        2.5,
        '{"largoCm": 35, "anchoCm": 25, "altoCm": 3}',
        '{"street": "Av. Corrientes 1234", "city": "Buenos Aires", "state": "CABA", "postal_code": "C1043AAZ", "country": "AR"}',
        '[{"url": "https://example.com/laptop1.jpg", "esPrincipal": true}, {"url": "https://example.com/laptop2.jpg", "esPrincipal": false}]'
    ),
    (
        'Camiseta Deportiva',
        'Camiseta transpirable para actividades deportivas',
        29.99,
        100,
        0.2,
        '{"largoCm": 70, "anchoCm": 50, "altoCm": 1}',
        '{"street": "Av. Santa Fe 5678", "city": "Buenos Aires", "state": "CABA", "postal_code": "C1425BGH", "country": "AR"}',
        '[{"url": "https://example.com/shirt1.jpg", "esPrincipal": true}]'
    ),
    (
        'Mesa de Comedor',
        'Mesa de madera maciza para 6 personas',
        599.00,
        8,
        25.0,
        '{"largoCm": 180, "anchoCm": 90, "altoCm": 75}',
        '{"street": "Av. Cabildo 9876", "city": "Buenos Aires", "state": "CABA", "postal_code": "C1426AAA", "country": "AR"}',
        '[{"url": "https://example.com/table1.jpg", "esPrincipal": true}]'
    );

-- Assign categories to products
INSERT INTO producto_categorias (producto_id, categoria_id) VALUES
    (1, 1), -- Laptop -> Electrónicos
    (2, 2), -- Camiseta -> Ropa
    (2, 4), -- Camiseta -> Deportes
    (3, 3); -- Mesa -> Hogar

-- Create a view for easier product querying with categories
CREATE OR REPLACE VIEW productos_con_categorias AS
SELECT 
    p.id,
    p.nombre,
    p.descripcion,
    p.precio,
    p.stock_disponible,
    p.peso_kg,
    p.dimensiones,
    p.ubicacion,
    p.imagenes,
    p.created_at,
    p.updated_at,
    COALESCE(
        json_agg(
            CASE WHEN c.id IS NOT NULL 
            THEN json_build_object('id', c.id, 'nombre', c.nombre, 'descripcion', c.descripcion)
            ELSE NULL END
        ) FILTER (WHERE c.id IS NOT NULL), 
        '[]'::json
    ) as categorias
FROM productos p
LEFT JOIN producto_categorias pc ON p.id = pc.producto_id
LEFT JOIN categorias c ON pc.categoria_id = c.id
GROUP BY p.id, p.nombre, p.descripcion, p.precio, p.stock_disponible, p.peso_kg, p.dimensiones, p.ubicacion, p.imagenes, p.created_at, p.updated_at;
