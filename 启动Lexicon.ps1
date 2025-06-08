# Lexicon 航空安全英语学习应用启动脚本
# PowerShell 版本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "      启动 Lexicon 学习应用" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""
Write-Host "🚀 正在启动开发服务器..." -ForegroundColor Yellow
Write-Host "📍 当前目录: $PWD" -ForegroundColor Gray
Write-Host ""

# 检查端口是否被占用
$port = 9002
try {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "⚠️  端口 $port 已被占用，正在尝试打开现有服务..." -ForegroundColor Yellow
        Start-Process "http://localhost:$port"
        Read-Host "按回车键退出"
        exit 0
    }
} catch {
    # 端口未被占用，继续启动
}

Write-Host "🌐 服务器地址: http://localhost:$port" -ForegroundColor Cyan
Write-Host "⏱️  服务器启动后会自动打开浏览器" -ForegroundColor Gray
Write-Host "🛑 按 Ctrl+C 可停止服务器" -ForegroundColor Gray
Write-Host ""

# 延迟启动浏览器
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 6
    Start-Process "http://localhost:9002"
} | Out-Null

# 启动开发服务器
try {
    npm run dev
} catch {
    Write-Host "❌ 启动失败，请检查项目配置" -ForegroundColor Red
    Read-Host "按回车键退出"
} 