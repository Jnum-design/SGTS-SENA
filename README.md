# Sistema de Gestion de Tickets de Soporte (SGTS)  SENA

Proyecto desarrollado para el SENA Regional Putumayo  ADSO.

##  Estructura del Repositorio
- `/frontend`: Aplicacion cliente en Vue.js + Vite.
- `/backend`: API REST para la logica del sistema.
- `/database`: Scripts SQL de MySQL Workbench y modelos de base de datos.
- `/docs`: Documentacion, mockups y matriz de pruebas.

## Configurar la base de datos e iniciar el sistema

La aplicación usa PostgreSQL. Neon permite conectarse desde Internet, pero la conexión requiere credenciales. La URL de la base se guarda solo en el backend: no la pongas en el frontend ni la publiques.

1. Crea una base de datos en Neon y copia su URL de conexión con SSL.
2. En Neon Console → SQL Editor, ejecuta una sola vez `database/sgts_db_postgresql.sql`. Para cargar datos de prueba, ejecuta después `database/sgts_datos_demo.sql`.
3. Instala Python 3.12 y Node.js. En PowerShell, prepara las dependencias y el archivo local de configuración:

```powershell
py -3.12 -m venv --clear backend\venv
backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env
npm --prefix frontend install
```

Edita `backend/.env` y reemplaza `DATABASE_URL` por la URL de Neon. Genera también un valor largo y aleatorio para `SECRET_KEY`. No subas ese archivo a GitHub. Después inicia ambos servidores desde la raíz:

```powershell
npm run dev
```

`npm run dev` inicia la API local y el frontend en la red local. En el equipo servidor abre `http://localhost:5173`; los demás dispositivos deben conectarse al mismo Wi-Fi y abrir `http://IP-DEL-EQUIPO:5173` (la terminal de Vite muestra las direcciones de red). Si Windows Firewall pregunta, permite Node.js en redes privadas. El frontend reenvía las llamadas `/api` al backend local, así los dispositivos no necesitan conectarse directamente a PostgreSQL ni a otro puerto.

Al cambiar código del backend, detén y vuelve a ejecutar `npm run dev` para reiniciar la API.

Con el esquema y los datos de demostración cargados, puedes iniciar sesión con:

- Administrador: `admin@sgts.local` / `Cambiar2026*`
- Usuario: `usuario@sgts.local` / `Demo2026*`

Son credenciales públicas de demostración; cámbialas y no las uses para datos reales.

La base de Neon acepta conexiones de Internet con credenciales válidas. No compartas su URL ni la uses desde el navegador. Para que otras personas accedan a la aplicación por Internet también se debe desplegar la API y el frontend; `npm run dev` los ejecuta localmente. Para compilar el frontend, ejecuta `npm run build`.

## Publicar para acceder desde cualquier red

El archivo `render.yaml` deja listo un servicio único en Render para servir el frontend y la API bajo el mismo dominio:

1. Sube los cambios del proyecto a un repositorio GitHub y crea una cuenta en Render.
2. En Render, elige **New → Blueprint**, conecta el repositorio y selecciona la rama.
3. Cuando Render lo solicite, añade `DATABASE_URL` con la cadena de conexión de Neon. Mantén la contraseña solo en Render y rota la contraseña que se haya compartido previamente.
4. Despliega el Blueprint. Render publicará una URL HTTPS; compártela con los otros usuarios. El plan gratuito puede suspenderse cuando no se usa y tardar un poco en volver a despertar.

El frontend y la API se publican juntos; los navegadores nunca reciben la credencial de Neon. Para que los cambios se publiquen, primero deben estar en la rama de GitHub conectada a Render.

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