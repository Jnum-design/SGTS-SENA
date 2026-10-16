import math
from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Auditoria, Empleado, Ticket
from security import require_roles

router = APIRouter(prefix="/auditoria", tags=["Auditoría"])


@router.get("")
def listar(q: str | None = None, id_ticket: int | None = None,
           desde: date | None = None, hasta: date | None = None,
           page: int = Query(1, ge=1), size: int = Query(10, ge=1, le=100),
           db: Session = Depends(get_db), _: Empleado = Depends(require_roles("administrador"))):
    base = select(Auditoria).join(Ticket, Ticket.id_ticket == Auditoria.id_ticket) \
        .join(Empleado, Empleado.id_empleado == Auditoria.id_empleado_responsable)
    if id_ticket:
        base = base.where(Auditoria.id_ticket == id_ticket)
    if desde:
        base = base.where(Auditoria.fecha >= desde)
    if hasta:
        base = base.where(Auditoria.fecha < hasta + timedelta(days=1))
    if q:
        like = f"%{q.strip()}%"
        base = base.where(or_(Auditoria.accion_realizada.ilike(like), Ticket.codigo.ilike(like),
                              Empleado.nombre.ilike(like), Empleado.apellido.ilike(like)))
    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    filas = db.scalars(base.options(joinedload(Auditoria.ticket), joinedload(Auditoria.responsable))
                       .order_by(Auditoria.fecha.desc(), Auditoria.id_auditoria.desc())
                       .offset((page - 1) * size).limit(size)).all()
    return {
        "items": [{"id_auditoria": a.id_auditoria, "fecha": a.fecha, "id_ticket": a.id_ticket,
                   "codigo": a.ticket.codigo, "accion": a.accion_realizada,
                   "responsable": a.responsable.nombre_completo, "rol": a.responsable.rol} for a in filas],
        "total": total, "page": page, "size": size, "pages": max(1, math.ceil(total / size)),
    }
