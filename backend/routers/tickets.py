import math
from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from database import get_db
from models import Categoria, Empleado, Equipo, SLA, Seguimiento, Ticket
from security import get_current_user, require_roles
from services import (acciones_para, puede_ver, registrar_auditoria, serializar_ticket)

router = APIRouter(prefix="/tickets", tags=["Tickets"])

Prioridad = Literal["Crítica", "Alta", "Media", "Baja"]
Estado = Literal["Abierto", "En proceso", "Resuelto", "Cerrado"]


class TicketIn(BaseModel):
    asunto: str = Field(min_length=5, max_length=200)
    descripcion: str = Field(min_length=10)
    prioridad: Prioridad = "Media"
    id_categoria: int | None = None
    equipos: list[int] = []


class EstadoIn(BaseModel):
    estado: Estado
    comentario: str | None = None


class AsignarIn(BaseModel):
    id_empleado_tecnico: int


class SeguimientoIn(BaseModel):
    comentario: str = Field(min_length=1)


class CalificarIn(BaseModel):
    calificacion: int = Field(ge=1, le=5)
    comentario: str | None = None


def _opciones():
    return (joinedload(Ticket.reporta).joinedload(Empleado.departamento),
            joinedload(Ticket.tecnico), joinedload(Ticket.categoria), joinedload(Ticket.sla))


def _alcance(user: Empleado):
    """Filtro de visibilidad según el rol."""
    if user.rol == "usuario":
        return Ticket.id_empleado_reporta == user.id_empleado
    if user.rol == "tecnico":
        return or_(Ticket.id_empleado_tecnico == user.id_empleado,
                   Ticket.id_empleado_reporta == user.id_empleado)
    return True


def _cargar(db: Session, id_ticket: int) -> Ticket:
    t = db.scalar(select(Ticket).options(
        *_opciones(), selectinload(Ticket.equipos),
        selectinload(Ticket.seguimientos).joinedload(Seguimiento.autor)
    ).where(Ticket.id_ticket == id_ticket))
    if not t:
        raise HTTPException(404, "Ticket no encontrado")
    return t


def _ticket_visible(db: Session, id_ticket: int, user: Empleado) -> Ticket:
    t = _cargar(db, id_ticket)
    if not puede_ver(t, user):
        raise HTTPException(403, "No tienes acceso a este ticket")
    return t


def _marcar_primera_respuesta(t: Ticket, autor: Empleado) -> None:
    if t.fecha_primera_respuesta is None and autor.id_empleado != t.id_empleado_reporta:
        t.fecha_primera_respuesta = datetime.now()


@router.get("")
def listar(estado: Estado | None = None, prioridad: Prioridad | None = None,
           q: str | None = None, page: int = Query(1, ge=1), size: int = Query(10, ge=1, le=100),
           db: Session = Depends(get_db), user: Empleado = Depends(get_current_user)):
    alcance = _alcance(user)
    filtros = [alcance]
    if estado:
        filtros.append(Ticket.estado == estado)
    if prioridad:
        filtros.append(Ticket.prioridad == prioridad)
    if q:
        like = f"%{q.strip()}%"
        filtros.append(or_(Ticket.asunto.ilike(like), Ticket.codigo.ilike(like)))

    total = db.scalar(select(func.count()).select_from(Ticket).where(*filtros)) or 0
    filas = db.scalars(select(Ticket).options(*_opciones()).where(*filtros)
                       .order_by(Ticket.fecha_creacion.desc())
                       .offset((page - 1) * size).limit(size)).all()

    conteo = dict(db.execute(select(Ticket.estado, func.count()).where(alcance)
                             .group_by(Ticket.estado)).all())
    return {
        "items": [serializar_ticket(t, user) for t in filas],
        "total": total, "page": page, "size": size, "pages": max(1, math.ceil(total / size)),
        "conteos": {
            "total": sum(conteo.values()),
            "abierto": conteo.get("Abierto", 0), "en_proceso": conteo.get("En proceso", 0),
            "resuelto": conteo.get("Resuelto", 0), "cerrado": conteo.get("Cerrado", 0),
        },
    }


@router.post("", status_code=201)
def crear(datos: TicketIn, db: Session = Depends(get_db), user: Empleado = Depends(get_current_user)):
    sla = db.scalar(select(SLA).where(SLA.prioridad == datos.prioridad))
    if not sla:
        raise HTTPException(500, f"No existe un SLA configurado para la prioridad {datos.prioridad}")
    if datos.id_categoria and not db.get(Categoria, datos.id_categoria):
        raise HTTPException(400, "Categoría inválida")
    equipos = []
    if datos.equipos:
        equipos = db.scalars(select(Equipo).where(Equipo.id_equipo.in_(datos.equipos))).all()
        if len(equipos) != len(set(datos.equipos)):
            raise HTTPException(400, "Alguno de los equipos seleccionados no existe")
    t = Ticket(asunto=datos.asunto.strip(), descripcion=datos.descripcion.strip(),
               prioridad=datos.prioridad, estado="Abierto", id_sla=sla.id_sla,
               id_categoria=datos.id_categoria, id_empleado_reporta=user.id_empleado,
               fecha_creacion=datetime.now(), equipos=list(equipos))
    db.add(t)
    db.flush()
    db.refresh(t)
    registrar_auditoria(db, t.id_ticket, user.id_empleado,
                        f"Creó el ticket {t.codigo} con prioridad {t.prioridad} (SLA: {sla.nombre})")
    db.commit()
    return serializar_ticket(_cargar(db, t.id_ticket), user, detalle=True)


