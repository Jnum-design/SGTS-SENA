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

// Catálogos base
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
  { id_empleado: 1, nombre: 'Admin', apellido: 'SGTS', nombre_completo: 'Admin SGTS', correo: 'admin@sgts.local', rol: 'administrador', cargo: 'Administrador del Sistema', id_departamento: 1, departamento: 'Tecnología e Informática', telefono: '3001234567', estado: true },
  { id_empleado: 2, nombre: 'Rito', apellido: 'Delgado', nombre_completo: 'Rito Delgado', correo: 'usuario@sgts.local', rol: 'usuario', cargo: 'Instructor ADSO', id_departamento: 3, departamento: 'Coordinación Académica', telefono: '3109876543', estado: true },
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
  { id_equipo: 1, codigo: 'EQ-SENA-001', codigo_inventario: 'EQ-SENA-001', nombre: 'Portátil Lenovo ThinkPad E14', nombre_equipo: 'Portátil Lenovo ThinkPad E14', serial: 'PF3A9921', tipo: 'Computador Portátil' },
  { id_equipo: 2, codigo: 'EQ-SENA-002', codigo_inventario: 'EQ-SENA-002', nombre: 'PC de Escritorio HP ProDesk', nombre_equipo: 'PC de Escritorio HP ProDesk', serial: 'MXL8201B4', tipo: 'Computador Escritorio' },
  { id_equipo: 3, codigo: 'EQ-SENA-003', codigo_inventario: 'EQ-SENA-003', nombre: 'Impresora Láser HP LaserJet Pro', nombre_equipo: 'Impresora Láser HP LaserJet Pro', serial: 'VNB3K1234', tipo: 'Impresora' },
  { id_equipo: 4, codigo: 'EQ-SENA-004', codigo_inventario: 'EQ-SENA-004', nombre: 'Switch Cisco Catalyst 24P', nombre_equipo: 'Switch Cisco Catalyst 24P', serial: 'FCW2109A01', tipo: 'Red' },
]

// Cálculo fiel del SLA estructurado
function calcularSlaMock(ticket) {
  const tiempoResp = ticket.prioridad === 'Crítica' ? 60 : (ticket.prioridad === 'Alta' ? 120 : (ticket.prioridad === 'Media' ? 240 : 480))
  const tiempoSol = ticket.prioridad === 'Crítica' ? 240 : (ticket.prioridad === 'Alta' ? 480 : (ticket.prioridad === 'Media' ? 1440 : 2880))
  
  const esCerrado = ticket.estado === 'Resuelto' || ticket.estado === 'Cerrado'
  const transcurridoSol = esCerrado ? Math.round(tiempoSol * 0.6) : Math.round(tiempoSol * 0.4)
  const pctSol = Math.min(100, Math.round((transcurridoSol / tiempoSol) * 100))

  return {
    nombre: `${ticket.prioridad} (${tiempoResp / 60}h resp / ${tiempoSol / 60}h sol)`,
    respuesta: {
      limite_min: tiempoResp,
      transcurrido_min: Math.round(tiempoResp * 0.35),
      porcentaje: 35,
      completado: true,
      cumplido: true,
    },
    solucion: {
      limite_min: tiempoSol,
      transcurrido_min: transcurridoSol,
      porcentaje: pctSol,
      completado: esCerrado,
      cumplido: true,
    },
  }
}

function accionesMock(ticket) {
  return {
    estados_permitidos: ['Abierto', 'En proceso', 'Resuelto', 'Cerrado'],
    puede_cambiar_estado: true,
    puede_asignar: true,
    puede_comentar: ticket.estado !== 'Cerrado',
    puede_calificar: (ticket.estado === 'Resuelto' || ticket.estado === 'Cerrado') && !ticket.calificacion,
  }
}

