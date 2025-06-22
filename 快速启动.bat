@echo off
chcp 65001 >nul
title Lexicon 快速启动 - 性能优化版

echo.
echo ===========================================
echo           Lexicon 快速启动
echo            性能优化版                      
echo ===========================================
echo.

echo 检查环境...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo Node.js 已安装
echo.

echo 进入项目目录...
cd /d "%~dp0studio"
if %errorlevel% neq 0 (
    echo 无法进入 studio 目录
    pause
    exit /b 1
)

echo 检查依赖...
if not exist "node_modules" (
    echo 首次运行，正在安装依赖...
    echo 提示：这可能需要几分钟时间
    npm install --production
    if %errorlevel% neq 0 (
        echo 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo 依赖已存在
)

echo.
echo 启动应用...
echo 性能优化提示：
echo    - 应用正在优化加载，首次启动稍慢是正常的
echo    - 后续访问会更快（缓存生效）
echo    - 如果加载慢，请等待AI服务初始化完成
echo.
echo 应用将在浏览器中自动打开: http://localhost:9002
echo 移动端访问体验更佳
echo.
echo 按 Ctrl+C 停止服务
echo.

:: 设置环境变量优化性能
set NODE_ENV=development
set NEXT_TELEMETRY_DISABLED=1

:: 启动开发服务器
npm run dev

echo.
echo 服务已停止
pause 