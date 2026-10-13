# Clawds en un contenedor LXC (Proxmox)

## 1. Crear el contenedor (en la consola del host Proxmox)
```bash
pveam update
pveam available | grep debian-12          # copia el nombre exacto de la plantilla
pveam download local debian-12-standard_XX_amd64.tar.zst   # usa el nombre que salio arriba
pct create 120 local:vztmpl/debian-12-standard_XX_amd64.tar.zst \
  --hostname clawds --cores 2 --memory 2048 --swap 512 \
  --rootfs local-lvm:16 --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --unprivileged 1 --features nesting=1 --onboot 1
pct start 120
pct exec 120 -- bash -c "apt-get update && apt-get install -y openssh-server unzip && systemctl enable --now ssh"
```
Cambia 120, `local-lvm` y la plantilla segun tu Proxmox. Para tener la IP: `pct exec 120 -- hostname -I`.
Si no quieres SSH, sube el zip desde la interfaz web: contenedor > Console, o usa `pct push 120 clawds.zip /root/clawds.zip`.

## 2. Subir e instalar
(Tambien puedes clonar el repositorio dentro del contenedor: `git clone https://github.com/ozmuz404/clawds.lxc clawds && cd clawds && bash deploy/install-lxc.sh`.)

**Si creaste el contenedor desde la interfaz web** (con contrasena de root y sin llave SSH): Debian no deja entrar como root por SSH con contrasena, asi que sube el zip al host y metelo con `pct push`:
```
scp clawds.zip root@IP_DEL_PROXMOX:/root/
ssh root@IP_DEL_PROXMOX
pct start 116
pct push 116 /root/clawds.zip /root/clawds.zip
pct exec 116 -- bash -c "apt-get update && apt-get install -y unzip && cd /root && unzip -o clawds.zip -d clawds && cd clawds && bash deploy/install-lxc.sh"
```
(cambia 116 por el ID de tu contenedor). Tambien puedes abrir la consola del contenedor en la interfaz web y correr ahi los comandos de `unzip` e instalacion.

**Con SSH directo al contenedor** (si le pusiste llave publica):
```
scp clawds.zip root@IP_DEL_CONTENEDOR:/root/
ssh root@IP_DEL_CONTENEDOR
unzip clawds.zip -d clawds && cd clawds && bash deploy/install-lxc.sh
```
Al final imprime la URL, el usuario (`admin`) y la contrasena generada.

## 3. Usarlo
- Abre `http://IP:8787`, entra con la contrasena.
- Conexiones > DeepSeek > pega tu API key.
- Carpeta de trabajo de los bots: `/home/clawds/agentes`.
- Servicio: `systemctl status clawds`, logs: `journalctl -u clawds -f`. Arranca solo al reiniciar el contenedor.

## Seguridad
- Los bots ejecutan comandos. El puerto esta protegido con usuario y contrasena (`/etc/clawds.env`), pero sin HTTPS.
  Usalo solo en tu red local o por VPN/Tailscale; para internet pon un proxy con HTTPS (Caddy, Nginx Proxy Manager).
- No lo expongas directo a internet.
- Los bots corren como usuario `clawds`, no como root.

## Notas
- El instalador deja el navegador listo: instala Chromium del sistema y registra Playwright (sin pantalla, `--no-sandbox` porque corre dentro del contenedor) para todos los bots. En Debian 12 funciona directo; en Ubuntu Chromium viene como snap y habria que ajustar la ruta en `/opt/clawds/server-data/mcp.json`.
- Probado: Playwright MCP en modo sin pantalla abre una pagina, llena un formulario de login y entra. Lo que no se ha probado es el contenedor Proxmox real.
- Para actualizar: sube el zip nuevo y vuelve a correr el instalador (conserva `/etc/clawds.env`).
