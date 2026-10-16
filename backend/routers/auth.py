import re
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from jose import JWTError
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

import config
from database import get_db
from models import CodigoRecuperacion, Empleado
from schemas import Correo
from security import (create_token, decode_token, get_current_user, hash_password,
                      verify_password)

router = APIRouter(prefix="/auth", tags=["Autenticación"])

MAX_INTENTOS = 5
VIGENCIA_CODIGO_MIN = 15


class LoginIn(BaseModel):
    correo: Correo
    contrasena: str


class CorreoIn(BaseModel):
    correo: Correo


class ValidarCodigoIn(BaseModel):
    correo: Correo
    codigo: str


class NuevaContrasenaIn(BaseModel):
    reset_token: str
    nueva_contrasena: str


def perfil(e: Empleado) -> dict:
    return {
        "id_empleado": e.id_empleado, "nombre": e.nombre, "apellido": e.apellido,
        "nombre_completo": e.nombre_completo, "correo": e.correo, "rol": e.rol,
        "cargo": e.cargo, "id_departamento": e.id_departamento,
        "departamento": e.departamento.nombre,
    }


def validar_fortaleza(clave: str) -> None:
    if len(clave) < 8 or not re.search(r"[A-Z]", clave) or not re.search(r"\d", clave):
        raise HTTPException(400, "La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número")


@router.post("/login")
def login(datos: LoginIn, db: Session = Depends(get_db)):
    emp = db.scalar(select(Empleado).where(Empleado.correo == datos.correo.lower()))
    if not emp or not emp.estado or not verify_password(datos.contrasena, emp.contrasena):
        raise HTTPException(401, "Credenciales inválidas")
    token = create_token({"sub": str(emp.id_empleado), "rol": emp.rol})
    return {"access_token": token, "token_type": "bearer", "usuario": perfil(emp)}


@router.get("/me")
def me(user: Empleado = Depends(get_current_user)):
    return perfil(user)


@router.post("/recuperar")
def recuperar(datos: CorreoIn, db: Session = Depends(get_db)):
    """Responde igual exista o no el correo (evita enumerar usuarios)."""
    respuesta = {"mensaje": "Si el correo está registrado, recibirás un código de verificación."}
    emp = db.scalar(select(Empleado).where(Empleado.correo == datos.correo.lower(), Empleado.estado.is_(True)))
    if not emp:
        return respuesta
    for viejo in db.scalars(select(CodigoRecuperacion).where(
            CodigoRecuperacion.id_empleado == emp.id_empleado, CodigoRecuperacion.usado.is_(False))):
        viejo.usado = True
    codigo = f"{secrets.randbelow(10**6):06d}"
    db.add(CodigoRecuperacion(id_empleado=emp.id_empleado, codigo_hash=hash_password(codigo),
                              expira_en=datetime.now() + timedelta(minutes=VIGENCIA_CODIGO_MIN)))
    db.commit()
    # TODO producción: enviar por correo. En desarrollo se imprime en consola.
    print(f"[SGTS] Código de recuperación para {emp.correo}: {codigo}")
    if config.DEV_SHOW_RECOVERY_CODE:
        respuesta["codigo_dev"] = codigo
    return respuesta


@router.post("/validar-codigo")
def validar_codigo(datos: ValidarCodigoIn, db: Session = Depends(get_db)):
    emp = db.scalar(select(Empleado).where(Empleado.correo == datos.correo.lower()))
    reg = None
    if emp:
        reg = db.scalar(select(CodigoRecuperacion).where(
            CodigoRecuperacion.id_empleado == emp.id_empleado,
            CodigoRecuperacion.usado.is_(False),
            CodigoRecuperacion.expira_en > datetime.now()
        ).order_by(CodigoRecuperacion.creado_en.desc()))
    if not reg or reg.intentos >= MAX_INTENTOS:
        raise HTTPException(400, "Código inválido o expirado")
    if not verify_password(datos.codigo.strip(), reg.codigo_hash):
        reg.intentos += 1
        db.commit()
        raise HTTPException(400, "Código inválido o expirado")
    token = create_token({"sub": str(emp.id_empleado), "purpose": "reset", "cid": reg.id_codigo}, minutes=10)
    return {"reset_token": token}


@router.post("/nueva-contrasena")
def nueva_contrasena(datos: NuevaContrasenaIn, db: Session = Depends(get_db)):
    try:
        payload = decode_token(datos.reset_token)
    except JWTError:
        raise HTTPException(400, "El enlace de recuperación expiró. Solicita un nuevo código.")
    if payload.get("purpose") != "reset":
        raise HTTPException(400, "Token inválido")
    reg = db.get(CodigoRecuperacion, payload["cid"])
    emp = db.get(Empleado, int(payload["sub"]))
    if not reg or reg.usado or not emp:
        raise HTTPException(400, "El código ya fue utilizado")
    validar_fortaleza(datos.nueva_contrasena)
    emp.contrasena = hash_password(datos.nueva_contrasena)
    reg.usado = True
    db.commit()
    return {"mensaje": "Contraseña restablecida correctamente"}
