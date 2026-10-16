from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Categoria, Departamento, Empleado, Equipo, SLA, Ticket
from security import get_current_user, require_roles

router = APIRouter(tags=["Catálogos"])


@router.get("/departamentos")
def departamentos(db: Session = Depends(get_db), _: Empleado = Depends(get_current_user)):
    return [{"id_departamento": d.id_departamento, "nombre": d.nombre}
            for d in db.scalars(select(Departamento).order_by(Departamento.nombre))]


@router.get("/categorias")
def categorias(db: Session = Depends(get_db), _: Empleado = Depends(get_current_user)):
    return [{"id_categoria": c.id_categoria, "nombre": c.nombre}
            for c in db.scalars(select(Categoria).order_by(Categoria.nombre))]


@router.get("/sla")
def sla(db: Session = Depends(get_db), _: Empleado = Depends(get_current_user)):
    return [{"prioridad": s.prioridad, "nombre": s.nombre, "tiempo_respuesta": s.tiempo_respuesta,
             "tiempo_solucion": s.tiempo_solucion}
            for s in db.scalars(select(SLA).order_by(SLA.tiempo_respuesta))]


@router.get("/tecnicos")
def tecnicos(db: Session = Depends(get_db), _: Empleado = Depends(require_roles("administrador", "tecnico"))):
    carga = dict(db.execute(select(Ticket.id_empleado_tecnico, func.count()).where(
        Ticket.estado.in_(["Abierto", "En proceso"]), Ticket.id_empleado_tecnico.is_not(None)
    ).group_by(Ticket.id_empleado_tecnico)).all())
    tecs = db.scalars(select(Empleado).options(joinedload(Empleado.tecnico_detalle), joinedload(Empleado.departamento))
                      .where(Empleado.rol == "tecnico", Empleado.estado.is_(True))
                      .order_by(Empleado.nombre)).all()
    return [{"id_empleado": e.id_empleado, "nombre_completo": e.nombre_completo,
             "especialidad": e.tecnico_detalle.especialidad if e.tecnico_detalle else None,
             "departamento": e.departamento.nombre, "tickets_activos": carga.get(e.id_empleado, 0)}
            for e in tecs]


@router.get("/equipos")
def equipos(q: str | None = None, db: Session = Depends(get_db), user: Empleado = Depends(get_current_user)):
    stmt = select(Equipo).options(joinedload(Equipo.departamento)).order_by(Equipo.codigo_inventario).limit(100)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(or_(Equipo.codigo_inventario.ilike(like), Equipo.nombre_equipo.ilike(like),
                              Equipo.marca.ilike(like)))
    return [{"id_equipo": e.id_equipo, "codigo_inventario": e.codigo_inventario,
             "nombre_equipo": e.nombre_equipo, "marca": e.marca, "modelo": e.modelo,
             "departamento": e.departamento.nombre} for e in db.scalars(stmt)]