function serializarTicketMock(t) {
  return {
    id_ticket: t.id_ticket,
    codigo: t.codigo,
    asunto: t.asunto,
    descripcion: t.descripcion,
    prioridad: t.prioridad,
    estado: t.estado,
    categoria: t.categoria,
    id_categoria: t.id_categoria,
    fecha_creacion: t.fecha_creacion,
    fecha_cierre: t.fecha_cierre || null,
    solicitante: t.solicitante,
    correo_solicitante: t.correo_solicitante || 'solicitante@sgts.local',
    departamento: t.departamento || 'Tecnología e Informática',
    cargo_solicitante: t.cargo_solicitante || 'Instructor ADSO',
    tecnico: t.tecnico,
    id_empleado_tecnico: t.id_empleado_tecnico,
    calificacion: t.calificacion,
    comentario_calificacion: t.comentario_calificacion,
    equipos: t.equipos || [
      { id_equipo: 1, codigo_inventario: 'EQ-SENA-001', nombre_equipo: 'Portátil Lenovo ThinkPad E14' }
    ],
    sla: calcularSlaMock(t),
    acciones: accionesMock(t),
    seguimientos: (t.seguimientos || []).map((s) => ({
      id_seguimiento: s.id_seguimiento,
      fecha: s.fecha || s.fecha_actualizacion || new Date().toISOString(),
      autor: s.autor || 'Admin SGTS',
      rol_autor: s.rol_autor || 'administrador',
      comentario: s.comentario,
      estado: s.estado || t.estado,
    })),
  }
}

let tickets = [
  {
    id_ticket: 1,
    codigo: 'TK-2026-0001',
    asunto: 'Equipo no enciende en Aula de Cómputo 2',
    descripcion: 'Al presionar el botón de encendido del equipo no da señal de video ni encienden los ventiladores del chasis.',
    estado: 'En proceso',
    prioridad: 'Alta',
    fecha_creacion: '2026-10-15T09:30:00Z',
    solicitante: 'Rito Delgado',
    correo_solicitante: 'usuario@sgts.local',
    departamento: 'Coordinación Académica',
    cargo_solicitante: 'Instructor ADSO',
    id_empleado_solicitante: 2,
    tecnico: 'Patrick Morales',
    id_empleado_tecnico: 3,
    categoria: 'Fallo de Hardware',
    id_categoria: 1,
    calificacion: null,
    comentario_calificacion: null,
    equipos: [{ id_equipo: 2, codigo_inventario: 'EQ-SENA-002', nombre_equipo: 'PC de Escritorio HP ProDesk' }],
    seguimientos: [
      { id_seguimiento: 1, fecha: '2026-10-15T09:45:00Z', autor: 'Admin SGTS', rol_autor: 'administrador', comentario: 'Ticket recibido y asignado a soporte técnico.', estado: 'Abierto' },
      { id_seguimiento: 2, fecha: '2026-10-15T10:15:00Z', autor: 'Patrick Morales', rol_autor: 'tecnico', comentario: 'Revisión en sitio iniciada. Fuente de poder revisada.', estado: 'En proceso' },
    ],
  },
  {
    id_ticket: 2,
    codigo: 'TK-2026-0002',
    asunto: 'Instalación de suite de diseño gráfico y Node.js',
    descripcion: 'Se requiere instalar entorno de desarrollo web en las estaciones de trabajo de los aprendices de ADSO.',
    estado: 'Abierto',
    prioridad: 'Media',
    fecha_creacion: '2026-10-16T08:15:00Z',
    solicitante: 'Rito Delgado',
    correo_solicitante: 'usuario@sgts.local',
    departamento: 'Coordinación Académica',
    cargo_solicitante: 'Instructor ADSO',
    id_empleado_solicitante: 2,
    tecnico: null,
    id_empleado_tecnico: null,
    categoria: 'Instalación de Software',
    id_categoria: 2,
    calificacion: null,
    comentario_calificacion: null,
    equipos: [{ id_equipo: 1, codigo_inventario: 'EQ-SENA-001', nombre_equipo: 'Portátil Lenovo ThinkPad E14' }],
    seguimientos: [
      { id_seguimiento: 3, fecha: '2026-10-16T08:15:00Z', autor: 'Rito Delgado', rol_autor: 'usuario', comentario: 'Ticket creado por el usuario en la plataforma.', estado: 'Abierto' },
    ],
  },
  {
    id_ticket: 3,
    codigo: 'TK-2026-0003',
    asunto: 'Intermitencia en red Wi-Fi Administrativa',
    descripcion: 'Caída de conexión intermitente durante llamadas virtuales y sincronización de expedientes.',
    estado: 'Resuelto',
    prioridad: 'Crítica',
    fecha_creacion: '2026-10-14T11:00:00Z',
    fecha_cierre: '2026-10-14T14:30:00Z',
    solicitante: 'Admin SGTS',
    correo_solicitante: 'admin@sgts.local',
    departamento: 'Tecnología e Informática',
    cargo_solicitante: 'Administrador del Sistema',
    id_empleado_solicitante: 1,
    tecnico: 'Johan Pantoja',
    id_empleado_tecnico: 4,
    categoria: 'Conectividad y Red',
    id_categoria: 3,
    calificacion: 5,
    comentario_calificacion: 'Excelente atención y rapidez en la solución.',
    equipos: [{ id_equipo: 4, codigo_inventario: 'EQ-SENA-004', nombre_equipo: 'Switch Cisco Catalyst 24P' }],
    seguimientos: [
      { id_seguimiento: 4, fecha: '2026-10-14T11:20:00Z', autor: 'Johan Pantoja', rol_autor: 'tecnico', comentario: 'Canal Wi-Fi reconfigurado en punto de acceso principal.', estado: 'En proceso' },
      { id_seguimiento: 5, fecha: '2026-10-14T14:30:00Z', autor: 'Johan Pantoja', rol_autor: 'tecnico', comentario: 'Pruebas de conectividad estables. Ticket resuelto.', estado: 'Resuelto' },
    ],
  },
]

