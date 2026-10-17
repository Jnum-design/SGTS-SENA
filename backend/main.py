from pathlib import Path

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException as StarletteHTTPException

import config
from database import get_db
from routers import auditoria, auth, catalogos, dashboard, empleados, tickets

FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"


class FrontendFiles(StaticFiles):
    async def get_response(self, path, scope):
        try:
            return await super().get_response(path, scope)
        except StarletteHTTPException as exc:
            if exc.status_code == 404 and not scope.get("state", {}).get("api_request"):
                return await super().get_response("index.html", scope)
            raise


app = FastAPI(title="SGTS API", version="1.0.0",
              description="Sistema de Gestión de Tickets de Soporte y Mantenimiento — SENA")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def strip_api_prefix(request, call_next):
    if request.scope["path"].startswith("/api/"):
        request.scope.setdefault("state", {})["api_request"] = True
        request.scope["path"] = request.scope["path"][4:]
        request.scope["raw_path"] = request.scope["raw_path"][4:]
        response = await call_next(request)
        if response.status_code == 404:
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        return response
    return await call_next(request)


for r in (auth.router, tickets.router, empleados.router, catalogos.router,
          dashboard.router, auditoria.router):
    app.include_router(r)


@app.get("/", tags=["Sistema"])
def root():
    index = FRONTEND_DIST / "index.html"
    if index.is_file():
        return FileResponse(index)
    return {
        "message": "SGTS API funcionando",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["Sistema"])
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "conectada"}


if FRONTEND_DIST.is_dir():
    app.mount("/", FrontendFiles(directory=FRONTEND_DIST, html=True), name="frontend")
