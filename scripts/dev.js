import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createConnection } from 'node:net'
import { resolve, join } from 'node:path'

const root = process.cwd()
const backend = join(root, 'backend')
const frontend = join(root, 'frontend')
const python = process.platform === 'win32'
  ? join(backend, 'venv', 'Scripts', 'python.exe')
  : join(backend, 'venv', 'bin', 'python')
const vite = join(frontend, 'node_modules', 'vite', 'bin', 'vite.js')

const required = [
  ['backend/.env', join(backend, '.env'), 'Copia backend/.env.example a backend/.env y configura DATABASE_URL con tu URL de Neon.'],
  ['frontend/node_modules', vite, 'Instala las dependencias con npm --prefix frontend install.'],
]

const missing = required.find(([, path]) => !existsSync(path))
if (missing) {
  console.error(`Falta ${missing[0]}. ${missing[2]}`)
  process.exit(1)
}

if (!existsSync(python)) {
  console.error('No existe el entorno virtual del backend. Crea backend/venv e instala backend/requirements.txt.')
  process.exit(1)
}

const pythonCheck = spawnSync(python, ['--version'], { cwd: backend, encoding: 'utf8' })
if (pythonCheck.error || pythonCheck.status !== 0) {
  console.error('El entorno backend/venv no funciona. Instala Python 3.12 y recréalo con: py -3.12 -m venv --clear backend\\venv')
  process.exit(1)
}

const children = []
let stopping = false

function stop(signal = 'SIGTERM') {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (!child.killed) child.kill(signal)
  }
}

function start(command, args, cwd) {
  const child = spawn(command, args, { cwd, stdio: 'inherit' })
  children.push(child)
  child.on('error', (error) => {
    console.error(`No se pudo iniciar ${command}: ${error.message}`)
    process.exitCode = 1
    stop()
  })
  child.on('exit', (code) => {
    if (!stopping) {
      process.exitCode = code || 1
      stop()
    }
  })
}

function portIsOpen(port) {
  return new Promise((resolvePort) => {
    const socket = createConnection({ host: '127.0.0.1', port })
    socket.setTimeout(1000)
    socket.once('connect', () => {
      socket.destroy()
      resolvePort(true)
    })
    socket.once('timeout', () => {
      socket.destroy()
      resolvePort(false)
    })
    socket.once('error', () => resolvePort(false))
  })
}

async function responds(url, validate) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2000) })
    return response.ok && await validate(response)
  } catch {
    return false
  }
}

async function run() {
  const apiReady = await responds('http://127.0.0.1:8000/health', async (response) => {
    const health = await response.json()
    return health.status === 'ok' && health.database === 'conectada'
  })
  const frontendReady = await responds('http://127.0.0.1:5173/', async (response) => {
    const html = await response.text()
    return html.includes('/@vite/client')
  })

  for (const [port, ready, name] of [
    [8000, apiReady, 'API'],
    [5173, frontendReady, 'frontend'],
  ]) {
    if (!ready && await portIsOpen(port)) {
      console.error(`El puerto ${port} está ocupado por otro proceso y no responde como SGTS ${name}.`)
      console.error(`Detén ese proceso o libera el puerto ${port} y vuelve a ejecutar npm run dev.`)
      process.exit(1)
    }
  }

  if (apiReady && frontendReady) {
    console.log('SGTS ya está en ejecución: http://localhost:5173')
    return
  }

  process.on('SIGINT', () => stop('SIGINT'))
  process.on('SIGTERM', () => stop('SIGTERM'))

  if (apiReady) console.log('La API de SGTS ya está activa en http://127.0.0.1:8000')
  else start(python, ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'], backend)

  if (frontendReady) console.log('El frontend de SGTS ya está activo en http://localhost:5173')
  else start(process.execPath, [resolve(vite), '--host', '0.0.0.0', '--port', '5173'], frontend)
}

run().catch((error) => {
  console.error(`No se pudo comprobar los servicios de SGTS: ${error.message}`)
  process.exit(1)
})
