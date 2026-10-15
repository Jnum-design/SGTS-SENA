from fastapi import FastAPI
from database import engine, Base

# Crear las tablas en la base de datos (opcional si ya se usó el script SQL)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API SGTS SENA",
    description="Sistema de Gestión de Tickets de Soporte",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"mensaje": "API SGTS conectada a PostgreSQL funcionando correctamente"}
