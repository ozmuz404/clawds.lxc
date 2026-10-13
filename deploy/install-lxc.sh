#!/usr/bin/env bash
# Instala Clawds en un contenedor LXC Debian 12 / Ubuntu 22.04+ (ejecutar como root dentro del contenedor).
# Uso: bash deploy/install-lxc.sh        (desde la carpeta del proyecto ya descomprimida o clonada)
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "Ejecuta como root"; exit 1; }
SRC="$(cd "$(dirname "$0")/.." && pwd)"
APP=/opt/clawds
USER_NAME=clawds

echo "==> Paquetes base"
apt-get update -y
apt-get install -y curl git ca-certificates unzip openssl python3 build-essential
apt-get install -y chromium || echo 'AVISO: no se pudo instalar chromium (en Ubuntu viene como snap); instala un Chromium/Chrome y ajusta la ruta en server-data/mcp.json'

if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  echo "==> Node.js 22"
  if curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 22 ]; then
    :
  else
    echo "NodeSource no sirvio para esta version de Debian; usando el binario oficial de nodejs.org"
    case "$(uname -m)" in x86_64) ARCH=x64;; aarch64) ARCH=arm64;; *) echo "arquitectura no soportada"; exit 1;; esac
    VER="$(curl -fsSL https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt | grep -o "node-v22[0-9.]*-linux-$ARCH.tar.xz" | head -1)"
    curl -fsSL "https://nodejs.org/dist/latest-v22.x/$VER" -o /tmp/node.tar.xz
    tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1
    rm -f /tmp/node.tar.xz
  fi
fi

if ! command -v claude >/dev/null; then
  echo "==> Claude Code"
  npm install -g @anthropic-ai/claude-code
fi

id "$USER_NAME" >/dev/null 2>&1 || useradd -m -s /bin/bash "$USER_NAME"   # Claude Code no corre en modo sin permisos como root

echo "==> Copiando Clawds a $APP"
mkdir -p "$APP"
cp -a "$SRC/." "$APP/"
rm -rf "$APP/server/node_modules" "$APP/app/node_modules"
chown -R "$USER_NAME:$USER_NAME" "$APP"

echo "==> Dependencias y compilación de la interfaz"
su - "$USER_NAME" -c "cd $APP/server && npm install --omit=dev"
su - "$USER_NAME" -c "cd $APP/app && npm install && npm run build"

# Navegador para los bots: Playwright en modo sin pantalla con el Chromium del sistema, activado para todos los bots
CHROME_BIN="$(command -v chromium || command -v chromium-browser || true)"
MCPF="$APP/server-data/mcp.json"
if [ -n "$CHROME_BIN" ] && [ ! -f "$MCPF" ]; then
  mkdir -p "$APP/server-data"
  cat > "$MCPF" <<JSON
{ "servers": [ { "id": "playwright", "name": "playwright", "type": "stdio", "command": "npx",
  "args": ["-y", "@playwright/mcp@latest", "--headless", "--no-sandbox", "--executable-path", "$CHROME_BIN"],
  "env": {}, "headers": {}, "source": "manual", "allBots": true } ] }
JSON
  chown -R "$USER_NAME:$USER_NAME" "$APP/server-data"
fi

mkdir -p /home/$USER_NAME/agentes
chown "$USER_NAME:$USER_NAME" /home/$USER_NAME/agentes

ENVF=/etc/clawds.env
if [ ! -f "$ENVF" ]; then
  PASS="$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-20)"
  cat > "$ENVF" <<ENV
CLAWDS_HOST=0.0.0.0
CLAWDS_PORT=8787
CLAWDS_AUTH=admin:$PASS
ENV
  chmod 600 "$ENVF"
  echo "$PASS" > /root/clawds-password.txt; chmod 600 /root/clawds-password.txt
fi

cat > /etc/systemd/system/clawds.service <<UNIT
[Unit]
Description=Clawds (agentes)
After=network-online.target
Wants=network-online.target

[Service]
User=$USER_NAME
WorkingDirectory=$APP/server
EnvironmentFile=$ENVF
Environment=HOME=/home/$USER_NAME
ExecStart=$(command -v node) index.mjs
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now clawds

IP="$(hostname -I | awk '{print $1}')"
echo
echo "Listo. Abre http://$IP:8787"
echo "Usuario: admin   Contraseña: $(cut -d: -f2- <<<"$(grep CLAWDS_AUTH $ENVF | cut -d= -f2-)")"
echo "(guardada también en /root/clawds-password.txt)"
echo "Carpeta de trabajo para los bots: /home/$USER_NAME/agentes"
echo "Logs: journalctl -u clawds -f"
