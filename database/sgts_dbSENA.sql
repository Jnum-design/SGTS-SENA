-- ==========================================================
-- BASE DE DATOS: SGTS (Sistema de Gestion de Tickets de Soporte)
-- SENA - Ficha 3176597
-- Motor: MySQL 8.x (MySQL Workbench)
--
-- Incluye:
--   1. Esquema normalizado (con categorias, calificacion y
--      codigos de recuperacion de contrasena)
--   2. Datos iniciales de prueba (seed)
--
-- Se puede ejecutar completo y desde cero: elimina y vuelve a
-- crear la base sgts_db. NO ejecutar sobre datos que se quieran
-- conservar.
--
-- Usuarios de prueba (contrasena de todos: Sgts2026*)
--   admin@sgts.local         -> administrador
--   carlos.ruiz@sgts.local   -> tecnico
--   marta.diaz@sgts.local    -> tecnico
--   andres.perez@sgts.local  -> usuario
--   sofia.torres@sgts.local  -> usuario
--   luis.ramirez@sgts.local  -> usuario
-- ==========================================================

DROP DATABASE IF EXISTS sgts_db;

CREATE DATABASE sgts_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE sgts_db;

SET NAMES utf8mb4;

-- ==========================================================
-- 1. TABLAS MAESTRAS (SIN DEPENDENCIAS)
-- ==========================================================

CREATE TABLE Departamento (
    id_departamento INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
) ENGINE=InnoDB;

CREATE TABLE SLA (
    id_sla INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tiempo_respuesta INT NOT NULL COMMENT 'Tiempo expresado en minutos',
    tiempo_solucion INT NOT NULL COMMENT 'Tiempo expresado en minutos',
    descripcion TEXT
) ENGINE=InnoDB;

-- NUEVA: categorias para clasificar los tickets
CREATE TABLE Categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
) ENGINE=InnoDB;

CREATE TABLE Red (
    id_red INT AUTO_INCREMENT PRIMARY KEY,
    nombre_segmento VARCHAR(100) NOT NULL,
    direccion_ip VARCHAR(50),
    ubicacion VARCHAR(100),
    estado VARCHAR(50)
) ENGINE=InnoDB;

CREATE TABLE Software (
    id_software INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    version VARCHAR(50),
    fabricante VARCHAR(100),
    tipo_licencia VARCHAR(100)
) ENGINE=InnoDB;

-- ==========================================================
-- 2. TABLAS CON UNA DEPENDENCIA GENERAL
-- ==========================================================

