-- ===========================
-- Script de inicialización
-- Inventario Ferretería
-- ===========================

-- Crear tabla Roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  contrasena TEXT NOT NULL,
  rol_id INTEGER REFERENCES roles(id),
  estado BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla Categorías
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT
);

-- Crear tabla Subcategorías
CREATE TABLE IF NOT EXISTS subcategorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  categoria_id INTEGER REFERENCES categorias(id) ON DELETE CASCADE
);

-- Crear tabla Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(30),
    correo VARCHAR(100),
    direccion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla Productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    precio_compra NUMERIC(10,2) DEFAULT 0 CHECK (precio_compra >= 0),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    imagen_url TEXT,
    categoria_id INTEGER REFERENCES categorias(id),
    subcategoria_id INTEGER REFERENCES subcategorias(id),
    proveedor_id INTEGER REFERENCES proveedores(id),
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla Movimientos (entradas/salidas)
CREATE TABLE IF NOT EXISTS movimientos (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id),
    tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('entrada', 'salida')),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    descripcion TEXT,
    usuario_id INTEGER REFERENCES usuarios(id),
    proveedor_id INTEGER REFERENCES proveedores(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla Historial Stock
CREATE TABLE IF NOT EXISTS historial_stock (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id),
    stock_anterior INTEGER,
    stock_nuevo INTEGER,
    motivo TEXT,
    usuario_id INTEGER REFERENCES usuarios(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--crear tablas reposiciones
CREATE TABLE IF NOT EXISTS reposiciones (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    proveedor_id INTEGER REFERENCES proveedores(id) ON DELETE SET NULL,
    cantidad_solicitada INTEGER NOT NULL CHECK (cantidad_solicitada > 0),
    precio_unitario NUMERIC(10,2) CHECK (precio_unitario >= 0),
    precio_total NUMERIC(12,2) GENERATED ALWAYS AS (cantidad_solicitada * precio_unitario) STORED,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' 
            CHECK (estado IN ('pendiente', 'recibido', 'cancelado')),
    usuario_id INTEGER REFERENCES usuarios(id), -- quién hizo la solicitud
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_recepcion TIMESTAMP
);

-- ===========================
-- Insertar datos iniciales
-- ===========================

-- Roles base
INSERT INTO roles (nombre) VALUES
('Administrador'),
('Encargado')
ON CONFLICT (nombre) DO NOTHING;

-- Usuario Administrador por defecto
-- La contraseña debe estar encriptada en bcrypt.
-- Supongamos que la contraseña es: admin123
-- Hash bcrypt: $2b$10$XlWSGZaG9oEwUOQJH8L4p.RjS6MBVtthW4AGX1OfqXrX9q.gqxCyS

INSERT INTO usuarios (nombre, correo, contrasena, rol_id)
VALUES ('Admin', 'admin@ferreteria.com',
        '$2b$10$XlWSGZaG9oEwUOQJH8L4p.RjS6MBVtthW4AGX1OfqXrX9q.gqxCyS',
        (SELECT id FROM roles WHERE nombre = 'Administrador'))
ON CONFLICT (correo) DO NOTHING;
