-- ==========================================================
-- BASE DE DATOS: sgts_db  (PostgreSQL 16)
-- Sistema de Gestión de Tickets de Soporte (SGTS) - SENA
-- Ficha 3176597 - Análisis y Desarrollo de Software
-- ----------------------------------------------------------
-- USO:
--   1) Crear la base (una sola vez, conectado como postgres):
--        CREATE DATABASE sgts_db ENCODING 'UTF8';
--   2) Ejecutar este script dentro de sgts_db:
--        psql -U postgres -d sgts_db -f 01_sgts_db_postgresql.sql
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- para semillas con hash bcrypt

-- ==========================================================
-- 0. TIPOS ENUM
-- ==========================================================
CREATE TYPE rol_empleado     AS ENUM ('usuario', 'tecnico', 'administrador');
CREATE TYPE prioridad_ticket AS ENUM ('Crítica', 'Alta', 'Media', 'Baja');
CREATE TYPE estado_ticket    AS ENUM ('Abierto', 'En proceso', 'Resuelto', 'Cerrado');

-- ==========================================================
-- 1. TABLAS MAESTRAS (SIN DEPENDENCIAS)
-- ==========================================================
CREATE TABLE departamento (
    id_departamento INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL UNIQUE,
    descripcion     TEXT
);

-- Un SLA por prioridad: al crear un ticket se asigna según su prioridad
CREATE TABLE sla (
    id_sla           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre           VARCHAR(100) NOT NULL,
    prioridad        prioridad_ticket NOT NULL UNIQUE,
    tiempo_respuesta INT NOT NULL CHECK (tiempo_respuesta > 0),  -- minutos
    tiempo_solucion  INT NOT NULL CHECK (tiempo_solucion  > 0),  -- minutos
    descripcion      TEXT,
    CHECK (tiempo_solucion >= tiempo_respuesta)
);

CREATE TABLE categoria (
    id_categoria INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL UNIQUE,
    descripcion  TEXT
);

CREATE TABLE red (
    id_red          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_segmento VARCHAR(100) NOT NULL,
    direccion_ip    VARCHAR(50),
    ubicacion       VARCHAR(100),
    estado          VARCHAR(50) CHECK (estado IN ('Activa', 'Inactiva', 'Mantenimiento'))
);

CREATE TABLE software (
    id_software  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    version      VARCHAR(50),
    fabricante   VARCHAR(100),
    tipo_licencia VARCHAR(100)
);

