@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set "NODE=C:\Users\kenth\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "VINEXT=%CD%\node_modules\vinext\dist\cli.js"

if not exist "%NODE%" goto no_node
if not exist "%VINEXT%" goto no_game

echo 正在啟動 Phaser 遊戲...
echo 請在瀏覽器開啟下方顯示的 Local URL。
echo.
"%NODE%" "%VINEXT%" dev
goto end

:no_node
echo 錯誤：找不到 Codex 提供的 Node.js runtime。
goto failed

:no_game
echo 錯誤：尚未安裝專案 dependencies。
echo 請要求 Codex 還原專案 dependencies。
goto failed

:failed
echo.
pause

:end
endlocal
