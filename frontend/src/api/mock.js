/**
 * Fake Backend / Mock API para desarrollo independiente del Frontend
 * Permite que SGTS funcione sin backend ni PostgreSQL.
 */

export function isMockEnabled() {
  const envMock = typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK
  if (envMock === 'true' || envMock === true) return true
  return localStorage.getItem('sgts_mock_mode') === 'true'
}

export function setMockMode(enabled) {
  if (enabled) {
    localStorage.setItem('sgts_mock_mode', 'true')
  } else {
    localStorage.removeItem('sgts_mock_mode')
  }
}

// Datos en memoria simulados
const departamentos = [
  { id_departamento: 1, nombre: 'Tecnología e Informática' },
  { id_departamento: 2, nombre: 'Administración y Finanzas' },
  { id_departamento: 3, nombre: 'Coordinación Académica' },
  { id_departamento: 4, nombre: 'Servicios Generales' },
]

const tecnicos = [
  { id_empleado: 3, nombre: 'Patrick', apellido: 'Morales', nombre_completo: 'Patrick Morales', correo: 'tecnico@sgts.local', especialidad: 'Hardware y Redes' },
  { id_empleado: 4, nombre: 'Johan', apellido: 'Pantoja', nombre_completo: 'Johan Pantoja', correo: 'tecnico2@sgts.local', especialidad: 'Software y Sistemas' },
]

let empleados = [
  { id_empleado: 1, nombre: 'Admin', apellido: 'SGTS', nombre_completo: 'Admin SGTS', correo: 'admin@sgts.local', rol: 'administrador', cargo: 'Administrador de Sistema', id_departamento: 1, departamento: 'Tecnología e Informática', telefono: '3001234567', estado: true },
  { id_empleado: 2, nombre: 'Rito', apellido: 'Delgado', nombre_completo: 'Rito Delgado', correo: 'usuario@sgts.local', rol: 'usuario', cargo: 'Instructor', id_departamento: 3, departamento: 'Coordinación Académica', telefono: '3109876543', estado: true },
  { id_empleado: 3, nombre: 'Patrick', apellido: 'Morales', nombre_completo: 'Patrick Morales', correo: 'tecnico@sgts.local', rol: 'tecnico', cargo: 'Técnico de Soporte', id_departamento: 1, departamento: 'Tecnología e Informática', telefono: '3205551234', estado: true },
  { id_empleado: 4, nombre: 'Johan', apellido: 'Pantoja', nombre_completo: 'Johan Pantoja', correo: 'tecnico2@sgts.local', rol: 'tecnico', cargo: 'Líder Frontend', id_departamento: 1, departamento: 'Tecnología e Informática', telefono: '3157778899', estado: true },
]

const categorias = [
  { id_categoria: 1, nombre: 'Fallo de Hardware' },
  { id_categoria: 2, nombre: 'Instalación de Software' },
  { id_categoria: 3, nombre: 'Conectividad y Red' },
  { id_categoria: 4, nombre: 'Mantenimiento Preventivo' },
]

const slas = [
  { id_sla: 1, nombre: 'Crítica (1h respuesta / 4h solución)', tiempo_respuesta: 60, tiempo_solucion: 240 },
  { id_sla: 2, nombre: 'Alta (2h respuesta / 8h solución)', tiempo_respuesta: 120, tiempo_solucion: 480 },
  { id_sla: 3, nombre: 'Media (4h respuesta / 24h solución)', tiempo_respuesta: 240, tiempo_solucion: 1440 },
  { id_sla: 4, nombre: 'Baja (8h respuesta / 48h solución)', tiempo_respuesta: 480, tiempo_solucion: 2880 },
]

const equipos = [
  { id_equipo: 1, codigo: 'EQ-SENA-001', nombre: 'Portátil Lenovo ThinkPad E14', serial: 'PF3A9921', tipo: 'Computador Portátil' },
  { id_equipo: 2, codigo: 'EQ-SENA-002', nombre: 'PC de Escritorio HP ProDesk', serial: 'MXL8201B4', tipo: 'Computador Escritorio' },
  { id_equipo: 3, codigo: 'EQ-SENA-003', nombre: 'Impresora Láser HP LaserJet Pro', serial: 'VNB3K1234', tipo: 'Impresora' },
  { id_equipo: 4, codigo: 'EQ-SENA-004', nombre: 'Switch Cisco Catalyst 24P', serial: 'FCW2109A01', tipo: 'Red' },
]

