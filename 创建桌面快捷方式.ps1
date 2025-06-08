# 创建 Lexicon 桌面快捷方式脚本

Write-Host "正在创建 Lexicon 桌面快捷方式..." -ForegroundColor Yellow

# 获取当前脚本路径
$currentPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# 获取桌面路径
$desktopPath = [Environment]::GetFolderPath("Desktop")

# 快捷方式路径
$shortcutPath = Join-Path $desktopPath "Lexicon 学习应用.lnk"

# 创建快捷方式对象
$WScript = New-Object -ComObject WScript.Shell
$shortcut = $WScript.CreateShortcut($shortcutPath)

# 设置快捷方式属性
$shortcut.TargetPath = Join-Path $currentPath "启动Lexicon.bat"
$shortcut.WorkingDirectory = $currentPath
$shortcut.Description = "Lexicon 航空安全英语学习应用"
$shortcut.IconLocation = "shell32.dll,13"  # 使用系统图标

# 保存快捷方式
$shortcut.Save()

Write-Host "✅ 桌面快捷方式创建成功！" -ForegroundColor Green
Write-Host "📍 快捷方式位置: $shortcutPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "现在你可以双击桌面上的 'Lexicon 学习应用' 图标来启动应用了！" -ForegroundColor Yellow

Read-Host "按回车键退出" 