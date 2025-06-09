# 🔥 Firebase MCP 服务器设置指南

## ✅ 当前状态
Firebase官方MCP服务器已成功配置！使用Firebase CLI的 `experimental:mcp` 功能

## 📋 配置完成

### ✅ Cursor MCP配置已完成

项目根目录的 `.cursor/mcp.json` 已配置为：

```json
{
  "mcpServers": {
    "firebase": {
      "command": "firebase",
      "args": ["experimental:mcp", "--dir", "/i/firebase/studio"]
    }
  }
}
```

### 🚀 如何使用

1. **重启Cursor** - 让MCP配置生效
2. **确保Firebase CLI已登录** - 运行 `firebase login` 确认登录状态
3. **测试MCP连接** - 在Cursor中询问："请测试Firebase MCP连接"

### 💡 优势

使用官方Firebase MCP服务器的优势：
- ✅ 无需额外安装第三方包
- ✅ 无需服务账户密钥文件  
- ✅ 自动使用Firebase CLI的认证状态
- ✅ 官方支持，更稳定可靠

## 🚀 可用功能

Firebase MCP为您提供以下工具：

### Firestore数据库操作
- `firestore_add_document` - 添加文档
- `firestore_list_documents` - 列出文档  
- `firestore_get_document` - 获取特定文档
- `firestore_update_document` - 更新文档
- `firestore_delete_document` - 删除文档
- `firestore_list_collections` - 列出集合
- `firestore_query_collection_group` - 查询集合组

### 存储文件操作
- `storage_list_files` - 列出文件
- `storage_get_file_info` - 获取文件信息
- `storage_upload` - 上传文件
- `storage_upload_from_url` - 从URL上传文件

### 用户认证
- `auth_get_user` - 获取用户信息

## 🎯 项目信息

- **项目ID**: lexa-e87a6
- **项目名称**: Lexa
- **存储桶**: lexa-e87a6.firebasestorage.app

---
*生成时间: 2025年6月10日* 