// Registro de Auditoría con identificadores de tickets reales y enlaces
let auditoria = [
  {
    id_auditoria: 1,
    fecha: '2026-10-16T18:00:00Z',
    id_ticket: 1,
    codigo: 'TK-2026-0001',
    accion: 'Cambió el estado de TK-2026-0001: Abierto → En proceso',
    responsable: 'Patrick Morales',
    rol: 'tecnico',
  },
  {
    id_auditoria: 2,
    fecha: '2026-10-16T17:30:00Z',
    id_ticket: 1,
    codigo: 'TK-2026-0001',
    accion: 'Asignó TK-2026-0001 a Patrick Morales',
    responsable: 'Admin SGTS',
    rol: 'administrador',
  },
  {
    id_auditoria: 3,
    fecha: '2026-10-16T16:15:00Z',
    id_ticket: 2,
    codigo: 'TK-2026-0002',
    accion: 'Creó el ticket TK-2026-0002 con prioridad Media',
    responsable: 'Rito Delgado',
    rol: 'usuario',
  },
  {
    id_auditoria: 4,
    fecha: '2026-10-14T14:30:00Z',
    id_ticket: 3,
    codigo: 'TK-2026-0003',
    accion: 'Calificó TK-2026-0003 con 5/5: "Excelente atención y rapidez"',
    responsable: 'Admin SGTS',
    rol: 'administrador',
  },
  {
    id_auditoria: 5,
    fecha: '2026-10-14T14:28:00Z',
    id_ticket: 3,
    codigo: 'TK-2026-0003',
    accion: 'Cambió el estado de TK-2026-0003: En proceso → Resuelto',
    responsable: 'Johan Pantoja',
    rol: 'tecnico',
  },
]

