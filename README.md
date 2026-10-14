# Sistema de Gestion de Tickets de Soporte (SGTS)  SENA

Proyecto desarrollado para el SENA Regional Putumayo  ADSO.

##  Estructura del Repositorio
- `/frontend`: Aplicacion cliente en Vue.js + Vite.
- `/backend`: API REST para la logica del sistema.
- `/database`: Scripts SQL de MySQL Workbench y modelos de base de datos.
- `/docs`: Documentacion, mockups y matriz de pruebas.

##  Equipo de Desarrollo
- **Johan Pantoja**  Lider Frontend
- **Rito Delgado**  Modulo de Tickets
- **Daniel Montoya**  Modulo de Inventario TI
- **Patrick Morales**  Administracion, Infraestructura y Pruebas

## Endpoints Principales de la API (Acordados)
| Metodo | Endpoint | Descripcion | Roles Permitidos |
|---|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesion | Todos |
| `GET` | `/api/tickets` | Listar tickets | Todos (segun rol) |
| `POST` | `/api/tickets` | Crear ticket | Todos |
| `PUT` | `/api/tickets/:id/cerrar` | Cerrar ticket | Solo Admin |
| `GET` | `/api/equipos` | Listar equipos de inventario | Todos |