@echo off
chcp 65001 >nul
title Lexicon 航空安全英语学习应用
echo ========================================
echo       启动 Lexicon 学习应用
echo ========================================
echo.

echo 正在启动开发服务器...
cd /d "%~dp0"

echo 当前目录: %CD%
echo.

REM 检查是否安装了 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo Node.js 版本:
node --version
echo.

echo 启动服务器中，请稍候...
echo 服务器启动后会自动打开浏览器
echo.
echo 提示：服务器地址为 http://localhost:9002
echo 按 Ctrl+C 可停止服务器
echo.

REM 延迟5秒后打开浏览器
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:9002"

REM 启动开发服务器
npm run dev

pause 