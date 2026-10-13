[English](README.md) · **Español** · [Русский](README.ru.md)

# Clawds (fork) — administrador de agentes autoalojado

Fork de la comunidad de [ClawdsAgent/Clawds](https://github.com/ClawdsAgent/Clawds) (licencia MIT). Clawds es un mensajero local donde chateas con agentes de Claude Code: cada bot tiene su rol, memoria y rama de git. Este fork lo orienta a **correr en un servidor propio** (Proxmox/LXC, Linux) para que los bots sigan trabajando con tu PC apagada, y a usar **modelos de otros proveedores** (DeepSeek, LM Studio u otro endpoint compatible con Anthropic).

> Proyecto independiente. No está afiliado ni respaldado por xAI, Anthropic ni los autores originales. El diseño está *inspirado* en el estilo de otros administradores de agentes; no usa sus marcas ni su arte.

![Chat](docs/img/fork-chat.png)

## Qué agrega respecto al original
- **Servidor Linux / LXC:** escucha en `0.0.0.0` solo con usuario y contraseña (`CLAWDS_AUTH`), corre como usuario sin privilegios, servicio systemd e instalador (`deploy/install-lxc.sh`, guía en `deploy/PROXMOX.md`).
- **Español:** interfaz y respuestas de los bots. (Los textos del menú que aún no están traducidos se muestran en inglés.)
- **Proveedores propios:** preajuste de DeepSeek (endpoint Anthropic-compatible), LM Studio/OpenRouter/LiteLLM vía *Conexiones*.
- **Plantillas y clonado de bots:** guarda un bot como plantilla (rol, prompt, modelo, skills, MCP), crea bots desde una plantilla y clona bots. Incluye plantillas de QA en español (general, cliente, transportista, logística, operario, soporte).
- **Modelo de respaldo por bot:** si el principal falla (429, 5xx, timeout, sin conexión) se reintenta una vez con otro modelo.
- **Pantalla de Estado:** sondeo de endpoints, sesión de Claude, herramientas conectadas y último error por bot.
- **Catálogo de apps (MCP)** de un clic, incluido Playwright sin pantalla para que los bots usen navegador en el servidor.
- **Rediseño** oscuro con mascotas de color por bot, barra lateral, encabezado flotante y campo de mensaje en pastilla (`app/src/grokbot-theme.css`, `grokbot.css`).
- Correcciones: adjuntos accesibles desde otra máquina, llave interna para que los bots usen sus herramientas con la contraseña web activa.

Historial detallado en [CAMBIOS.md](CAMBIOS.md).

| Bot y panel | Conectar apps |
|---|---|
| ![Bot](docs/img/fork-bot.png) | ![Apps](docs/img/fork-apps.png) |

## Instalar

### En un contenedor Proxmox/Debian (recomendado)
Sigue [`deploy/PROXMOX.md`](deploy/PROXMOX.md). En resumen, dentro del contenedor y como root:
```bash
git clone https://github.com/ozmuz404/clawds.lxc clawds && cd clawds && bash deploy/install-lxc.sh
```
Al terminar imprime la URL, el usuario `admin` y una contraseña generada. Luego entra, ve a **Conexiones** y pega **tu propia** API key del proveedor que uses. Ninguna clave viene incluida en el repositorio.

### En Windows (modo local)
Requisitos: Node.js 20+ y Claude Code instalado (el instalador de Linux usa Node 22). Ejecuta `start.cmd`.

### Desarrollo
```bash
cd server && npm install && cd ../app && npm install && npm run dev
```

## Seguridad
- Los bots **ejecutan comandos** en la máquina donde corre el servidor. Úsalo en una red de confianza o detrás de VPN; para internet pon un proxy con HTTPS.
- Las claves de proveedores y datos de sesión se guardan en `server-data/` (excluido por `.gitignore`). No subas esa carpeta ni `/etc/clawds.env`.
- Revisa [SECURITY.md](SECURITY.md).

## Estado y límites conocidos
- El flujo LXC y Playwright sin pantalla se probaron en un contenedor Debian 12; otros entornos pueden requerir ajustes.
- El modelo de respaldo se probó con un Claude simulado, no con un proveedor real caído.
- Traducción al español incompleta en menús secundarios.

## Créditos y licencia
Basado en Clawds © 2026 Clawd, licencia MIT (ver [LICENSE](LICENSE)). Las modificaciones de este fork se publican bajo la misma licencia. Fuente Geist (SIL OFL) e iconos Lucide (ISC).