export async function handleMockRequest(config) {
  // Retardo de red simulado (100ms)
  await new Promise((r) => setTimeout(r, 100))

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

    // Registrar en auditoría
    auditoria.unshift({
      id_auditoria: Date.now(),
      fecha: new Date().toISOString(),
      id_ticket: 1,
      codigo: 'TK-2026-0001',
      accion: `Inicio de sesión exitoso (${usuario.rol})`,
      responsable: usuario.nombre_completo,
      rol: usuario.rol,
    })

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
    const porEstado = [
      { label: 'Abierto', value: tickets.filter((t) => t.estado === 'Abierto').length },
      { label: 'En proceso', value: tickets.filter((t) => t.estado === 'En proceso').length },
      { label: 'Resuelto', value: tickets.filter((t) => t.estado === 'Resuelto').length },
      { label: 'Cerrado', value: tickets.filter((t) => t.estado === 'Cerrado').length },
    ]
    const porPrioridad = [
      { label: 'Crítica', value: tickets.filter((t) => t.prioridad === 'Crítica').length },
      { label: 'Alta', value: tickets.filter((t) => t.prioridad === 'Alta').length },
      { label: 'Media', value: tickets.filter((t) => t.prioridad === 'Media').length },
      { label: 'Baja', value: tickets.filter((t) => t.prioridad === 'Baja').length },
    ]

    return makeResponse({
      total: tickets.length,
      por_estado: porEstado,
      por_prioridad: porPrioridad,
      sla_cumplimiento: 94.5,
      calificacion_promedio: 4.8,
      sin_asignar: tickets.filter((t) => !t.id_empleado_tecnico).length,
      empleados_activos: empleados.length,
      recientes: tickets.slice(0, 5).map(serializarTicketMock),
      actividad: [
        { fecha: '2026-10-16T18:15:00Z', codigo: 'TK-2026-0001', autor: 'Patrick Morales', comentario: 'Revisión en sitio iniciada.' },
        { fecha: '2026-10-16T17:00:00Z', codigo: 'TK-2026-0002', autor: 'Rito Delgado', comentario: 'Ticket creado por el usuario.' },
        { fecha: '2026-10-14T14:30:00Z', codigo: 'TK-2026-0003', autor: 'Johan Pantoja', comentario: 'Ticket resuelto y calificado.' },
      ],
    }, 200, config)
  }

  // 6. Tickets: Listado con Conteos Exactos
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

    // Conteos con nombres de clave exactos que espera TicketsView.vue
    const conteos = {
      total: tickets.length,
      abierto: tickets.filter((t) => t.estado === 'Abierto').length,
      en_proceso: tickets.filter((t) => t.estado === 'En proceso').length,
      resuelto: tickets.filter((t) => t.estado === 'Resuelto').length,
      cerrado: tickets.filter((t) => t.estado === 'Cerrado').length,
    }

    return makeResponse({
      items: filtrados.map(serializarTicketMock),
      total: filtrados.length,
      page: config.params?.page || 1,
      pages: 1,
      conteos,
    }, 200, config)
  }

  // Creación de ticket
  if (url === '/tickets' && method === 'post') {
    const nuevoId = tickets.length + 1
    const codigo = `TK-2026-${String(nuevoId).padStart(4, '0')}`
    const cat = categorias.find((c) => c.id_categoria === data.id_categoria)

    const nuevoTicket = {
      id_ticket: nuevoId,
      codigo,
      asunto: data.asunto,
      descripcion: data.descripcion,
      estado: 'Abierto',
      prioridad: data.prioridad || 'Media',
      fecha_creacion: new Date().toISOString(),
      solicitante: 'Johan Pantoja',
      correo_solicitante: 'admin@sgts.local',
      departamento: 'Tecnología e Informática',
      cargo_solicitante: 'Líder Frontend',
      id_empleado_solicitante: 1,
      tecnico: null,
      id_empleado_tecnico: null,
      categoria: cat ? cat.nombre : 'General',
      id_categoria: data.id_categoria,
      calificacion: null,
      comentario_calificacion: null,
      equipos: [{ id_equipo: 1, codigo_inventario: 'EQ-SENA-001', nombre_equipo: 'Portátil Lenovo ThinkPad E14' }],
      seguimientos: [
        { id_seguimiento: Date.now(), fecha: new Date().toISOString(), autor: 'Johan Pantoja', rol_autor: 'administrador', comentario: 'Ticket registrado en la plataforma.', estado: 'Abierto' },
      ],
    }
    tickets.unshift(nuevoTicket)

    // Agregar evento a auditoría
    auditoria.unshift({
      id_auditoria: Date.now(),
      fecha: new Date().toISOString(),
      id_ticket: nuevoId,
      codigo,
      accion: `Creó el ticket ${codigo} con prioridad ${nuevoTicket.prioridad}`,
      responsable: 'Johan Pantoja',
      rol: 'administrador',
    })

    return makeResponse(serializarTicketMock(nuevoTicket), 201, config)
  }

  // 7. Detalle individual de ticket
  const ticketIdMatch = url.match(/^\/tickets\/(\d+)$/)
  if (ticketIdMatch && method === 'get') {
    const id = parseInt(ticketIdMatch[1])
    const ticket = tickets.find((t) => t.id_ticket === id)
    if (!ticket) return makeError(404, 'Ticket no encontrado', config)
    return makeResponse(serializarTicketMock(ticket), 200, config)
  }

  // 8. Seguimientos
  const segMatch = url.match(/^\/tickets\/(\d+)\/seguimientos$/)
  if (segMatch && method === 'post') {
    const id = parseInt(segMatch[1])
    const ticket = tickets.find((t) => t.id_ticket === id)
    if (!ticket) return makeError(404, 'Ticket no encontrado', config)
    ticket.seguimientos.push({
      id_seguimiento: Date.now(),
      fecha: new Date().toISOString(),
      autor: 'Johan Pantoja',
      rol_autor: 'administrador',
      comentario: data.comentario,
      estado: ticket.estado,
    })
    return makeResponse(serializarTicketMock(ticket), 200, config)
  }

  // 9. Asignar técnico
  const asigMatch = url.match(/^\/tickets\/(\d+)\/asignar$/)
  if (asigMatch && method === 'patch') {
    const id = parseInt(asigMatch[1])
    const ticket = tickets.find((t) => t.id_ticket === id)
    if (!ticket) return makeError(404, 'Ticket no encontrado', config)
    const tec = tecnicos.find((t) => t.id_empleado === data.id_empleado_tecnico)
    const anterior = ticket.tecnico || 'sin asignar'
    ticket.tecnico = tec ? tec.nombre_completo : null
    ticket.id_empleado_tecnico = data.id_empleado_tecnico
    ticket.seguimientos.push({
      id_seguimiento: Date.now(),
      fecha: new Date().toISOString(),
      autor: 'Admin SGTS',
      rol_autor: 'administrador',
      comentario: `Ticket asignado al técnico ${ticket.tecnico || 'Sin asignar'}`,
      estado: ticket.estado,
    })

    // Registrar en auditoría
    auditoria.unshift({
      id_auditoria: Date.now(),
      fecha: new Date().toISOString(),
      id_ticket: ticket.id_ticket,
      codigo: ticket.codigo,
      accion: `Asignó ${ticket.codigo} a ${ticket.tecnico} (antes: ${anterior})`,
      responsable: 'Admin SGTS',
      rol: 'administrador',
    })

    return makeResponse(serializarTicketMock(ticket), 200, config)
  }

  // 10. Cambiar estado
  const estadoMatch = url.match(/^\/tickets\/(\d+)\/estado$/)
  if (estadoMatch && method === 'patch') {
    const id = parseInt(estadoMatch[1])
    const ticket = tickets.find((t) => t.id_ticket === id)
    if (!ticket) return makeError(404, 'Ticket no encontrado', config)
    const anterior = ticket.estado
    ticket.estado = data.estado
    if (data.estado === 'Cerrado' || data.estado === 'Resuelto') {
      ticket.fecha_cierre = new Date().toISOString()
    } else {
      ticket.fecha_cierre = null
      ticket.calificacion = null
      ticket.comentario_calificacion = null
    }
    const texto = data.comentario || `Cambio de estado: ${anterior} → ${data.estado}`
    ticket.seguimientos.push({
      id_seguimiento: Date.now(),
      fecha: new Date().toISOString(),
      autor: 'Johan Pantoja',
      rol_autor: 'administrador',
      comentario: texto,
      estado: data.estado,
    })

    // Registrar en auditoría
    auditoria.unshift({
      id_auditoria: Date.now(),
      fecha: new Date().toISOString(),
      id_ticket: ticket.id_ticket,
      codigo: ticket.codigo,
      accion: `Cambió el estado de ${ticket.codigo}: ${anterior} → ${data.estado}`,
      responsable: 'Johan Pantoja',
      rol: 'administrador',
    })

    return makeResponse(serializarTicketMock(ticket), 200, config)
  }

  // 11. Calificar ticket
  const califMatch = url.match(/^\/tickets\/(\d+)\/calificar$/)
  if (califMatch && method === 'post') {
    const id = parseInt(califMatch[1])
    const ticket = tickets.find((t) => t.id_ticket === id)
    if (!ticket) return makeError(404, 'Ticket no encontrado', config)
    ticket.calificacion = data.calificacion
    ticket.comentario_calificacion = data.comentario

    // Registrar en auditoría
    auditoria.unshift({
      id_auditoria: Date.now(),
      fecha: new Date().toISOString(),
      id_ticket: ticket.id_ticket,
      codigo: ticket.codigo,
      accion: `Calificó ${ticket.codigo} con ${data.calificacion}/5`,
      responsable: ticket.solicitante,
      rol: 'usuario',
    })

    return makeResponse(serializarTicketMock(ticket), 200, config)
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

  // 14. Auditoría con soporte de búsqueda y ticket ID navegable
  if (url.startsWith('/auditoria') && method === 'get') {
    const q = (config.params?.q || '').toLowerCase()
    let filtrada = auditoria.filter((a) => {
      if (!q) return true
      return (
        (a.codigo && a.codigo.toLowerCase().includes(q)) ||
        (a.accion && a.accion.toLowerCase().includes(q)) ||
        (a.responsable && a.responsable.toLowerCase().includes(q))
      )
    })
    return makeResponse({ items: filtrada, total: filtrada.length, page: 1, pages: 1 }, 200, config)
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
