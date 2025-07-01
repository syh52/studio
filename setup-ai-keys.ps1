# AI服务密钥配置脚本
# 用于快速配置DeepSeek等AI服务的API密钥

Write-Host "🔧 Lexicon AI服务配置向导" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 检查当前环境变量
Write-Host "📋 当前环境变量状态:" -ForegroundColor Yellow
Write-Host "NODE_ENV: $env:NODE_ENV"

# 检查现有配置文件
$envFiles = @(".env.local", ".env")
$envFileExists = $false

foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "发现配置文件: $file" -ForegroundColor Green
        $envFileExists = $true
        
        # 读取现有配置
        $content = Get-Content $file -ErrorAction SilentlyContinue
        $hasDeepSeekKey = $content | Where-Object { $_ -match "NEXT_PUBLIC_DEEPSEEK_API_KEY" }
        
        if ($hasDeepSeekKey) {
            Write-Host "✅ DeepSeek API密钥已配置" -ForegroundColor Green
        } else {
            Write-Host "❌ DeepSeek API密钥未配置" -ForegroundColor Red
        }
    }
}

if (-not $envFileExists) {
    Write-Host "❌ 未找到环境配置文件" -ForegroundColor Red
}

Write-Host ""
Write-Host "🤖 AI服务诊断建议:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# 提供诊断建议
Write-Host "1. 🔍 访问AI诊断页面进行详细检查:"
Write-Host "   http://localhost:3000/ai-test.html" -ForegroundColor Blue
Write-Host ""

Write-Host "2. 🔧 如需配置DeepSeek作为备用AI服务:"
Write-Host "   - 访问 https://platform.deepseek.com/ 获取API密钥"
Write-Host "   - 创建或编辑 .env.local 文件"
Write-Host "   - 添加: NEXT_PUBLIC_DEEPSEEK_API_KEY=你的密钥"
Write-Host ""

Write-Host "3. 🚀 重启开发服务器:"
Write-Host "   npm run dev" -ForegroundColor Blue
Write-Host ""

# 询问是否配置DeepSeek
$configureDeepSeek = Read-Host "是否现在配置DeepSeek API密钥? (y/n)"

if ($configureDeepSeek -eq "y" -or $configureDeepSeek -eq "Y") {
    Write-Host ""
    Write-Host "🔑 配置DeepSeek API密钥:" -ForegroundColor Yellow
    
    # 获取API密钥
    $apiKey = Read-Host "请输入您的DeepSeek API密钥 (sk-...)"
    
    if ($apiKey -and $apiKey.StartsWith("sk-")) {
        # 创建或更新.env.local文件
        $envLocalFile = ".env.local"
        $envContent = @()
        
        # 如果文件存在，读取现有内容
        if (Test-Path $envLocalFile) {
            $envContent = Get-Content $envLocalFile
            # 移除现有的DeepSeek配置
            $envContent = $envContent | Where-Object { $_ -notmatch "NEXT_PUBLIC_DEEPSEEK_API_KEY" }
        }
        
        # 添加新配置
        $envContent += "NEXT_PUBLIC_DEEPSEEK_API_KEY=$apiKey"
        
        # 写入文件
        $envContent | Set-Content $envLocalFile
        
        Write-Host "✅ DeepSeek API密钥已保存到 $envLocalFile" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  请重启开发服务器以应用新配置:" -ForegroundColor Yellow
        Write-Host "   npm run dev" -ForegroundColor Blue
        Write-Host ""
        
    } else {
        Write-Host "❌ 无效的API密钥格式，应以 'sk-' 开头" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📚 更多帮助:" -ForegroundColor Cyan
Write-Host "- 查看项目文档了解详细配置"
Write-Host "- 使用AI诊断页面检查服务状态"
Write-Host "- 如遇问题，请检查网络连接和代理设置"
Write-Host ""

# 询问是否打开诊断页面
$openDiagnosis = Read-Host "是否现在打开AI诊断页面? (y/n)"

if ($openDiagnosis -eq "y" -or $openDiagnosis -eq "Y") {
    try {
        Start-Process "http://localhost:3000/ai-test.html"
        Write-Host "✅ 正在打开AI诊断页面..." -ForegroundColor Green
    } catch {
        Write-Host "❌ 无法自动打开页面，请手动访问: http://localhost:3000/ai-test.html" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 配置完成！" -ForegroundColor Green 