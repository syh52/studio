# Firebase MCP 环境变量设置脚本
# 使用方法: .\setup-env.ps1

Write-Host "🔥 Firebase MCP 环境变量设置" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# 设置代理 (如果需要)
$env:http_proxy="http://127.0.0.1:7890"
$env:https_proxy="http://127.0.0.1:7890"
Write-Host "✅ 代理已设置: $env:http_proxy" -ForegroundColor Yellow

# 设置Firebase MCP环境变量
$SERVICE_ACCOUNT_PATH = "I:\firebase\studio\firebase-mcp-config\serviceAccountKey.json"
$STORAGE_BUCKET = "lexa-e87a6.firebasestorage.app"

$env:SERVICE_ACCOUNT_KEY_PATH = $SERVICE_ACCOUNT_PATH
$env:FIREBASE_STORAGE_BUCKET = $STORAGE_BUCKET

Write-Host "✅ Firebase MCP环境变量已设置:" -ForegroundColor Green
Write-Host "   SERVICE_ACCOUNT_KEY_PATH: $env:SERVICE_ACCOUNT_KEY_PATH" -ForegroundColor Cyan
Write-Host "   FIREBASE_STORAGE_BUCKET: $env:FIREBASE_STORAGE_BUCKET" -ForegroundColor Cyan

# 检查服务账户密钥文件是否存在
if (Test-Path $SERVICE_ACCOUNT_PATH) {
    Write-Host "✅ 服务账户密钥文件已找到" -ForegroundColor Green
    Write-Host "🚀 您可以运行: firebase-mcp" -ForegroundColor Magenta
} else {
    Write-Host "⚠️  服务账户密钥文件未找到!" -ForegroundColor Red
    Write-Host "   请从Firebase控制台下载 serviceAccountKey.json 到:" -ForegroundColor Yellow
    Write-Host "   $SERVICE_ACCOUNT_PATH" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 快速链接: https://console.firebase.google.com/project/lexa-e87a6/settings/serviceaccounts/adminsdk" -ForegroundColor Blue
}

Write-Host ""
Write-Host "💡 提示: 该环境变量仅在当前PowerShell会话中有效" -ForegroundColor DarkYellow
Write-Host "   要永久设置，请将环境变量添加到系统环境变量中" -ForegroundColor DarkYellow 