let tickets = [
  {
    id_ticket: 1,
    codigo: 'TK-2026-0001',
    asunto: 'Equipo no enciende en Aula de Cómputo 2',
    descripcion: 'Al presionar el botón de encendido del equipo no da señal ni encienden los ventiladores.',
    estado: 'En proceso',
    prioridad: 'Alta',
    fecha_creacion: '2026-10-15T09:30:00Z',
    solicitante: 'Rito Delgado',
    id_empleado_solicitante: 2,
    tecnico: 'Patrick Morales',
    id_empleado_tecnico: 3,
    categoria: 'Fallo de Hardware',
    id_categoria: 1,
    sla: 'Alta (2h respuesta / 8h solución)',
    id_sla: 2,
    calificacion: null,
    comentario_calificacion: null,
    seguimientos: [
      { id_seguimiento: 1, fecha_actualizacion: '2026-10-15T09:45:00Z', autor: 'Admin SGTS', comentario: 'Ticket recibido y asignado a soporte técnico.' },
      { id_seguimiento: 2, fecha_actualizacion: '2026-10-15T10:15:00Z', autor: 'Patrick Morales', comentario: 'Revisión en sitio iniciada. Sospecha de fuente de poder dañada.' },
    ],
  },
  {
    id_ticket: 2,
    codigo: 'TK-2026-0002',
    asunto: 'Instalación de suite de diseño gráfico y Node.js',
    descripcion: 'Se requiere instalar entorno de desarrollo web en las estaciones de ADSO.',
    estado: 'Abierto',
    prioridad: 'Media',
    fecha_creacion: '2026-10-16T08:15:00Z',
    solicitante: 'Rito Delgado',
    id_empleado_solicitante: 2,
    tecnico: null,
    id_empleado_tecnico: null,
    categoria: 'Instalación de Software',
    id_categoria: 2,
    sla: 'Media (4h respuesta / 24h solución)',
    id_sla: 3,
    calificacion: null,
    comentario_calificacion: null,
    seguimientos: [
      { id_seguimiento: 3, fecha_actualizacion: '2026-10-16T08:15:00Z', autor: 'Rito Delgado', comentario: 'Ticket creado por el usuario.' },
    ],
  },
  {
    id_ticket: 3,
    codigo: 'TK-2026-0003',
    asunto: 'Intermitencia en red Wi-Fi Administrativa',
    descripcion: 'Caída de conexión intermitente durante llamadas y subida de archivos.',
    estado: 'Resuelto',
    prioridad: 'Crítica',
    fecha_creacion: '2026-10-14T11:00:00Z',
    fecha_cierre: '2026-10-14T14:30:00Z',
    solicitante: 'Admin SGTS',
    id_empleado_solicitante: 1,
    tecnico: 'Johan Pantoja',
    id_empleado_tecnico: 4,
    categoria: 'Conectividad y Red',
    id_categoria: 3,
    sla: 'Crítica (1h respuesta / 4h solución)',
    id_sla: 1,
    calificacion: 5,
    comentario_calificacion: 'Excelente atención y rapidez en la solución.',
    seguimientos: [
      { id_seguimiento: 4, fecha_actualizacion: '2026-10-14T11:20:00Z', autor: 'Johan Pantoja', comentario: 'Canal Wi-Fi reconfigurado en punto de acceso principal.' },
      { id_seguimiento: 5, fecha_actualizacion: '2026-10-14T14:30:00Z', autor: 'Johan Pantoja', comentario: 'Pruebas de conectividad estables. Ticket resuelto.' },
    ],
  },
]

