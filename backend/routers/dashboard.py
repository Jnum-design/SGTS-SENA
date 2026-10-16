from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Empleado, Seguimiento, Ticket
from routers.tickets import _alcance, _opciones
from security import get_current_user
from services import serializar_ticket

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

ESTADOS = ["Abierto", "En proceso", "Resuelto", "Cerrado"]
PRIORIDADES = ["Crítica", "Alta", "Media", "Baja"]


@router.get("/resumen")
def resumen(db: Session = Depends(get_db), user: Empleado = Depends(get_current_user)):
    alcance = _alcance(user)
    por_estado = dict(db.execute(select(Ticket.estado, func.count()).where(alcance).group_by(Ticket.estado)).all())
    por_prioridad = dict(db.execute(select(Ticket.prioridad, func.count()).where(alcance)
                                    .group_by(Ticket.prioridad)).all())

    # Cumplimiento de SLA: tickets con cierre cuya solución estuvo dentro del tiempo
    cerrados = db.scalars(select(Ticket).options(joinedload(Ticket.sla)).where(
        alcance, Ticket.fecha_cierre.is_not(None))).all()
    dentro = sum(1 for t in cerrados
                 if (t.fecha_cierre - t.fecha_creacion).total_seconds() / 60 <= t.sla.tiempo_solucion)
    sla_pct = round(dentro / len(cerrados) * 100, 1) if cerrados else None

    calif = db.scalar(select(func.avg(Ticket.calificacion)).where(alcance, Ticket.calificacion.is_not(None)))

    recientes = db.scalars(select(Ticket).options(*_opciones()).where(alcance)
                           .order_by(Ticket.fecha_creacion.desc()).limit(5)).all()

    actividad = db.execute(
        select(Seguimiento, Ticket.codigo).join(Ticket, Ticket.id_ticket == Seguimiento.id_ticket)
        .options(joinedload(Seguimiento.autor)).where(alcance)
        .order_by(Seguimiento.fecha_actualizacion.desc()).limit(6)).all()

    data = {
        "total": sum(por_estado.values()),
        "por_estado": [{"label": e, "value": por_estado.get(e, 0)} for e in ESTADOS],
        "por_prioridad": [{"label": p, "value": por_prioridad.get(p, 0)} for p in PRIORIDADES],
        "sla_cumplimiento": sla_pct,
        "calificacion_promedio": round(float(calif), 2) if calif is not None else None,
        "recientes": [serializar_ticket(t, user) for t in recientes],
        "actividad": [{"fecha": s.fecha_actualizacion, "codigo": codigo, "autor": s.autor.nombre_completo,
                       "comentario": s.comentario} for s, codigo in actividad],
    }
    if user.rol == "administrador":
        data["sin_asignar"] = db.scalar(select(func.count()).select_from(Ticket).where(
            Ticket.id_empleado_tecnico.is_(None), Ticket.estado.in_(["Abierto", "En proceso"])))
        data["empleados_activos"] = db.scalar(select(func.count()).select_from(Empleado).where(Empleado.estado.is_(True)))
    return data
