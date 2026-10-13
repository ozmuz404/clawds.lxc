@echo off
rem Claude login for Clawds bots. Data is stored in server\claude-config; your personal ~/.claude is untouched.
set CLAUDE_CONFIG_DIR=%~dp0claude-config
if exist "D:\Git\bin\bash.exe" set CLAUDE_CODE_GIT_BASH_PATH=D:\Git\bin\bash.exe
if not defined CLAUDE_CODE_GIT_BASH_PATH if exist "C:\Program Files\Git\bin\bash.exe" set CLAUDE_CODE_GIT_BASH_PATH=C:\Program Files\Git\bin\bash.exe
set ANTHROPIC_API_KEY=
set ANTHROPIC_AUTH_TOKEN=
set ANTHROPIC_BASE_URL=
if /i "%~1"=="fresh" claude auth logout
echo.
echo A browser page will open. Click Authorize and come back to this window.
echo.
claude auth login
echo.
pause
