
## Ronda 2
- Ventana "Conectar aplicaciones" (app/src/components/Apps.tsx, catalog.ts): catálogo de servidores MCP con buscador, categorías, recomendados y Agregar/Conectado. Usa los comandos saveMcp/deleteMcp existentes.
- Selector de nuevo chat (NewChat.tsx): buscar bot, Crear bot, Crear chat grupal.
- Estrella de bot principal (bot.boss) en lista, encabezado y selector.

## Ronda 3
- start.cmd y server\login.cmd reescritos en ASCII con saltos CRLF (en Windows fallaban con "EN no se reconoce como comando").
- Preset DeepSeek en Conexiones: https://api.deepseek.com/anthropic, auth x-api-key, modelos deepseek-v4-pro y deepseek-flash. Con DeepSeek no hace falta iniciar sesion en Claude.

## Ronda 4
- server/lib/runner.mjs: en Windows busca claude.exe (PATH, ~/.local/bin, carpeta npm) o cli.js de npm; antes fallaba con "spawn claude ENOENT" si Claude Code estaba instalado via npm (solo existe claude.cmd).

## Ronda 5
- Idioma "Español" (Ajustes): los bots escriben en español (instruccion de idioma, prompts generados, skills). Los menus de la app aun se ven en ingles (cae al diccionario en ingles) hasta que se traduzcan.

## Ronda 6 (Proxmox / LXC)
- server/index.mjs: CLAWDS_HOST, CLAWDS_PORT, CLAWDS_AUTH=usuario:contrasena (HTTP Basic + WebSocket) y CLAWDS_ORIGINS. Si el host no es local y no hay contrasena, el servidor no arranca.
- server/lib/runner.mjs: detener bots en Linux (kill de grupo) ademas de taskkill en Windows.
- Login de Claude por navegador no existe en Linux (mensaje con el comando); con DeepSeek no hace falta.
- app/src/live.ts: usa wss:// si la pagina es https.
- deploy/install-lxc.sh y deploy/PROXMOX.md: instalador y guia.

## Ronda 7 (navegador)
- Playwright MCP probado en modo headless (navegar, llenar formulario, login, captura). Catalogo: Playwright usa --headless.
- Agregar una app desde "Apps" ahora la activa para todos los bots.
- install-lxc.sh instala chromium y registra Playwright (headless, --no-sandbox, ruta del sistema) en server-data/mcp.json.

## Ronda 8
- install-lxc.sh: si NodeSource no soporta la version de Debian (p. ej. Debian 13), instala Node 22 desde nodejs.org.
- PROXMOX.md: ruta con pct push (root no entra por SSH con contrasena).

## Ronda 9
- Miniaturas y descargas de archivos del chat: el servidor guarda http://127.0.0.1:PUERTO/files/..., que no abre desde otro equipo (ERR_CONNECTION_REFUSED). El cliente ahora usa la ruta relativa /files/... (ui.tsx: fileUrl).

## Ronda 10 — Plantillas y clonado de bots
- Nuevo `server/lib/templates.mjs`: plantillas integradas (QA general, Cliente, Transportista, Logística, Operario, Soporte) + plantillas propias en `server-data/templates/*.json`.
- Comandos: `listTemplates`, `saveTemplate` (desde un bot o campos), `deleteTemplate`, `cloneBot`.
- UI: selector "Empezar desde una plantilla" en Nuevo bot; botones "Clonar bot" y "Guardar como plantilla" en el panel del bot.

## Ronda 11 — Rediseño estilo Grok Bot
- Nuevos `app/src/grokbot-theme.css` (tokens del prompt, tal cual) y `grokbot.css` (adaptador a las clases existentes). Geist / Geist Mono.
- Mascota SVG con color estable por bot (hash del id); bot principal blanco con estrella en el mosaico de 96px.
- Barra lateral: círculos buscar/nuevo, mosaico del principal, lista de bots, avatar + pastilla "Conectar apps" (Workspace/Cuentas/Grupo pasan al modal de apps).
- Encabezado flotante en pastilla, bolas de acción circulares, burbujas #1C1C1C / #2A2A2A, campo de mensaje 56px radio 28, interruptores 48×28, modal #262626.

## Ronda 12 — Respaldo de modelo y pantalla de Estado
- Cada bot puede tener un "modelo de respaldo" (panel del bot). Si el principal falla con 429/5xx/timeout/sin conexión, se reintenta una vez con el respaldo (sin reanudar sesión) y se avisa en el chat.
- Nuevo comando `healthCheck` y modal "Estado" (Conectar apps → Estado): sondeo de endpoints, sesión de Claude, MCP y último error por bot.
