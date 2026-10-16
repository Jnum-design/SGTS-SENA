-- Datos de DEMOSTRACIÓN (solo desarrollo). Ejecutar después de sgts_db_postgresql.sql
-- Contraseña de todos los usuarios demo: Demo2026*   (el admin conserva Cambiar2026*)
INSERT INTO empleado (nombre, apellido, correo, telefono, cargo, rol, contrasena, id_departamento) VALUES
 ('Rito',   'Delgado',  'usuario@sgts.local',  '3001112233', 'Instructor',          'usuario', crypt('Demo2026*', gen_salt('bf', 10)), (SELECT id_departamento FROM departamento WHERE nombre='Formación')),
 ('Patrick','Morales',  'tecnico@sgts.local',  '3004445566', 'Técnico de soporte',  'tecnico', crypt('Demo2026*', gen_salt('bf', 10)), (SELECT id_departamento FROM departamento WHERE nombre='Tecnología')),
 ('Johan',  'Palencia', 'tecnico2@sgts.local', '3007778899', 'Técnico de redes',    'tecnico', crypt('Demo2026*', gen_salt('bf', 10)), (SELECT id_departamento FROM departamento WHERE nombre='Tecnología'));

INSERT INTO tecnico_detalle (id_empleado, especialidad) VALUES
 ((SELECT id_empleado FROM empleado WHERE correo='tecnico@sgts.local'),  'Hardware y equipos de oficina'),
 ((SELECT id_empleado FROM empleado WHERE correo='tecnico2@sgts.local'), 'Redes y conectividad');

INSERT INTO equipo (codigo_inventario, nombre_equipo, marca, modelo, serial, estado, fecha_adquisicion, id_departamento) VALUES
 ('INV-0001','PC Oficina 1','Lenovo','ThinkCentre M70','SN-A001','Operativo','2024-03-10',(SELECT id_departamento FROM departamento WHERE nombre='Administración')),
 ('INV-0002','PC Aula 3','HP','ProDesk 400','SN-A002','Operativo','2023-08-22',(SELECT id_departamento FROM departamento WHERE nombre='Formación')),
 ('INV-0003','Portátil Instructor','Dell','Latitude 3420','SN-A003','Operativo','2025-01-15',(SELECT id_departamento FROM departamento WHERE nombre='Formación')),
 ('INV-0004','Impresora Administración','Epson','L3250','SN-A004','En mantenimiento','2022-11-02',(SELECT id_departamento FROM departamento WHERE nombre='Administración'));

-- Tickets de ejemplo
INSERT INTO ticket (asunto, descripcion, prioridad, estado, id_empleado_reporta, id_empleado_tecnico, id_sla, id_categoria, fecha_creacion, fecha_primera_respuesta)
VALUES
 ('No enciende el equipo de oficina', 'El equipo de la oficina de administración no enciende desde esta mañana, no da señal de energía.',
  'Alta', 'En proceso', (SELECT id_empleado FROM empleado WHERE correo='usuario@sgts.local'),
  (SELECT id_empleado FROM empleado WHERE correo='tecnico@sgts.local'),
  (SELECT id_sla FROM sla WHERE prioridad='Alta'), (SELECT id_categoria FROM categoria WHERE nombre='Hardware'),
  NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours'),
 ('Sin internet en el aula 3', 'El segmento de red del aula 3 no tiene conexión.',
  'Media', 'Abierto', (SELECT id_empleado FROM empleado WHERE correo='usuario@sgts.local'),
  NULL, (SELECT id_sla FROM sla WHERE prioridad='Media'), (SELECT id_categoria FROM categoria WHERE nombre='Red'),
  NOW() - INTERVAL '1 hour', NULL);

INSERT INTO ticket_equipo (id_ticket, id_equipo) VALUES (1, 1), (2, 2);
INSERT INTO seguimiento (comentario, estado_actual, id_ticket, id_empleado_autor, fecha_actualizacion) VALUES
 ('Ticket asignado al técnico Patrick Morales', 'Abierto', 1, (SELECT id_empleado FROM empleado WHERE correo='admin@sgts.local'), NOW() - INTERVAL '2 hours 30 minutes'),
 ('Revisando la fuente de poder del equipo.', 'En proceso', 1, (SELECT id_empleado FROM empleado WHERE correo='tecnico@sgts.local'), NOW() - INTERVAL '2 hours');
INSERT INTO auditoria (accion_realizada, id_ticket, id_empleado_responsable, fecha) VALUES
 ('Creó el ticket TK-001 con prioridad Alta (SLA: SLA Alto)', 1, (SELECT id_empleado FROM empleado WHERE correo='usuario@sgts.local'), NOW() - INTERVAL '3 hours'),
 ('Asignó TK-001 a Patrick Morales (antes: sin asignar)', 1, (SELECT id_empleado FROM empleado WHERE correo='admin@sgts.local'), NOW() - INTERVAL '2 hours 30 minutes'),
 ('Creó el ticket TK-002 con prioridad Media (SLA: SLA Medio)', 2, (SELECT id_empleado FROM empleado WHERE correo='usuario@sgts.local'), NOW() - INTERVAL '1 hour');
