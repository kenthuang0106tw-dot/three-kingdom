@echo off
setlocal
cd /d "%~dp0"
set "NODE=C:\Users\kenth\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "VINEXT=%CD%\node_modules\vinext\dist\cli.js"

if not exist "%NODE%" goto no_node
if not exist "%VINEXT%" goto no_game

echo Starting Phaser game...
echo Open the Local URL shown below in your browser.
echo.
"%NODE%" "%VINEXT%" dev
goto end

:no_node
echo ERROR: Bundled Node.js runtime was not found.
goto failed

:no_game
echo ERROR: Project dependencies were not found.
echo Ask Codex to restore the project dependencies.
goto failed

:failed
echo.
pause

:end
endlocal
