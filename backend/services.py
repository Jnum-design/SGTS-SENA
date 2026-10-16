"""Lógica compartida: auditoría, serialización y cálculo de SLA."""
from datetime import datetime

from sqlalchemy.orm import Session

from models import Auditoria, Empleado, Ticket

# Transiciones de estado permitidas (el administrador puede todas; el técnico solo las marcadas)
TRANSICIONES = {
    "Abierto": ["En proceso", "Cerrado"],
    "En proceso": ["Resuelto", "Abierto", "Cerrado"],
    "Resuelto": ["Cerrado", "En proceso"],
    "Cerrado": ["En proceso"],
}
TRANSICIONES_TECNICO = {
    "Abierto": ["En proceso"],
    "En proceso": ["Resuelto"],
    "Resuelto": ["En proceso"],
    "Cerrado": [],
}


def registrar_auditoria(db: Session, id_ticket: int, id_empleado: int, accion: str) -> None:
    db.add(Auditoria(id_ticket=id_ticket, id_empleado_responsable=id_empleado,
                     accion_realizada=accion, fecha=datetime.now()))


def nombre(emp: Empleado | None) -> str | None:
    return emp.nombre_completo if emp else None


def _sla_tramo(inicio: datetime, fin: datetime | None, limite_min: int) -> dict:
    referencia = fin or datetime.now()
    transcurrido = (referencia - inicio).total_seconds() / 60
    pct = round(transcurrido / limite_min * 100, 1) if limite_min else 0
    completado = fin is not None
    return {
        "limite_min": limite_min,
        "transcurrido_min": round(transcurrido, 1),
        "porcentaje": pct,
        "completado": completado,
        "cumplido": (pct <= 100) if completado else (None if pct <= 100 else False),
    }


def calcular_sla(t: Ticket) -> dict:
    return {
        "nombre": t.sla.nombre,
        "respuesta": _sla_tramo(t.fecha_creacion, t.fecha_primera_respuesta, t.sla.tiempo_respuesta),
        "solucion": _sla_tramo(t.fecha_creacion, t.fecha_cierre, t.sla.tiempo_solucion),
    }


def acciones_para(t: Ticket, user: Empleado) -> dict:
    es_admin = user.rol == "administrador"
    es_tecnico_asignado = user.rol == "tecnico" and t.id_empleado_tecnico == user.id_empleado
    es_reporta = t.id_empleado_reporta == user.id_empleado
    if es_admin:
        estados = TRANSICIONES[t.estado]
    elif es_tecnico_asignado:
        estados = TRANSICIONES_TECNICO[t.estado]
    else:
        estados = []
    return {
        "estados_permitidos": estados,
        "puede_cambiar_estado": bool(estados),
        "puede_asignar": es_admin,
        "puede_comentar": (es_admin or es_tecnico_asignado or es_reporta) and t.estado != "Cerrado",
        "puede_calificar": es_reporta and t.estado in ("Resuelto", "Cerrado") and t.calificacion is None,
    }


def puede_ver(t: Ticket, user: Empleado) -> bool:
    if user.rol == "administrador":
        return True
    return user.id_empleado in (t.id_empleado_reporta, t.id_empleado_tecnico)


def serializar_ticket(t: Ticket, user: Empleado, detalle: bool = False) -> dict:
    data = {
        "id_ticket": t.id_ticket,
        "codigo": t.codigo,
        "asunto": t.asunto,
        "prioridad": t.prioridad,
        "estado": t.estado,
        "categoria": t.categoria.nombre if t.categoria else None,
        "fecha_creacion": t.fecha_creacion,
        "fecha_cierre": t.fecha_cierre,
        "solicitante": nombre(t.reporta),
        "departamento": t.reporta.departamento.nombre if t.reporta else None,
        "tecnico": nombre(t.tecnico),
        "id_empleado_tecnico": t.id_empleado_tecnico,
        "calificacion": t.calificacion,
        "acciones": acciones_para(t, user),
    }
    if detalle:
        data.update({
            "descripcion": t.descripcion,
            "comentario_calificacion": t.comentario_calificacion,
            "fecha_primera_respuesta": t.fecha_primera_respuesta,
            "correo_solicitante": t.reporta.correo,
            "cargo_solicitante": t.reporta.cargo,
            "equipos": [{"id_equipo": e.id_equipo, "codigo_inventario": e.codigo_inventario,
                         "nombre_equipo": e.nombre_equipo} for e in t.equipos],
            "sla": calcular_sla(t),
            "seguimientos": [{
                "id_seguimiento": s.id_seguimiento,
                "fecha": s.fecha_actualizacion,
                "comentario": s.comentario,
                "estado": s.estado_actual,
                "autor": nombre(s.autor),
                "rol_autor": s.autor.rol,
            } for s in t.seguimientos],
        })
    return data
