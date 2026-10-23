-- ============================================
-- Esquema Kimuka3_db
-- ============================================

CREATE DATABASE IF NOT EXISTS Kimuka3_db
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_spanish_ci;

USE Kimuka3_db;

-- Roles
CREATE TABLE Rol (
    idRol VARCHAR(10) PRIMARY KEY,
    nombreRol VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- Estados de Usuario
CREATE TABLE Estado_Usuario (
    idEstado VARCHAR(10) PRIMARY KEY,
    nombreEstado VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- Usuarios
CREATE TABLE Usuario (
    idUsuario VARCHAR(10) PRIMARY KEY,
    pNombre VARCHAR(50),
    sNombre VARCHAR(50),
    pApellido VARCHAR(50),
    sApellido VARCHAR(50),
    correo VARCHAR(100) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    idRol VARCHAR(10),
    idEstado VARCHAR(10),
    CONSTRAINT fk_usuario_rol FOREIGN KEY (idRol) REFERENCES Rol(idRol) ON UPDATE CASCADE,
    CONSTRAINT fk_usuario_estado FOREIGN KEY (idEstado) REFERENCES Estado_Usuario(idEstado) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Categorías
CREATE TABLE Categoria (
    idCategoria VARCHAR(10) PRIMARY KEY,
    nombreCategoria VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- Unidades de Medida
CREATE TABLE Unidad_Medida (
    idUnidad VARCHAR(10) PRIMARY KEY,
    nombreUnidad VARCHAR(50)
) ENGINE=InnoDB;

-- Insumos
CREATE TABLE Insumo (
    idInsumo VARCHAR(10) PRIMARY KEY,
    nombreInsumo VARCHAR(100),
    idCategoria VARCHAR(10),
    idUnidad VARCHAR(10),
    CONSTRAINT fk_insumo_categoria FOREIGN KEY (idCategoria) REFERENCES Categoria(idCategoria),
    CONSTRAINT fk_insumo_unidad FOREIGN KEY (idUnidad) REFERENCES Unidad_Medida(idUnidad)
) ENGINE=InnoDB;

-- Productos
CREATE TABLE Producto (
    idProducto VARCHAR(10) PRIMARY KEY,
    nombreProducto VARCHAR(100),
    talla VARCHAR(10),
    color VARCHAR(50)
) ENGINE=InnoDB;

-- Ficha Técnica (Producto <-> Insumo)
CREATE TABLE Ficha_Tecnica (
    idFicha VARCHAR(10) PRIMARY KEY,
    idProducto VARCHAR(10),
    idInsumo VARCHAR(10),
    cantidadNecesaria DECIMAL(10,2),
    CONSTRAINT fk_ficha_producto FOREIGN KEY (idProducto) REFERENCES Producto(idProducto) ON DELETE CASCADE,
    CONSTRAINT fk_ficha_insumo FOREIGN KEY (idInsumo) REFERENCES Insumo(idInsumo) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Clientes
CREATE TABLE Cliente (
    idCliente VARCHAR(10) PRIMARY KEY,
    nombreCliente VARCHAR(100),
    telefono BIGINT
) ENGINE=InnoDB;

-- Órdenes de Producción
CREATE TABLE Orden_Produccion (
    idOrden VARCHAR(10) PRIMARY KEY,
    idCliente VARCHAR(10),
    idUsuario_Admin VARCHAR(10),
    fechaPedido DATE,
    estadoProd VARCHAR(50),
    CONSTRAINT fk_orden_cliente FOREIGN KEY (idCliente) REFERENCES Cliente(idCliente),
    CONSTRAINT fk_orden_usuario FOREIGN KEY (idUsuario_Admin) REFERENCES Usuario(idUsuario)
) ENGINE=InnoDB;

-- Detalle de Órdenes
CREATE TABLE Detalle_Orden (
    idDetalle VARCHAR(10) PRIMARY KEY,
    idOrden VARCHAR(10),
    idProducto VARCHAR(10),
    cantidadTotal INT,
    CONSTRAINT fk_detalle_orden FOREIGN KEY (idOrden) REFERENCES Orden_Produccion(idOrden) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (idProducto) REFERENCES Producto(idProducto)
) ENGINE=InnoDB;

-- Métodos de Pago
CREATE TABLE Metodo_Pago (
    idMetodo VARCHAR(10) PRIMARY KEY,
    nombreMetodo VARCHAR(50)
) ENGINE=InnoDB;

-- Jornadas Laborales
CREATE TABLE Jornada_Laboral (
    idJornada VARCHAR(10) PRIMARY KEY,
    idUsuario_Empleado VARCHAR(10),
    fecha DATE,
    hInicio TIME,
    hFin TIME,
    CONSTRAINT fk_jornada_usuario FOREIGN KEY (idUsuario_Empleado) REFERENCES Usuario(idUsuario)
) ENGINE=InnoDB;

-- Pagos
CREATE TABLE Pago (
    idPago VARCHAR(10) PRIMARY KEY,
    idJornada VARCHAR(10),
    idUsuario_Admin VARCHAR(10),
    montoPagado DECIMAL(10,2),
    idMetodo VARCHAR(10),
    fechaPago DATE,
    CONSTRAINT fk_pago_jornada FOREIGN KEY (idJornada) REFERENCES Jornada_Laboral(idJornada),
    CONSTRAINT fk_pago_usuario FOREIGN KEY (idUsuario_Admin) REFERENCES Usuario(idUsuario),
    CONSTRAINT fk_pago_metodo FOREIGN KEY (idMetodo) REFERENCES Metodo_Pago(idMetodo)
) ENGINE=InnoDB;
