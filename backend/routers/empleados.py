import math
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Departamento, Empleado, TecnicoDetalle, Ticket
from routers.auth import validar_fortaleza
from schemas import Correo
from security import hash_password, require_roles

router = APIRouter(prefix="/empleados", tags=["Personal"])
solo_admin = require_roles("administrador")
Rol = Literal["usuario", "tecnico", "administrador"]


class EmpleadoIn(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    apellido: str = Field(min_length=2, max_length=100)
    correo: Correo
    telefono: str | None = Field(default=None, max_length=20)
    cargo: str | None = Field(default=None, max_length=100)
    rol: Rol = "usuario"
    id_departamento: int
    especialidad: str | None = None
    contrasena: str | None = None
    estado: bool = True


def _ser(e: Empleado) -> dict:
    return {
        "id_empleado": e.id_empleado, "nombre": e.nombre, "apellido": e.apellido,
        "nombre_completo": e.nombre_completo, "correo": e.correo, "telefono": e.telefono,
        "cargo": e.cargo, "rol": e.rol, "estado": e.estado,
        "id_departamento": e.id_departamento, "departamento": e.departamento.nombre,
        "especialidad": e.tecnico_detalle.especialidad if e.tecnico_detalle else None,
    }


def _get(db: Session, id_empleado: int) -> Empleado:
    e = db.scalar(select(Empleado).options(joinedload(Empleado.departamento), joinedload(Empleado.tecnico_detalle))
                  .where(Empleado.id_empleado == id_empleado))
    if not e:
        raise HTTPException(404, "Empleado no encontrado")
    return e


def _validar(db: Session, d: EmpleadoIn) -> None:
    if not db.get(Departamento, d.id_departamento):
        raise HTTPException(400, "Departamento inválido")
    if d.rol == "tecnico" and not (d.especialidad or "").strip():
        raise HTTPException(400, "La especialidad es obligatoria para los técnicos")


def _aplicar_detalle(e: Empleado, d: EmpleadoIn) -> None:
    if d.rol == "tecnico":
        if e.tecnico_detalle:
            e.tecnico_detalle.especialidad = d.especialidad.strip()
        else:
            e.tecnico_detalle = TecnicoDetalle(especialidad=d.especialidad.strip())
    else:
        e.tecnico_detalle = None


@router.get("")
def listar(q: str | None = None, rol: Rol | None = None, id_departamento: int | None = None,
           estado: bool | None = None, page: int = Query(1, ge=1), size: int = Query(10, ge=1, le=100),
           db: Session = Depends(get_db), _: Empleado = Depends(solo_admin)):
    filtros = []
    if q:
        like = f"%{q.strip()}%"
        filtros.append(or_(Empleado.nombre.ilike(like), Empleado.apellido.ilike(like),
                           Empleado.correo.ilike(like), Empleado.cargo.ilike(like)))
    if rol:
        filtros.append(Empleado.rol == rol)
    if id_departamento:
        filtros.append(Empleado.id_departamento == id_departamento)
    if estado is not None:
        filtros.append(Empleado.estado.is_(estado))
    total = db.scalar(select(func.count()).select_from(Empleado).where(*filtros)) or 0
    filas = db.scalars(select(Empleado).options(joinedload(Empleado.departamento), joinedload(Empleado.tecnico_detalle))
                       .where(*filtros).order_by(Empleado.apellido, Empleado.nombre)
                       .offset((page - 1) * size).limit(size)).all()
    return {"items": [_ser(e) for e in filas], "total": total, "page": page, "size": size,
            "pages": max(1, math.ceil(total / size))}


@router.get("/{id_empleado}")
def obtener(id_empleado: int, db: Session = Depends(get_db), _: Empleado = Depends(solo_admin)):
    return _ser(_get(db, id_empleado))


@router.post("", status_code=201)
def crear(datos: EmpleadoIn, db: Session = Depends(get_db), _: Empleado = Depends(solo_admin)):
    _validar(db, datos)
    if not datos.contrasena:
        raise HTTPException(400, "La contraseña es obligatoria al crear un empleado")
    validar_fortaleza(datos.contrasena)
    e = Empleado(nombre=datos.nombre.strip(), apellido=datos.apellido.strip(), correo=datos.correo.lower(),
                 telefono=datos.telefono, cargo=datos.cargo, rol=datos.rol, estado=datos.estado,
                 id_departamento=datos.id_departamento, contrasena=hash_password(datos.contrasena))
    _aplicar_detalle(e, datos)
    db.add(e)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Ya existe un empleado con ese correo")
    return _ser(_get(db, e.id_empleado))


@router.put("/{id_empleado}")
def actualizar(id_empleado: int, datos: EmpleadoIn, db: Session = Depends(get_db),
               admin: Empleado = Depends(solo_admin)):
    e = _get(db, id_empleado)
    _validar(db, datos)
    if e.id_empleado == admin.id_empleado and (datos.rol != "administrador" or not datos.estado):
        raise HTTPException(400, "No puedes quitarte tu propio rol de administrador ni desactivarte")
    if e.rol == "tecnico" and datos.rol != "tecnico":
        activos = db.scalar(select(func.count()).select_from(Ticket).where(
            Ticket.id_empleado_tecnico == e.id_empleado, Ticket.estado.in_(["Abierto", "En proceso"])))
        if activos:
            raise HTTPException(400, f"El técnico tiene {activos} ticket(s) activos; reasígnalos antes de cambiar su rol")
    e.nombre, e.apellido, e.correo = datos.nombre.strip(), datos.apellido.strip(), datos.correo.lower()
    e.telefono, e.cargo, e.rol, e.estado = datos.telefono, datos.cargo, datos.rol, datos.estado
    e.id_departamento = datos.id_departamento
    if datos.contrasena:
        validar_fortaleza(datos.contrasena)
        e.contrasena = hash_password(datos.contrasena)
    _aplicar_detalle(e, datos)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Ya existe un empleado con ese correo")
    return _ser(_get(db, id_empleado))


@router.delete("/{id_empleado}")
def desactivar(id_empleado: int, db: Session = Depends(get_db), admin: Empleado = Depends(solo_admin)):
    """Borrado lógico: conserva el historial de tickets y auditoría."""
    e = _get(db, id_empleado)
    if e.id_empleado == admin.id_empleado:
        raise HTTPException(400, "No puedes desactivar tu propia cuenta")
    e.estado = False
    db.commit()
    return {"mensaje": f"{e.nombre_completo} fue desactivado"}
