from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

import config
from database import get_db
from models import Empleado

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer(auto_error=False)


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except ValueError:
        return False


def create_token(data: dict, minutes: int | None = None) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=minutes or config.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, config.SECRET_KEY, algorithm=config.ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])


def get_current_user(creds: HTTPAuthorizationCredentials | None = Depends(bearer),
                     db: Session = Depends(get_db)) -> Empleado:
    err = HTTPException(status.HTTP_401_UNAUTHORIZED, "No autenticado",
                        headers={"WWW-Authenticate": "Bearer"})
    if creds is None:
        raise err
    try:
        data = decode_token(creds.credentials)
        if data.get("purpose"):          # los tokens de recuperación no sirven para la API
            raise err
        user = db.get(Empleado, int(data["sub"]))
    except (JWTError, KeyError, ValueError):
        raise err
    if user is None or not user.estado:
        raise err
    return user


def require_roles(*roles: str):
    def dependency(user: Empleado = Depends(get_current_user)) -> Empleado:
        if user.rol not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No tienes permisos para esta acción")
        return user
    return dependency
