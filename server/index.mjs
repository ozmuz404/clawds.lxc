// Clawds server: HTTP + WebSocket. Слушает только 127.0.0.1.
import http from 'node:http'
import { WebSocketServer } from 'ws'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { join, extname, normalize, sep } from 'node:path'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { tr } from './lib/locale.mjs'
import { init, snapshot, launcherInfo, connInfo, toolsInfo, isOpen, GLOBAL_COMMANDS, onEvent, commands, agentCall, tickSchedules, ROOT, UPLOADS, PORT, INTERNAL_KEY } from './core.mjs'

// Порт с ботами в режиме bypassPermissions = выполнение кода, поэтому только 127.0.0.1
// и только страницы с этих адресов (иначе любой сайт мог бы управлять ботами).
const ALLOWED = new Set(['5173', String(PORT)].flatMap((p) => [`http://localhost:${p}`, `http://127.0.0.1:${p}`]))
// Для сервера в LXC/VM: CLAWDS_HOST=0.0.0.0 открывает порт по сети, но только вместе с CLAWDS_AUTH=логин:пароль.
// Страница принимается и со своего адреса (Origin совпадает с Host), потому что без пароля всё равно никто не войдёт.
const HOST = process.env.CLAWDS_HOST || '127.0.0.1'
const AUTH = process.env.CLAWDS_AUTH || ''
for (const o of (process.env.CLAWDS_ORIGINS || '').split(',').map((x) => x.trim()).filter(Boolean)) ALLOWED.add(o)
if (HOST !== '127.0.0.1' && HOST !== 'localhost' && !AUTH.includes(':')) { console.error('CLAWDS_HOST открыт в сеть: задайте CLAWDS_AUTH=логин:пароль'); process.exit(1) }
const authOk = (req) => {
  if (!AUTH) return true
  const m = /^Basic (.+)$/.exec(req.headers.authorization ?? '')
  if (!m) return false
  const got = Buffer.from(m[1], 'base64').toString('utf8')
  const a = Buffer.from(got), b = Buffer.from(AUTH)
  return a.length === b.length && timingSafeEqual(a, b)
}
const originOk = (req) => {
  const o = req.headers.origin
  if (!o) return true
  return ALLOWED.has(o) || (!!AUTH && (o === 'http://' + req.headers.host || o === 'https://' + req.headers.host))
}
const DIST = join(ROOT, 'app', 'dist')
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.json': 'application/json', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf' }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
  // /agent: los bots se identifican con el secreto interno del arranque (más el token de ejecución); el resto exige la contraseña web
  const ik = Buffer.from(String(req.headers['x-clawds-internal'] ?? '')), ok = Buffer.from(INTERNAL_KEY)
  const agentOk = url.pathname === '/agent' && req.method === 'POST' && ik.length === ok.length && timingSafeEqual(ik, ok)
  if (!agentOk && !authOk(req)) return res.writeHead(401, { 'www-authenticate': 'Basic realm="Clawds", charset="UTF-8"' }).end('Auth required')
  const origin = req.headers.origin
  if (origin && originOk(req)) res.setHeader('Access-Control-Allow-Origin', origin)

  // Агенты (скрипт clawds.mjs) ходят сюда с токеном запуска
  if (url.pathname === '/agent' && req.method === 'POST') {
    let body = ''
    req.on('data', (c) => { body += c; if (body.length > 1e6) req.destroy() })
    req.on('end', () => {
      try {
        const { token, action, args, files } = JSON.parse(body)
        const out = agentCall(token, action, Array.isArray(args) ? args.map(String) : [], Array.isArray(files) ? files.map(String) : [])
        res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ ok: true, out: String(out ?? '') }))
      } catch (e) {
        res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ ok: false, error: e.message }))
      }
    })
    return
  }

  if (url.pathname.startsWith('/files/')) {
    const p = normalize(join(UPLOADS, decodeURIComponent(url.pathname.slice(7))))
    if (!p.startsWith(UPLOADS + sep) || !existsSync(p)) return res.writeHead(404).end()
    res.writeHead(200, { 'content-type': MIME[extname(p).toLowerCase()] ?? 'application/octet-stream', 'x-content-type-options': 'nosniff' })
    return createReadStream(p).pipe(res)
  }

  // Собранный интерфейс (npm run build в app), чтобы работал один порт
  if (existsSync(DIST)) {
    let p = normalize(join(DIST, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname)))
    if (!p.startsWith(DIST) || !existsSync(p) || statSync(p).isDirectory()) p = join(DIST, 'index.html')
    res.writeHead(200, { 'content-type': MIME[extname(p).toLowerCase()] ?? 'application/octet-stream' })
    return createReadStream(p).pipe(res)
  }
  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }).end('Clawds server работает. Интерфейс: npm run dev в папке app.')
})

const wss = new WebSocketServer({ server, maxPayload: 40 * 1024 * 1024, verifyClient: ({ req }) => authOk(req) && !!req.headers.origin && originOk(req) })

wss.on('connection', (ws) => {
  const clientId = randomBytes(4).toString('hex')
  const send = (o) => ws.readyState === 1 && ws.send(JSON.stringify(o))
  const off = onEvent((ev, except) => { if (except !== clientId) send(ev) })
  send(launcherInfo())
  send(connInfo())
  send(toolsInfo())
  send(isOpen() ? { t: 'snapshot', state: snapshot() } : { t: 'closed' })
  ws.on('close', off)
  ws.on('message', async (raw) => {
    let m
    try { m = JSON.parse(raw.toString()) } catch { return }
    if (m.t !== 'cmd' || typeof m.name !== 'string') return
    const fn = commands[m.name]
    try {
      if (!fn) throw new Error(tr('Неизвестная команда {n}', { n: m.name }))
      if (!isOpen() && !GLOBAL_COMMANDS.has(m.name)) throw new Error(tr('Сначала откройте папку или сессию'))
      const data = await fn('me', { ...(m.args ?? {}), except: clientId })
      send({ t: 'res', id: m.id, ok: true, data })
    } catch (e) {
      send({ t: 'res', id: m.id, ok: false, error: e.message })
    }
  })
})

await init()
setInterval(() => tickSchedules(), 20_000)
server.listen(PORT, HOST, () => console.log(`Clawds server: http://${HOST}:${PORT}${AUTH ? ' (con contraseña)' : ''}`))
