#!/bin/bash

echo "🔧 Firebase Storage 快速修复脚本"
echo "================================="

# 检查Firebase CLI是否已安装
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI 未安装，正在安装..."
    npm install -g firebase-tools
fi

echo "📋 检查项目配置..."

# 检查firebase.json是否包含storage配置
if grep -q '"storage"' firebase.json; then
    echo "✅ firebase.json 包含 storage 配置"
else
    echo "❌ firebase.json 缺少 storage 配置"
    exit 1
fi

# 检查storage.rules文件是否存在
if [ -f "storage.rules" ]; then
    echo "✅ storage.rules 文件存在"
else
    echo "❌ storage.rules 文件不存在"
    exit 1
fi

echo "🚀 开始部署 Firebase Storage 配置..."

# 登录Firebase（如果需要）
firebase login --no-localhost

# 选择项目
firebase use lexa-e87a6

# 部署Storage规则
echo "📤 部署 Storage 规则..."
firebase deploy --only storage

if [ $? -eq 0 ]; then
    echo "✅ Storage 配置部署成功！"
    echo ""
    echo "🎯 接下来的步骤："
    echo "1. 访问 Firebase 控制台确认 Storage 已启用"
    echo "2. 在应用中测试音频上传功能"
    echo "3. 查看音频管理页面是否正常显示"
    echo ""
    echo "📖 如果仍有问题，请查看: docs/firebase-storage-setup.md"
else
    echo "❌ Storage 配置部署失败"
    echo "请检查网络连接和 Firebase 项目权限"
    exit 1
fi 