@router.get("/{id_ticket}")
def detalle(id_ticket: int, db: Session = Depends(get_db), user: Empleado = Depends(get_current_user)):
    return serializar_ticket(_ticket_visible(db, id_ticket, user), user, detalle=True)


@router.patch("/{id_ticket}/estado")
def cambiar_estado(id_ticket: int, datos: EstadoIn, db: Session = Depends(get_db),
                   user: Empleado = Depends(require_roles("tecnico", "administrador"))):
    t = _ticket_visible(db, id_ticket, user)
    if datos.estado == t.estado:
        raise HTTPException(400, "El ticket ya está en ese estado")
    if datos.estado not in acciones_para(t, user)["estados_permitidos"]:
        raise HTTPException(403, f"No puedes cambiar el ticket de «{t.estado}» a «{datos.estado}»")
    anterior = t.estado
    t.estado = datos.estado
    if datos.estado in ("Resuelto", "Cerrado"):
        t.fecha_cierre = t.fecha_cierre or datetime.now()
    else:  # reapertura
        t.fecha_cierre = None
        t.calificacion = None
        t.comentario_calificacion = None
    _marcar_primera_respuesta(t, user)
    texto = (datos.comentario or "").strip() or f"Estado cambiado de {anterior} a {datos.estado}"
    db.add(Seguimiento(id_ticket=t.id_ticket, id_empleado_autor=user.id_empleado,
                       comentario=texto, estado_actual=datos.estado,
                       fecha_actualizacion=datetime.now()))
    registrar_auditoria(db, t.id_ticket, user.id_empleado,
                        f"Cambió el estado de {t.codigo}: {anterior} → {datos.estado}")
    db.commit()
    return serializar_ticket(_cargar(db, id_ticket), user, detalle=True)


@router.patch("/{id_ticket}/asignar")
def asignar(id_ticket: int, datos: AsignarIn, db: Session = Depends(get_db),
            user: Empleado = Depends(require_roles("administrador"))):
    t = _cargar(db, id_ticket)
    if t.estado == "Cerrado":
        raise HTTPException(400, "No se puede asignar un ticket cerrado")
    tec = db.get(Empleado, datos.id_empleado_tecnico)
    if not tec or tec.rol != "tecnico" or not tec.estado:
        raise HTTPException(400, "El empleado seleccionado no es un técnico activo")
    anterior = t.tecnico.nombre_completo if t.tecnico else "sin asignar"
    t.id_empleado_tecnico = tec.id_empleado
    db.add(Seguimiento(id_ticket=t.id_ticket, id_empleado_autor=user.id_empleado,
                       comentario=f"Ticket asignado al técnico {tec.nombre_completo}",
                       estado_actual=t.estado, fecha_actualizacion=datetime.now()))
    registrar_auditoria(db, t.id_ticket, user.id_empleado,
                        f"Asignó {t.codigo} a {tec.nombre_completo} (antes: {anterior})")
    db.commit()
    return serializar_ticket(_cargar(db, id_ticket), user, detalle=True)


@router.post("/{id_ticket}/seguimientos", status_code=201)
def agregar_seguimiento(id_ticket: int, datos: SeguimientoIn, db: Session = Depends(get_db),
                        user: Empleado = Depends(get_current_user)):
    t = _ticket_visible(db, id_ticket, user)
    if not acciones_para(t, user)["puede_comentar"]:
        raise HTTPException(403, "No puedes comentar en este ticket")
    db.add(Seguimiento(id_ticket=t.id_ticket, id_empleado_autor=user.id_empleado,
                       comentario=datos.comentario.strip(), estado_actual=t.estado,
                       fecha_actualizacion=datetime.now()))
    _marcar_primera_respuesta(t, user)
    db.commit()
    return serializar_ticket(_cargar(db, id_ticket), user, detalle=True)


@router.post("/{id_ticket}/calificar")
def calificar(id_ticket: int, datos: CalificarIn, db: Session = Depends(get_db),
              user: Empleado = Depends(get_current_user)):
    t = _ticket_visible(db, id_ticket, user)
    if t.id_empleado_reporta != user.id_empleado:
        raise HTTPException(403, "Solo quien reportó el ticket puede calificarlo")
    if t.estado not in ("Resuelto", "Cerrado"):
        raise HTTPException(400, "Solo se pueden calificar tickets resueltos o cerrados")
    if t.calificacion is not None:
        raise HTTPException(400, "Este ticket ya fue calificado")
    t.calificacion = datos.calificacion
    t.comentario_calificacion = (datos.comentario or "").strip() or None
    registrar_auditoria(db, t.id_ticket, user.id_empleado,
                        f"Calificó {t.codigo} con {datos.calificacion}/5")
    db.commit()
    return serializar_ticket(_cargar(db, id_ticket), user, detalle=True)