-- Usuario, tecnico y administrador se unifican en Empleado
CREATE TABLE Empleado (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    cargo VARCHAR(100),
    rol ENUM('usuario', 'tecnico', 'administrador') NOT NULL,
    contrasena VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt, nunca texto plano',
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    id_departamento INT NOT NULL,

    FOREIGN KEY (id_departamento)
        REFERENCES Departamento(id_departamento) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Sub-entidad 1:1 para los empleados con rol 'tecnico'
CREATE TABLE Tecnico_Detalle (
    id_empleado INT PRIMARY KEY,
    especialidad VARCHAR(100) NOT NULL,

    FOREIGN KEY (id_empleado)
        REFERENCES Empleado(id_empleado) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- NUEVA: codigos de 6 digitos para recuperar la contrasena
CREATE TABLE Codigo_Recuperacion (
    id_codigo INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATETIME NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,

    INDEX idx_codigo_empleado (id_empleado, usado),
    FOREIGN KEY (id_empleado)
        REFERENCES Empleado(id_empleado) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Equipo (
    id_equipo INT AUTO_INCREMENT PRIMARY KEY,
    codigo_inventario VARCHAR(50) UNIQUE NOT NULL,
    nombre_equipo VARCHAR(100),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    serial VARCHAR(100),
    estado VARCHAR(50),
    fecha_adquisicion DATE,
    id_departamento INT NOT NULL,

    FOREIGN KEY (id_departamento)
        REFERENCES Departamento(id_departamento) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- La fecha de vencimiento reside unicamente aqui
CREATE TABLE Licencia (
    id_licencia INT AUTO_INCREMENT PRIMARY KEY,
    clave_licencia VARCHAR(255) NOT NULL,
    fecha_inicio DATE,
    fecha_vencimiento DATE,
    estado VARCHAR(50),
    id_software INT NOT NULL,

    FOREIGN KEY (id_software)
        REFERENCES Software(id_software) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Incidente (
    id_incidente INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT NOT NULL,
    fecha_reporte DATETIME NOT NULL,
    nivel_criticidad VARCHAR(50),
    estado VARCHAR(50),
    id_red INT NOT NULL,

    FOREIGN KEY (id_red)
        REFERENCES Red(id_red) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- 3. GESTION OPERACIONAL (TICKETS Y SEGUIMIENTOS)
-- ==========================================================

-- CAMBIOS: id_categoria, calificacion (1 a 5) y comentario_calificacion;
-- prioridad y estado pasan a ENUM para mantener valores consistentes
CREATE TABLE Ticket (
    id_ticket INT AUTO_INCREMENT PRIMARY KEY,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    asunto VARCHAR(200) NOT NULL,
    descripcion TEXT,
    prioridad ENUM('Crítica', 'Alta', 'Media', 'Baja') NOT NULL DEFAULT 'Media',
    estado ENUM('Abierto', 'En proceso', 'Resuelto', 'Cerrado') NOT NULL DEFAULT 'Abierto',
    fecha_cierre DATETIME,
    calificacion TINYINT,
    comentario_calificacion TEXT,
    id_categoria INT NOT NULL,
    id_empleado_reporta INT NOT NULL,
    id_empleado_tecnico INT,
    id_sla INT NOT NULL,
    id_incidente INT,

    INDEX idx_ticket_estado (estado),
    INDEX idx_ticket_prioridad (prioridad),
    CONSTRAINT chk_ticket_calificacion CHECK (calificacion IS NULL OR calificacion BETWEEN 1 AND 5),

    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_empleado_reporta) REFERENCES Empleado(id_empleado) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_empleado_tecnico) REFERENCES Empleado(id_empleado) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_sla) REFERENCES SLA(id_sla) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_incidente) REFERENCES Incidente(id_incidente) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Seguimiento (
    id_seguimiento INT AUTO_INCREMENT PRIMARY KEY,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    comentario TEXT NOT NULL,
    estado_actual VARCHAR(50),
    id_ticket INT NOT NULL,
    id_empleado_autor INT NOT NULL,

    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_empleado_autor) REFERENCES Empleado(id_empleado) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Auditoria (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accion_realizada TEXT NOT NULL,
    id_ticket INT NOT NULL,
    id_empleado_responsable INT NOT NULL,

    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_empleado_responsable) REFERENCES Empleado(id_empleado) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Mantenimiento (
    id_mantenimiento INT AUTO_INCREMENT PRIMARY KEY,
    tipo_mantenimiento VARCHAR(50) NOT NULL,
    fecha_programada DATE NOT NULL,
    fecha_realizacion DATE,
    observaciones TEXT,
    resultado TEXT,
    id_equipo INT NOT NULL,
    id_empleado_tecnico INT NOT NULL,

    FOREIGN KEY (id_equipo) REFERENCES Equipo(id_equipo) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_empleado_tecnico) REFERENCES Empleado(id_empleado) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- 4. TABLAS ASOCIATIVAS (RESOLUCION MUCHOS A MUCHOS N:M)
-- ==========================================================

-- Un equipo puede tener instalado mucho software y viceversa
CREATE TABLE Equipo_Software (
    id_equipo INT NOT NULL,
    id_software INT NOT NULL,

    PRIMARY KEY (id_equipo, id_software),
    FOREIGN KEY (id_equipo) REFERENCES Equipo(id_equipo) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_software) REFERENCES Software(id_software) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Un ticket puede afectar a uno o varios equipos
CREATE TABLE Ticket_Equipo (
    id_ticket INT NOT NULL,
    id_equipo INT NOT NULL,

    PRIMARY KEY (id_ticket, id_equipo),
    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_equipo) REFERENCES Equipo(id_equipo) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- 5. DATOS INICIALES DE PRUEBA (SEED)
-- ==========================================================

INSERT INTO Departamento (id_departamento, nombre, descripcion) VALUES
(1, 'Tecnología e Informática', 'Soporte técnico y gestión de la infraestructura tecnológica'),
(2, 'Coordinación Académica', 'Gestión de programas y formación'),
(3, 'Administración', 'Procesos administrativos y financieros'),
(4, 'Bienestar al Aprendiz', 'Atención y acompañamiento a los aprendices');

-- Un SLA por prioridad (tiempos en minutos)
INSERT INTO SLA (id_sla, nombre, tiempo_respuesta, tiempo_solucion, descripcion) VALUES
(1, 'SLA Crítica', 30, 240, 'Atención inmediata, afecta la operación general'),
(2, 'SLA Alta', 60, 480, 'Afecta a varios usuarios o una función importante'),
(3, 'SLA Media', 240, 1440, 'Afecta a un usuario con alternativa temporal'),
(4, 'SLA Baja', 480, 4320, 'Solicitudes y mejoras sin impacto en la operación');

INSERT INTO Categoria (id_categoria, nombre, descripcion) VALUES
(1, 'Hardware', 'Fallas en computadores, pantallas, teclados y demás equipos'),
(2, 'Software', 'Instalación, licencias y errores de aplicaciones'),
(3, 'Redes y conectividad', 'Internet, WiFi, cableado y servidores'),
(4, 'Cuentas y accesos', 'Usuarios, contraseñas y permisos'),
(5, 'Impresoras', 'Fallas e insumos de impresión'),
(6, 'Otros', 'Solicitudes que no encajan en otra categoría');

INSERT INTO Red (id_red, nombre_segmento, direccion_ip, ubicacion, estado) VALUES
(1, 'Red Administrativa', '192.168.10.0/24', 'Bloque A', 'Activa'),
(2, 'Red Formación', '192.168.20.0/24', 'Bloque B', 'Activa'),
(3, 'Red WiFi Biblioteca', '192.168.30.0/24', 'Biblioteca', 'Con fallas');

INSERT INTO Software (id_software, nombre, version, fabricante, tipo_licencia) VALUES
(1, 'Microsoft Office', '2021', 'Microsoft', 'Por equipo'),
(2, 'Windows', '11 Pro', 'Microsoft', 'Por equipo'),
(3, 'Visual Studio Code', '1.90', 'Microsoft', 'Libre'),
(4, 'Antivirus Endpoint', '12.0', 'Fabricante de prueba', 'Por usuario');

-- Contrasena de prueba para todos: Sgts2026* (hash bcrypt)
INSERT INTO Empleado (id_empleado, nombre, apellido, correo, telefono, cargo, rol, contrasena, estado, id_departamento) VALUES
(1, 'Laura', 'Gómez', 'admin@sgts.local', '3001110001', 'Coordinadora de soporte', 'administrador', '$2b$10$8/24Q7E60fmRqD24angjUORTxWbTkHcPdjFgL0LCIk5nLWBtEzf9G', TRUE, 1),
(2, 'Carlos', 'Ruiz', 'carlos.ruiz@sgts.local', '3001110002', 'Técnico de redes', 'tecnico', '$2b$10$8/24Q7E60fmRqD24angjUORTxWbTkHcPdjFgL0LCIk5nLWBtEzf9G', TRUE, 1),
(3, 'Marta', 'Díaz', 'marta.diaz@sgts.local', '3001110003', 'Técnica de soporte en sitio', 'tecnico', '$2b$10$8/24Q7E60fmRqD24angjUORTxWbTkHcPdjFgL0LCIk5nLWBtEzf9G', TRUE, 1),
(4, 'Andrés', 'Pérez', 'andres.perez@sgts.local', '3001110004', 'Instructor', 'usuario', '$2b$10$8/24Q7E60fmRqD24angjUORTxWbTkHcPdjFgL0LCIk5nLWBtEzf9G', TRUE, 2),
(5, 'Sofía', 'Torres', 'sofia.torres@sgts.local', '3001110005', 'Auxiliar administrativa', 'usuario', '$2b$10$8/24Q7E60fmRqD24angjUORTxWbTkHcPdjFgL0LCIk5nLWBtEzf9G', TRUE, 3),
(6, 'Luis', 'Ramírez', 'luis.ramirez@sgts.local', '3001110006', 'Profesional de bienestar', 'usuario', '$2b$10$8/24Q7E60fmRqD24angjUORTxWbTkHcPdjFgL0LCIk5nLWBtEzf9G', TRUE, 4);

INSERT INTO Tecnico_Detalle (id_empleado, especialidad) VALUES
(2, 'Redes y conectividad'),
(3, 'Hardware y soporte en sitio');

INSERT INTO Equipo (id_equipo, codigo_inventario, nombre_equipo, marca, modelo, serial, estado, fecha_adquisicion, id_departamento) VALUES
(1, 'INV-0001', 'PC-Oficina-1', 'Dell', 'OptiPlex 3080', 'SN-D3080-001', 'En mantenimiento', '2022-03-15', 2),
(2, 'INV-0002', 'PC-Bienestar-1', 'HP', 'ProDesk 400', 'SN-H400-002', 'Operativo', '2022-05-20', 4),
(3, 'INV-0003', 'PC-Instructor-1', 'Lenovo', 'ThinkCentre M70', 'SN-L70-003', 'Operativo', '2023-01-10', 2),
(4, 'INV-0004', 'PC-Bienestar-2', 'HP', 'ProDesk 400', 'SN-H400-004', 'Operativo', '2022-05-20', 4),
(5, 'INV-0005', 'Proyector-Sala-3', 'Epson', 'PowerLite X49', 'SN-E49-005', 'Operativo', '2021-08-02', 2),
(6, 'INV-0006', 'PC-Administracion-1', 'Dell', 'OptiPlex 3080', 'SN-D3080-006', 'Operativo', '2022-03-15', 3);

INSERT INTO Licencia (id_licencia, clave_licencia, fecha_inicio, fecha_vencimiento, estado, id_software) VALUES
(1, 'DEMO-OFFICE-0001', '2025-01-01', '2026-12-31', 'Vigente', 1),
(2, 'DEMO-WIN11-0001', '2024-01-01', '2027-12-31', 'Vigente', 2),
(3, 'DEMO-AV-0001', '2025-06-01', '2026-10-31', 'Por vencer', 4);

INSERT INTO Incidente (id_incidente, descripcion, fecha_reporte, nivel_criticidad, estado, id_red) VALUES
(1, 'Caída general de internet en el bloque A', '2026-10-05 09:35:00', 'Crítico', 'Abierto', 1),
(2, 'Lentitud en la red WiFi de la biblioteca', '2026-10-07 15:30:00', 'Alto', 'En revisión', 3);

-- 15 tickets: 5 Abierto, 5 En proceso, 3 Resuelto, 2 Cerrado
-- Prioridad: 2 Crítica, 4 Alta, 5 Media, 4 Baja (id_sla coincide con la prioridad)
INSERT INTO Ticket (id_ticket, fecha_creacion, asunto, descripcion, prioridad, estado, fecha_cierre, calificacion, comentario_calificacion, id_categoria, id_empleado_reporta, id_empleado_tecnico, id_sla, id_incidente) VALUES
(1, '2026-10-05 08:15:00', 'No enciende el equipo de oficina', 'El computador de la oficina no enciende desde esta mañana, no se ve ninguna luz.', 'Alta', 'En proceso', NULL, NULL, NULL, 1, 4, 3, 2, NULL),
(2, '2026-10-05 09:40:00', 'Sin acceso a internet en el bloque A', 'Ningún equipo del bloque A tiene conexión a internet.', 'Crítica', 'En proceso', NULL, NULL, NULL, 3, 5, 2, 1, 1),
(3, '2026-10-06 10:05:00', 'Solicitud de instalación de Visual Studio Code', 'Necesito Visual Studio Code instalado para las clases de programación.', 'Baja', 'Abierto', NULL, NULL, NULL, 2, 4, NULL, 4, NULL),
(4, '2026-10-06 11:30:00', 'Olvidé la contraseña del correo institucional', 'No puedo ingresar al correo y necesito restablecer la contraseña.', 'Media', 'Resuelto', '2026-10-06 12:10:00', 5, 'Atención rápida y clara.', 4, 6, 2, 3, NULL),
(5, '2026-10-06 14:00:00', 'La impresora no imprime a color', 'La impresora imprime solo en blanco y negro aunque se elija color.', 'Media', 'Cerrado', '2026-10-07 09:00:00', 4, 'Quedó funcionando.', 5, 5, 3, 3, NULL),
(6, '2026-10-07 08:20:00', 'Pantalla del computador parpadea', 'La pantalla parpadea cada pocos segundos y dificulta el trabajo.', 'Alta', 'Abierto', NULL, NULL, NULL, 1, 6, NULL, 2, NULL),
(7, '2026-10-07 09:10:00', 'Office pide activar la licencia', 'Al abrir Word aparece un aviso para activar la licencia.', 'Media', 'En proceso', NULL, NULL, NULL, 2, 4, 3, 3, NULL),
(8, '2026-10-07 15:45:00', 'WiFi de la biblioteca muy lento', 'El WiFi de la biblioteca casi no carga las páginas.', 'Alta', 'En proceso', NULL, NULL, NULL, 3, 6, 2, 2, 2),
(9, '2026-10-08 08:00:00', 'Solicitud de usuario nuevo en el sistema académico', 'Se requiere crear el usuario para el nuevo auxiliar administrativo.', 'Baja', 'Cerrado', '2026-10-09 10:30:00', 5, NULL, 4, 5, 2, 4, NULL),
(10, '2026-10-08 10:25:00', 'Teclado con teclas que no responden', 'Varias teclas del teclado no funcionan.', 'Baja', 'Resuelto', '2026-10-08 16:00:00', 3, 'Tardó más de lo esperado.', 1, 4, 3, 4, NULL),
(11, '2026-10-09 09:00:00', 'El servidor de archivos no responde', 'No se puede acceder a la carpeta compartida de administración.', 'Crítica', 'Abierto', NULL, NULL, NULL, 3, 5, NULL, 1, NULL),
(12, '2026-10-09 13:15:00', 'Antivirus desactualizado en la sala 2', 'El antivirus de los equipos de la sala 2 muestra definiciones antiguas.', 'Media', 'Abierto', NULL, NULL, NULL, 2, 6, NULL, 3, NULL),
(13, '2026-10-12 08:30:00', 'No puedo ingresar a la plataforma de formación', 'La plataforma muestra credenciales inválidas con mi usuario.', 'Alta', 'En proceso', NULL, NULL, NULL, 4, 4, 2, 2, NULL),
(14, '2026-10-12 11:00:00', 'Proyector de la sala 3 sin imagen', 'El proyector enciende pero no muestra imagen.', 'Media', 'Resuelto', '2026-10-12 15:20:00', 4, 'Se resolvió el mismo día.', 1, 6, 3, 3, NULL),
(15, '2026-10-13 07:50:00', 'Cable de red dañado en la oficina de administración', 'El cable de red del puesto 4 está roto y no hay conexión.', 'Baja', 'Abierto', NULL, NULL, NULL, 3, 5, NULL, 4, NULL);

INSERT INTO Seguimiento (id_seguimiento, fecha_actualizacion, comentario, estado_actual, id_ticket, id_empleado_autor) VALUES
(1, '2026-10-05 08:40:00', 'Ticket asignado al técnico de soporte en sitio.', 'En proceso', 1, 1),
(2, '2026-10-05 10:30:00', 'Se revisó la fuente de poder, se requiere reemplazo.', 'En proceso', 1, 3),
(3, '2026-10-05 09:50:00', 'Se detectó caída del switch principal del bloque A.', 'En proceso', 2, 2),
(4, '2026-10-06 11:50:00', 'Se restableció la contraseña y se verificó el acceso.', 'Resuelto', 4, 2),
(5, '2026-10-06 15:30:00', 'Se reemplazó el cartucho de color.', 'Resuelto', 5, 3),
(6, '2026-10-07 09:00:00', 'Se confirmó el funcionamiento con la usuaria.', 'Cerrado', 5, 3),
(7, '2026-10-07 16:20:00', 'Se está midiendo la señal del punto de acceso.', 'En proceso', 8, 2),
(8, '2026-10-08 16:00:00', 'Se cambió el teclado por uno nuevo.', 'Resuelto', 10, 3),
(9, '2026-10-12 15:20:00', 'Se reemplazó el cable HDMI y quedó funcionando.', 'Resuelto', 14, 3),
(10, '2026-10-12 12:00:00', 'Se está validando el usuario en el sistema.', 'En proceso', 13, 2);

INSERT INTO Auditoria (id_auditoria, fecha, accion_realizada, id_ticket, id_empleado_responsable) VALUES
(1, '2026-10-05 08:15:00', 'Creó el ticket TK-001', 1, 4),
(2, '2026-10-05 08:40:00', 'Asignó el ticket TK-001 al técnico Marta Díaz', 1, 1),
(3, '2026-10-05 09:40:00', 'Creó el ticket TK-002', 2, 5),
(4, '2026-10-05 09:45:00', 'Asignó el ticket TK-002 al técnico Carlos Ruiz', 2, 1),
(5, '2026-10-06 11:50:00', 'Cambió el estado del ticket TK-004 a Resuelto', 4, 2),
(6, '2026-10-07 09:00:00', 'Cambió el estado del ticket TK-005 a Cerrado', 5, 3),
(7, '2026-10-09 10:30:00', 'Cambió el estado del ticket TK-009 a Cerrado', 9, 2),
(8, '2026-10-12 15:20:00', 'Cambió el estado del ticket TK-014 a Resuelto', 14, 3);

INSERT INTO Mantenimiento (id_mantenimiento, tipo_mantenimiento, fecha_programada, fecha_realizacion, observaciones, resultado, id_equipo, id_empleado_tecnico) VALUES
(1, 'Correctivo', '2026-10-05', NULL, 'Reemplazo de fuente de poder del equipo que no enciende.', NULL, 1, 3),
(2, 'Preventivo', '2026-09-20', '2026-09-20', 'Limpieza interna y actualización de software.', 'Equipo en buen estado.', 3, 3);

INSERT INTO Equipo_Software (id_equipo, id_software) VALUES
(1, 1), (1, 2),
(2, 1), (2, 2),
(3, 2), (3, 3),
(4, 1), (4, 2),
(6, 1), (6, 2), (6, 4);

INSERT INTO Ticket_Equipo (id_ticket, id_equipo) VALUES
(1, 1),
(6, 2),
(7, 3),
(10, 4),
(14, 5);

-- ==========================================================
-- 6. VERIFICACION OPCIONAL (quitar los guiones para ejecutar)
-- ==========================================================
-- SELECT estado, COUNT(*) AS total FROM Ticket GROUP BY estado;
-- SELECT prioridad, COUNT(*) AS total FROM Ticket GROUP BY prioridad;
-- SELECT rol, COUNT(*) AS total FROM Empleado GROUP BY rol;