let auditoria = [
  { id_auditoria: 1, fecha: '2026-10-16T18:00:00Z', accion: 'Inicio de sesión', usuario: 'Johan Pantoja', detalle: 'Ingreso al sistema vía Mock Autónomo' },
  { id_auditoria: 2, fecha: '2026-10-16T17:30:00Z', accion: 'Modificación de Ticket', usuario: 'Patrick Morales', detalle: 'Cambio de estado a "En proceso" en TK-2026-0001' },
  { id_auditoria: 3, fecha: '2026-10-16T16:15:00Z', accion: 'Creación de Ticket', usuario: 'Rito Delgado', detalle: 'Creación del ticket TK-2026-0002' },
]

export async function handleMockRequest(config) {
  // Simular un pequeño retardo de red realista (100ms)
  await new Promise((r) => setTimeout(r, 120))

  const url = (config.url || '').replace(/^\/api/, '')
  const method = (config.method || 'get').toLowerCase()
  const data = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {})

  // 1. Auth: Login
  if (url === '/auth/login' && method === 'post') {
    const correo = (data.correo || '').toLowerCase()
    let rol = 'administrador'
    let nombre = 'Johan'
    let apellido = 'Pantoja'
    let id_empleado = 1

    if (correo.includes('tecnico') || correo.includes('johan')) {
      rol = 'tecnico'
      nombre = 'Johan'
      apellido = 'Pantoja'
      id_empleado = 4
    } else if (correo.includes('usuario') || correo.includes('rito')) {
      rol = 'usuario'
      nombre = 'Rito'
      apellido = 'Delgado'
      id_empleado = 2
    }

    const usuario = {
      id_empleado,
      nombre,
      apellido,
      nombre_completo: `${nombre} ${apellido}`,
      correo: data.correo || 'admin@sgts.local',
      rol,
      cargo: rol === 'administrador' ? 'Líder / Admin SGTS' : (rol === 'tecnico' ? 'Técnico de Soporte' : 'Instructor SENA'),
      id_departamento: 1,
      departamento: 'Tecnología e Informática',
    }

    return makeResponse({
      access_token: 'mock-jwt-token-sgts-sena-2026',
      token_type: 'bearer',
      usuario,
    }, 200, config)
  }

  // 2. Auth: Recuperar contraseña
  if (url === '/auth/recuperar' && method === 'post') {
    return makeResponse({
      detail: 'Código de recuperación enviado. Usa 123456 en modo demo.',
      dev_codigo: '123456',
    }, 200, config)
  }

  // 3. Auth: Validar código
  if (url === '/auth/validar-codigo' && method === 'post') {
    return makeResponse({ reset_token: 'mock-reset-token-validado' }, 200, config)
  }

  // 4. Auth: Nueva contraseña
  if (url === '/auth/nueva-contrasena' && method === 'post') {
    return makeResponse({ detail: 'Contraseña actualizada con éxito' }, 200, config)
  }

  // 5. Dashboard: Resumen
  if (url === '/dashboard/resumen' && method === 'get') {
    return makeResponse({
      total: tickets.length,
      por_estado: [
        { label: 'Abierto', value: tickets.filter((t) => t.estado === 'Abierto').length },
        { label: 'En proceso', value: tickets.filter((t) => t.estado === 'En proceso').length },
        { label: 'Resuelto', value: tickets.filter((t) => t.estado === 'Resuelto').length },
        { label: 'Cerrado', value: tickets.filter((t) => t.estado === 'Cerrado').length },
      ],
      por_prioridad: [
        { label: 'Crítica', value: tickets.filter((t) => t.prioridad === 'Crítica').length },
        { label: 'Alta', value: tickets.filter((t) => t.prioridad === 'Alta').length },
        { label: 'Media', value: tickets.filter((t) => t.prioridad === 'Media').length },
        { label: 'Baja', value: tickets.filter((t) => t.prioridad === 'Baja').length },
      ],
      sla_cumplimiento: 94.5,
      calificacion_promedio: 4.8,
      sin_asignar: tickets.filter((t) => !t.id_empleado_tecnico).length,
      empleados_activos: empleados.length,
      recientes: tickets.slice(0, 5),
      actividad: [
        { fecha: '2026-10-16T18:15:00Z', codigo: 'TK-2026-0001', autor: 'Patrick Morales', comentario: 'Revisión en sitio iniciada.' },
        { fecha: '2026-10-16T17:00:00Z', codigo: 'TK-2026-0002', autor: 'Rito Delgado', comentario: 'Ticket creado por el usuario.' },
        { fecha: '2026-10-14T14:30:00Z', codigo: 'TK-2026-0003', autor: 'Johan Pantoja', comentario: 'Ticket resuelto y calificado.' },
      ],
    }, 200, config)
  }

  // 6. Tickets: Listado y Creación
  if (url === '/tickets' && method === 'get') {
    const q = (config.params?.q || '').toLowerCase()
    const estado = config.params?.estado
    const prioridad = config.params?.prioridad

    let filtrados = tickets.filter((t) => {
      if (q && !t.asunto.toLowerCase().includes(q) && !t.codigo.toLowerCase().includes(q)) return false
      if (estado && t.estado !== estado) return false
      if (prioridad && t.prioridad !== prioridad) return false
      return true
    })

    const conteos = {
      'Todos': tickets.length,
      'Abierto': tickets.filter((t) => t.estado === 'Abierto').length,
      'En proceso': tickets.filter((t) => t.estado === 'En proceso').length,
      'Resuelto': tickets.filter((t) => t.estado === 'Resuelto').length,
      'Cerrado': tickets.filter((t) => t.estado === 'Cerrado').length,
    }

    return makeResponse({
      items: filtrados,
      total: filtrados.length,
      page: config.params?.page || 1,
      pages: 1,
      conteos,
    }, 200, config)
  }

  if (url === '/tickets' && method === 'post') {
    const nuevoId = tickets.length + 1
    const codigo = `TK-2026-${String(nuevoId).padStart(4, '0')}`
    const cat = categorias.find((c) => c.id_categoria === data.id_categoria)
    const sla = slas.find((s) => s.id_sla === data.id_sla)

    const nuevoTicket = {
      id_ticket: nuevoId,
      codigo,
      asunto: data.asunto,
      descripcion: data.descripcion,
      estado: 'Abierto',
      prioridad: data.prioridad || 'Media',
      fecha_creacion: new Date().toISOString(),
      solicitante: 'Johan Pantoja',
      id_empleado_solicitante: 4,
      tecnico: null,
      id_empleado_tecnico: null,
      categoria: cat ? cat.nombre : 'General',
      id_categoria: data.id_categoria,
      sla: sla ? sla.nombre : 'Estándar',
      id_sla: data.id_sla,
      calificacion: null,
      comentario_calificacion: null,
      seguimientos: [
        { id_seguimiento: Date.now(), fecha_actualizacion: new Date().toISOString(), autor: 'Johan Pantoja', comentario: 'Ticket registrado en la plataforma.' },
      ],
    }
    tickets.unshift(nuevoTicket)
    return makeResponse(nuevoTicket, 201, config)
  }

  // 7. Tickets individuales
  const ticketIdMatch = url.match(/^\/tickets\/(\d+)$/)
  if (ticketIdMatch && method === 'get') {
    const id = parseInt(ticketIdMatch[1])
    const ticket = tickets.find((t) => t.id_ticket === id)
    if (!ticket) return makeError(404, 'Ticket no encontrado', config)
    return makeResponse(ticket, 200, config)
  }

  // 8. Seguimientos
  const segMatch = url.match(/^\/tickets\/(\d+)\/seguimientos$/)
  if (segMatch && method === 'post') {
    const id = parseInt(segMatch[1])
    const ticket = tickets.find((t) => t.id_ticket === id)
    if (!ticket) return makeError(404, 'Ticket no encontrado', config)
    ticket.seguimientos.push({
      id_seguimiento: Date.now(),
      fecha_actualizacion: new Date().toISOString(),
      autor: 'Johan Pantoja',
      comentario: data.comentario,
    })
    return makeResponse(ticket, 200, config)
  }

  // 9. Asignar técnico
  const asigMatch = url.match(/^\/tickets\/(\d+)\/asignar$/)
  if (asigMatch && method === 'patch') {
    const id = parseInt(asigMatch[1])
    const ticket = tickets.find((t) => t.id_ticket === id)
    if (!ticket) return makeError(404, 'Ticket no encontrado', config)
    const tec = tecnicos.find((t) => t.id_empleado === data.id_empleado_tecnico)
    ticket.tecnico = tec ? tec.nombre_completo : null
    ticket.id_empleado_tecnico = data.id_empleado_tecnico
    ticket.seguimientos.push({
      id_seguimiento: Date.now(),
      fecha_actualizacion: new Date().toISOString(),
      autor: 'Admin SGTS',
      comentario: `Ticket asignado al técnico ${ticket.tecnico || 'Sin asignar'}`,
    })
    return makeResponse(ticket, 200, config)
  }

  // 10. Cambiar estado
  const estadoMatch = url.match(/^\/tickets\/(\d+)\/estado$/)
  if (estadoMatch && method === 'patch') {
    const id = parseInt(estadoMatch[1])
    const ticket = tickets.find((t) => t.id_ticket === id)
    if (!ticket) return makeError(404, 'Ticket no encontrado', config)
    ticket.estado = data.estado
    if (data.estado === 'Cerrado' || data.estado === 'Resuelto') {
      ticket.fecha_cierre = new Date().toISOString()
    }
    if (data.comentario) {
      ticket.seguimientos.push({
        id_seguimiento: Date.now(),
        fecha_actualizacion: new Date().toISOString(),
        autor: 'Johan Pantoja',
        comentario: `Estado cambiado a ${data.estado}: ${data.comentario}`,
      })
    }
    return makeResponse(ticket, 200, config)
  }

  // 11. Calificar ticket
  const califMatch = url.match(/^\/tickets\/(\d+)\/calificar$/)
  if (califMatch && method === 'post') {
    const id = parseInt(califMatch[1])
    const ticket = tickets.find((t) => t.id_ticket === id)
    if (!ticket) return makeError(404, 'Ticket no encontrado', config)
    ticket.calificacion = data.calificacion
    ticket.comentario_calificacion = data.comentario
    return makeResponse(ticket, 200, config)
  }

  // 12. Catálogos
  if (url === '/departamentos' && method === 'get') return makeResponse(departamentos, 200, config)
  if (url === '/tecnicos' && method === 'get') return makeResponse(tecnicos, 200, config)
  if (url === '/categorias' && method === 'get') return makeResponse(categorias, 200, config)
  if (url === '/sla' && method === 'get') return makeResponse(slas, 200, config)
  if (url.startsWith('/equipos') && method === 'get') return makeResponse(equipos, 200, config)

  // 13. Empleados
  if (url.startsWith('/empleados') && method === 'get') {
    return makeResponse({ items: empleados, total: empleados.length, page: 1, pages: 1 }, 200, config)
  }
  if (url === '/empleados' && method === 'post') {
    const nuevo = { id_empleado: Date.now(), ...data, nombre_completo: `${data.nombre} ${data.apellido}`, estado: true }
    empleados.push(nuevo)
    return makeResponse(nuevo, 201, config)
  }
  const empMatch = url.match(/^\/empleados\/(\d+)$/)
  if (empMatch && method === 'put') {
    const id = parseInt(empMatch[1])
    const emp = empleados.find((e) => e.id_empleado === id)
    if (emp) Object.assign(emp, data, { nombre_completo: `${data.nombre} ${data.apellido}` })
    return makeResponse(emp || data, 200, config)
  }
  if (empMatch && method === 'delete') {
    const id = parseInt(empMatch[1])
    empleados = empleados.filter((e) => e.id_empleado !== id)
    return makeResponse({ detail: 'Empleado desactivado' }, 200, config)
  }

  // 14. Auditoría
  if (url.startsWith('/auditoria') && method === 'get') {
    return makeResponse({ items: auditoria, total: auditoria.length, page: 1, pages: 1 }, 200, config)
  }

  // Endpoint por defecto
  return makeResponse({ ok: true, mock: true }, 200, config)
}

function makeResponse(data, status, config) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config,
    request: {},
  }
}

function makeError(status, detail, config) {
  const err = new Error(detail)
  err.response = {
    status,
    statusText: 'Error',
    data: { detail },
    headers: {},
    config,
  }
  return Promise.reject(err)
}
