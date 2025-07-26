-- Tabla de Roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de Usuarios del sistema
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  contrasena TEXT NOT NULL,
  rol_id INTEGER REFERENCES roles(id),
  estado BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Categorías
CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT
);

-- Tabla de Subcategorías
CREATE TABLE subcategorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  categoria_id INTEGER REFERENCES categorias(id) ON DELETE CASCADE
);

-- Tabla de Proveedores
CREATE TABLE proveedores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  telefono VARCHAR(30),
  correo VARCHAR(100),
  direccion TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10,2) NOT NULL,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  imagen_url TEXT,
  categoria_id INTEGER REFERENCES categorias(id),
  subcategoria_id INTEGER REFERENCES subcategorias(id),
  proveedor_id INTEGER REFERENCES proveedores(id),
  estado BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Movimientos (entradas/salidas de inventario)
CREATE TABLE movimientos (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER REFERENCES productos(id),
  tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('entrada', 'salida')),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  descripcion TEXT,
  usuario_id INTEGER REFERENCES usuarios(id),
  proveedor_id INTEGER REFERENCES proveedores(id),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Historial de Stock (auditoría)
CREATE TABLE historial_stock (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER REFERENCES productos(id),
  stock_anterior INTEGER,
  stock_nuevo INTEGER,
  motivo TEXT,
  usuario_id INTEGER REFERENCES usuarios(id),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