-- ==========================================================
-- 2. TABLAS CON DEPENDENCIA
-- ==========================================================
-- Usuario, técnico y administrador unificados en EMPLEADO (herencia por rol)
CREATE TABLE empleado (
    id_empleado     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    correo          VARCHAR(150) NOT NULL UNIQUE,
    telefono        VARCHAR(20),
    cargo           VARCHAR(100),
    rol             rol_empleado NOT NULL DEFAULT 'usuario',
    contrasena      VARCHAR(255) NOT NULL,          -- hash bcrypt, nunca texto plano
    estado          BOOLEAN NOT NULL DEFAULT TRUE,
    id_departamento INT NOT NULL
        REFERENCES departamento(id_departamento) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Sub-entidad 1:1 solo para empleados con rol 'tecnico'
CREATE TABLE tecnico_detalle (
    id_empleado  INT PRIMARY KEY
        REFERENCES empleado(id_empleado) ON DELETE CASCADE ON UPDATE CASCADE,
    especialidad VARCHAR(100) NOT NULL
);

-- Códigos de 6 dígitos para recuperación de contraseña (se guarda el HASH)
CREATE TABLE codigo_recuperacion (
    id_codigo   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_empleado INT NOT NULL
        REFERENCES empleado(id_empleado) ON DELETE CASCADE ON UPDATE CASCADE,
    codigo_hash VARCHAR(255) NOT NULL,
    creado_en   TIMESTAMP NOT NULL DEFAULT NOW(),
    expira_en   TIMESTAMP NOT NULL,
    usado       BOOLEAN NOT NULL DEFAULT FALSE,
    intentos    SMALLINT NOT NULL DEFAULT 0,
    CHECK (expira_en > creado_en)
);

CREATE TABLE equipo (
    id_equipo         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo_inventario VARCHAR(50) NOT NULL UNIQUE,
    nombre_equipo     VARCHAR(100),
    marca             VARCHAR(100),
    modelo            VARCHAR(100),
    serial            VARCHAR(100),
    estado            VARCHAR(50) CHECK (estado IN ('Operativo', 'En mantenimiento', 'Dañado', 'Dado de baja')),
    fecha_adquisicion DATE,
    id_departamento   INT NOT NULL
        REFERENCES departamento(id_departamento) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE licencia (
    id_licencia       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    clave_licencia    VARCHAR(255) NOT NULL,
    fecha_inicio      DATE,
    fecha_vencimiento DATE,
    estado            VARCHAR(50) CHECK (estado IN ('Vigente', 'Vencida', 'Por vencer')),
    id_software       INT NOT NULL
        REFERENCES software(id_software) ON DELETE RESTRICT ON UPDATE CASCADE,
    CHECK (fecha_vencimiento IS NULL OR fecha_inicio IS NULL OR fecha_vencimiento >= fecha_inicio)
);

CREATE TABLE incidente (
    id_incidente     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    descripcion      TEXT NOT NULL,
    fecha_reporte    TIMESTAMP NOT NULL DEFAULT NOW(),
    nivel_criticidad prioridad_ticket,
    estado           VARCHAR(50) CHECK (estado IN ('Abierto', 'En análisis', 'Resuelto')),
    id_red           INT NOT NULL
        REFERENCES red(id_red) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ==========================================================
-- 3. GESTIÓN OPERACIONAL
-- ==========================================================
CREATE TABLE ticket (
    id_ticket               INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo                  VARCHAR(20) GENERATED ALWAYS AS ('TK-' || LPAD(id_ticket::TEXT, 3, '0')) STORED UNIQUE,
    fecha_creacion          TIMESTAMP NOT NULL DEFAULT NOW(),
    asunto                  VARCHAR(200) NOT NULL,
    descripcion             TEXT,
    prioridad               prioridad_ticket NOT NULL DEFAULT 'Media',
    estado                  estado_ticket    NOT NULL DEFAULT 'Abierto',
    fecha_primera_respuesta TIMESTAMP,                 -- para medir cumplimiento de SLA de respuesta
    fecha_cierre            TIMESTAMP,
    calificacion            SMALLINT CHECK (calificacion BETWEEN 1 AND 5),
    comentario_calificacion TEXT,
    id_empleado_reporta     INT NOT NULL
        REFERENCES empleado(id_empleado) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_empleado_tecnico     INT
        REFERENCES empleado(id_empleado) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_sla                  INT NOT NULL
        REFERENCES sla(id_sla) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_categoria            INT
        REFERENCES categoria(id_categoria) ON DELETE SET NULL ON UPDATE CASCADE,
    id_incidente            INT
        REFERENCES incidente(id_incidente) ON DELETE SET NULL ON UPDATE CASCADE,
    -- La calificación solo es válida con el ticket Resuelto o Cerrado
    CHECK (calificacion IS NULL OR estado IN ('Resuelto', 'Cerrado')),
    CHECK (fecha_cierre IS NULL OR fecha_cierre >= fecha_creacion)
);

CREATE TABLE seguimiento (
    id_seguimiento      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    comentario          TEXT NOT NULL,
    estado_actual       estado_ticket,
    id_ticket           INT NOT NULL
        REFERENCES ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    id_empleado_autor   INT NOT NULL
        REFERENCES empleado(id_empleado) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE auditoria (
    id_auditoria            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha                   TIMESTAMP NOT NULL DEFAULT NOW(),
    accion_realizada        TEXT NOT NULL,
    id_ticket               INT NOT NULL
        REFERENCES ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    id_empleado_responsable INT NOT NULL
        REFERENCES empleado(id_empleado) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE mantenimiento (
    id_mantenimiento    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tipo_mantenimiento  VARCHAR(50) NOT NULL CHECK (tipo_mantenimiento IN ('Preventivo', 'Correctivo')),
    fecha_programada    DATE NOT NULL,
    fecha_realizacion   DATE,
    observaciones       TEXT,
    resultado           TEXT,
    id_equipo           INT NOT NULL
        REFERENCES equipo(id_equipo) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_empleado_tecnico INT NOT NULL
        REFERENCES empleado(id_empleado) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Evidencias fotográficas (el archivo vive en el Servidor de Almacenamiento; aquí solo la ruta)
CREATE TABLE evidencia_mantenimiento (
    id_evidencia     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ruta_archivo     VARCHAR(500) NOT NULL,
    fecha_subida     TIMESTAMP NOT NULL DEFAULT NOW(),
    id_mantenimiento INT NOT NULL
        REFERENCES mantenimiento(id_mantenimiento) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ==========================================================
-- 4. TABLAS ASOCIATIVAS (N:M)
-- ==========================================================
CREATE TABLE equipo_software (
    id_equipo   INT NOT NULL REFERENCES equipo(id_equipo)     ON DELETE CASCADE ON UPDATE CASCADE,
    id_software INT NOT NULL REFERENCES software(id_software) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (id_equipo, id_software)
);

CREATE TABLE ticket_equipo (
    id_ticket INT NOT NULL REFERENCES ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    id_equipo INT NOT NULL REFERENCES equipo(id_equipo) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (id_ticket, id_equipo)
);

-- ==========================================================
-- 5. REGLAS DE INTEGRIDAD (TRIGGERS)
-- ==========================================================
-- El técnico asignado a un ticket/mantenimiento debe tener rol 'tecnico'
CREATE OR REPLACE FUNCTION fn_validar_tecnico() RETURNS TRIGGER AS $$
DECLARE
    v_id INT;
BEGIN
    IF TG_TABLE_NAME = 'ticket' THEN v_id := NEW.id_empleado_tecnico;
    ELSE v_id := NEW.id_empleado_tecnico; END IF;

    IF v_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM empleado WHERE id_empleado = v_id AND rol = 'tecnico' AND estado = TRUE
    ) THEN
        RAISE EXCEPTION 'El empleado % no es un técnico activo', v_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ticket_tecnico
    BEFORE INSERT OR UPDATE OF id_empleado_tecnico ON ticket
    FOR EACH ROW EXECUTE FUNCTION fn_validar_tecnico();

CREATE TRIGGER trg_mantenimiento_tecnico
    BEFORE INSERT OR UPDATE OF id_empleado_tecnico ON mantenimiento
    FOR EACH ROW EXECUTE FUNCTION fn_validar_tecnico();

-- Solo los empleados con rol 'tecnico' pueden tener fila en tecnico_detalle
CREATE OR REPLACE FUNCTION fn_validar_tecnico_detalle() RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM empleado WHERE id_empleado = NEW.id_empleado AND rol = 'tecnico') THEN
        RAISE EXCEPTION 'El empleado % no tiene rol tecnico', NEW.id_empleado;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tecnico_detalle
    BEFORE INSERT OR UPDATE ON tecnico_detalle
    FOR EACH ROW EXECUTE FUNCTION fn_validar_tecnico_detalle();

-- ==========================================================
-- 6. ÍNDICES
-- ==========================================================
CREATE INDEX idx_empleado_departamento ON empleado(id_departamento);
CREATE INDEX idx_empleado_rol          ON empleado(rol);
CREATE INDEX idx_ticket_estado         ON ticket(estado);
CREATE INDEX idx_ticket_prioridad      ON ticket(prioridad);
CREATE INDEX idx_ticket_reporta        ON ticket(id_empleado_reporta);
CREATE INDEX idx_ticket_tecnico        ON ticket(id_empleado_tecnico);
CREATE INDEX idx_ticket_creacion       ON ticket(fecha_creacion DESC);
CREATE INDEX idx_seguimiento_ticket    ON seguimiento(id_ticket);
CREATE INDEX idx_auditoria_ticket      ON auditoria(id_ticket);
CREATE INDEX idx_auditoria_fecha       ON auditoria(fecha DESC);
CREATE INDEX idx_mantenimiento_equipo  ON mantenimiento(id_equipo);
CREATE INDEX idx_codigo_empleado       ON codigo_recuperacion(id_empleado, usado);

-- ==========================================================
-- 7. DATOS SEMILLA
-- ==========================================================
INSERT INTO departamento (nombre, descripcion) VALUES
  ('Tecnología', 'Soporte técnico y sistemas'),
  ('Administración', 'Gestión administrativa del centro'),
  ('Formación', 'Instructores y aulas');

INSERT INTO sla (nombre, prioridad, tiempo_respuesta, tiempo_solucion, descripcion) VALUES
  ('SLA Crítico', 'Crítica',  30,  240, 'Servicio detenido: respuesta 30 min, solución 4 h'),
  ('SLA Alto',    'Alta',    120,  480, 'Afectación importante: respuesta 2 h, solución 8 h'),
  ('SLA Medio',   'Media',   240, 1440, 'Afectación moderada: respuesta 4 h, solución 24 h'),
  ('SLA Bajo',    'Baja',    480, 4320, 'Consulta o mejora: respuesta 8 h, solución 72 h');

INSERT INTO categoria (nombre, descripcion) VALUES
  ('Hardware', 'Fallas en equipos físicos'),
  ('Software', 'Instalación, errores o licencias'),
  ('Red', 'Conectividad e infraestructura de red'),
  ('Cuentas y accesos', 'Usuarios, contraseñas y permisos'),
  ('Otros', 'Requerimientos no clasificados');

-- Administrador inicial. CONTRASEÑA TEMPORAL: Cambiar2026*  -> cámbiala en el primer ingreso.
-- El hash $2a$ generado por pgcrypto es compatible con passlib[bcrypt].
INSERT INTO empleado (nombre, apellido, correo, cargo, rol, contrasena, id_departamento)
VALUES ('Admin', 'SGTS', 'admin@sgts.local', 'Administrador del sistema', 'administrador',
        crypt('Cambiar2026*', gen_salt('bf', 12)),
        (SELECT id_departamento FROM departamento WHERE nombre = 'Tecnología'));
