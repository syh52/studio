Write-Host "🔧 Firebase Storage 快速修复脚本" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# 检查Firebase CLI是否已安装
try {
    firebase --version | Out-Null
    Write-Host "✅ Firebase CLI 已安装" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI 未安装，正在安装..." -ForegroundColor Red
    npm install -g firebase-tools
}

Write-Host "📋 检查项目配置..." -ForegroundColor Yellow

# 检查firebase.json是否包含storage配置
if (Select-String -Path "firebase.json" -Pattern '"storage"' -Quiet) {
    Write-Host "✅ firebase.json 包含 storage 配置" -ForegroundColor Green
} else {
    Write-Host "❌ firebase.json 缺少 storage 配置" -ForegroundColor Red
    exit 1
}

# 检查storage.rules文件是否存在
if (Test-Path "storage.rules") {
    Write-Host "✅ storage.rules 文件存在" -ForegroundColor Green
} else {
    Write-Host "❌ storage.rules 文件不存在" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 开始部署 Firebase Storage 配置..." -ForegroundColor Yellow

# 登录Firebase（如果需要）
Write-Host "🔐 检查 Firebase 登录状态..." -ForegroundColor Yellow
firebase login --no-localhost

# 选择项目
Write-Host "📂 选择 Firebase 项目..." -ForegroundColor Yellow
firebase use lexa-e87a6

# 部署Storage规则
Write-Host "📤 部署 Storage 规则..." -ForegroundColor Yellow
$deployResult = firebase deploy --only storage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Storage 配置部署成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 接下来的步骤：" -ForegroundColor Cyan
    Write-Host "1. 访问 Firebase 控制台确认 Storage 已启用" -ForegroundColor White
    Write-Host "2. 在应用中测试音频上传功能" -ForegroundColor White
    Write-Host "3. 查看音频管理页面是否正常显示" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 如果仍有问题，请查看: docs/firebase-storage-setup.md" -ForegroundColor Magenta
} else {
    Write-Host "❌ Storage 配置部署失败" -ForegroundColor Red
    Write-Host "请检查网络连接和 Firebase 项目权限" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎵 修复完成！现在可以测试音频管理功能了。" -ForegroundColor Green 