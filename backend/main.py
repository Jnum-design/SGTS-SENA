from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

import config
from database import get_db
from routers import auditoria, auth, catalogos, dashboard, empleados, tickets

app = FastAPI(title="SGTS API", version="1.0.0",
              description="Sistema de Gestión de Tickets de Soporte y Mantenimiento — SENA")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth.router, tickets.router, empleados.router, catalogos.router,
          dashboard.router, auditoria.router):
    app.include_router(r)


@app.get("/", tags=["Sistema"])
def root():
    return {
        "message": "SGTS API funcionando",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["Sistema"])
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "conectada"}
