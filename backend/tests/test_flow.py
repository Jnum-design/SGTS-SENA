"""Prueba de flujo completo. Requiere la BD con los datos demo cargados."""
from uuid import uuid4

from fastapi.testclient import TestClient

from main import app

c = TestClient(app)


def login(correo, clave):
    r = c.post("/auth/login", json={"correo": correo, "contrasena": clave})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_health():
    assert c.get("/health").json()["status"] == "ok"


def test_login_invalido():
    r = c.post("/auth/login", json={"correo": "usuario@sgts.local", "contrasena": "mala"})
    assert r.status_code == 401


def test_login_roles_demo():
    cuentas = (
        ("admin@sgts.local", "Cambiar2026*", "administrador"),
        ("usuario@sgts.local", "Demo2026*", "usuario"),
        ("tecnico@sgts.local", "Demo2026*", "tecnico"),
    )
    for correo, contrasena, rol in cuentas:
        respuesta = c.post("/auth/login", json={"correo": correo, "contrasena": contrasena})
        assert respuesta.status_code == 200, f"{correo}: {respuesta.text}"
        assert respuesta.json()["usuario"]["rol"] == rol
        assert respuesta.json()["access_token"]


def test_sin_token():
    assert c.get("/tickets").status_code == 401


def test_flujo_completo():
    usr = login("usuario@sgts.local", "Demo2026*")
    adm = login("admin@sgts.local", "Cambiar2026*")
    tec = login("tecnico@sgts.local", "Demo2026*")

    # el usuario crea un ticket y se le asigna el SLA según la prioridad
    r = c.post("/tickets", headers=usr, json={
        "asunto": "Pantalla parpadea", "descripcion": "La pantalla del aula parpadea constantemente.",
        "prioridad": "Crítica", "id_categoria": 1, "equipos": [3]})
    assert r.status_code == 201, r.text
    t = r.json()
    assert t["codigo"].startswith("TK-") and t["sla"]["nombre"] == "SLA Crítico"
    tid = t["id_ticket"]

    # permisos por rol
    assert c.patch(f"/tickets/{tid}/asignar", headers=usr, json={"id_empleado_tecnico": 3}).status_code == 403
    assert c.get("/empleados", headers=usr).status_code == 403
    assert c.get("/auditoria", headers=tec).status_code == 403
    assert c.get(f"/tickets/{tid}", headers=tec).status_code == 403   # aún no es suyo

    # admin asigna (solo a técnicos); asignar a un usuario normal falla
    assert c.patch(f"/tickets/{tid}/asignar", headers=adm, json={"id_empleado_tecnico": 2}).status_code == 400
    tecnicos = c.get("/tecnicos", headers=adm).json()
    id_tec = next(x["id_empleado"] for x in tecnicos if "Patrick" in x["nombre_completo"])
    assert c.patch(f"/tickets/{tid}/asignar", headers=adm, json={"id_empleado_tecnico": id_tec}).status_code == 200

    # el técnico avanza el estado y comenta; no puede saltar a Cerrado
    assert c.patch(f"/tickets/{tid}/estado", headers=tec, json={"estado": "Cerrado"}).status_code == 403
    assert c.patch(f"/tickets/{tid}/estado", headers=tec, json={"estado": "En proceso"}).status_code == 200
    r = c.post(f"/tickets/{tid}/seguimientos", headers=tec, json={"comentario": "Cambio de cable HDMI"})
    assert r.json()["fecha_primera_respuesta"] is not None
    assert c.patch(f"/tickets/{tid}/estado", headers=tec, json={"estado": "Resuelto"}).status_code == 200

    # calificación: solo el solicitante, una vez, entre 1 y 5
    assert c.post(f"/tickets/{tid}/calificar", headers=tec, json={"calificacion": 5}).status_code == 403
    assert c.post(f"/tickets/{tid}/calificar", headers=usr, json={"calificacion": 9}).status_code == 422
    assert c.post(f"/tickets/{tid}/calificar", headers=usr, json={"calificacion": 5}).status_code == 200
    assert c.post(f"/tickets/{tid}/calificar", headers=usr, json={"calificacion": 4}).status_code == 400

    # auditoría registró todo
    aud = c.get("/auditoria", headers=adm, params={"id_ticket": tid}).json()
    assert aud["total"] >= 5

    # dashboard y listados por rol
    d = c.get("/dashboard/resumen", headers=adm).json()
    assert d["total"] >= 3 and d["sla_cumplimiento"] is not None
    assert all(x["solicitante"] for x in c.get("/tickets", headers=usr).json()["items"])


def test_recuperacion_contrasena():
    r = c.post("/auth/recuperar", json={"correo": "tecnico2@sgts.local"})
    codigo = r.json()["codigo_dev"]
    assert c.post("/auth/validar-codigo", json={"correo": "tecnico2@sgts.local", "codigo": "000000"}).status_code == 400
    tok = c.post("/auth/validar-codigo", json={"correo": "tecnico2@sgts.local", "codigo": codigo}).json()["reset_token"]
    assert c.post("/auth/nueva-contrasena", json={"reset_token": tok, "nueva_contrasena": "debil"}).status_code == 400
    assert c.post("/auth/nueva-contrasena", json={"reset_token": tok, "nueva_contrasena": "Demo2026*"}).status_code == 200
    assert c.post("/auth/nueva-contrasena", json={"reset_token": tok, "nueva_contrasena": "Demo2026*"}).status_code == 400
    # correo inexistente responde igual (sin revelar)
    assert c.post("/auth/recuperar", json={"correo": "nadie@sgts.local"}).status_code == 200


def test_crud_empleados():
    adm = login("admin@sgts.local", "Cambiar2026*")
    body = {"nombre": "Ana", "apellido": "Prueba", "correo": f"ana.prueba.{uuid4().hex}@sgts.local", "rol": "tecnico",
            "id_departamento": 1, "contrasena": "Segura2026"}
    assert c.post("/empleados", headers=adm, json=body).status_code == 400   # técnico sin especialidad
    body["especialidad"] = "Software"
    r = c.post("/empleados", headers=adm, json=body)
    assert r.status_code == 201, r.text
    eid = r.json()["id_empleado"]
    assert c.post("/empleados", headers=adm, json=body).status_code == 409   # correo duplicado
    body.update(rol="usuario", contrasena=None)
    assert c.put(f"/empleados/{eid}", headers=adm, json=body).json()["especialidad"] is None
    assert c.delete(f"/empleados/{eid}", headers=adm).status_code == 200
    assert c.get(f"/empleados/{eid}", headers=adm).json()["estado"] is False
