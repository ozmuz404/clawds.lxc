@echo off
rem Crea en el Escritorio un acceso "Clawds" con su icono que abre Clawds en una ventana propia (como una app).
rem Uso: crear-acceso-escritorio.cmd [URL]     Ejemplo: crear-acceso-escritorio.cmd http://192.168.1.50:8787
rem Si no das URL, la pregunta (Enter = http://localhost:8787). clawds.ico debe estar junto a este archivo.
set "URL=%~1"
if not defined URL set /p "URL=URL de Clawds [http://localhost:8787]: "
if not defined URL set "URL=http://localhost:8787"
set "BROWSER="
for %%P in ("%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "%LocalAppData%\Google\Chrome\Application\chrome.exe") do (
  if not defined BROWSER if exist %%P set "BROWSER=%%~P"
)
if not defined BROWSER (
  echo No encontre Edge ni Chrome. Abre %URL% en tu navegador.
  pause
  exit /b 1
)
set "ICODIR=%LocalAppData%\Clawds"
if not exist "%ICODIR%" mkdir "%ICODIR%"
set "ICON=%BROWSER%,0"
if exist "%~dp0clawds.ico" (
  copy /y "%~dp0clawds.ico" "%ICODIR%\clawds.ico" >nul
  set "ICON=%ICODIR%\clawds.ico"
) else (
  echo Aviso: no encontre clawds.ico junto a este archivo, se usa el icono del navegador.
)
powershell -NoProfile -ExecutionPolicy Bypass -Command "$d=[Environment]::GetFolderPath('Desktop'); $s=(New-Object -ComObject WScript.Shell).CreateShortcut($d+'\Clawds.lnk'); $s.TargetPath=$env:BROWSER; $s.Arguments='--app='+$env:URL; $s.IconLocation=$env:ICON; $s.Description='Clawds'; $s.Save(); Write-Host ('Acceso creado en: '+$d+'\Clawds.lnk')"
ie4uinit.exe -show >nul 2>&1
echo.
echo Listo. Usa el icono "Clawds" del Escritorio (si ves el icono viejo, cierra y abre el Explorador o reinicia sesion).
pause
