# Firestore 设置指南

本指南将帮助您配置 Cloud Firestore 以支持批量上传功能。

## 前提条件

- Firebase 项目已创建
- 已升级到 Blaze 计划（按使用量付费）

## 步骤 1：启用 Cloud Firestore

1. 访问 [Firebase 控制台](https://console.firebase.google.com/project/aviation-lexicon-trainer)
2. 在左侧菜单中，点击"构建" > "Firestore Database"
3. 点击"创建数据库"按钮
4. 选择数据库位置（建议选择离您用户最近的区域）
5. 选择"在生产模式下启动"（我们稍后会配置安全规则）
6. 点击"启用"

## 步骤 2：配置安全规则

1. 在 Firestore 控制台中，点击"规则"标签
2. 将以下规则复制并粘贴到编辑器中：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能访问自己的数据
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // 用户的自定义词汇包
      match /customVocabularyPacks/{packId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // 用户的自定义对话
      match /customDialogues/{dialogueId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // 拒绝所有其他访问
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. 点击"发布"按钮

## 步骤 3：启用 Firebase Authentication

批量上传功能需要用户身份验证。请确保：

1. 在 Firebase 控制台中，点击"构建" > "Authentication"
2. 点击"开始使用"
3. 启用所需的登录方法（如电子邮件/密码）

## 步骤 4：验证设置

1. 登录您的应用
2. 访问"批量上传"功能
3. 尝试上传一个测试词汇或对话
4. 检查 Firestore 控制台的"数据"标签，确认数据已保存

## 数据结构

Firestore 中的数据按以下结构组织：

```
users/
  {userId}/
    customVocabularyPacks/
      {packId}/
        - id
        - name
        - description
        - items[]
        - uploadedAt
        - userId
    
    customDialogues/
      {dialogueId}/
        - id
        - title
        - description
        - lines[]
        - uploadedAt
        - userId
```

## 注意事项

1. **计费**：Firestore 按读写操作和存储量计费。批量上传功能会产生费用。
2. **配额限制**：免费配额包括：
   - 每天 50,000 次读取
   - 每天 20,000 次写入
   - 1 GiB 存储
3. **性能优化**：
   - 批量上传时使用批处理操作
   - 实现分页以避免一次加载过多数据
4. **备份**：定期导出 Firestore 数据作为备份

## 故障排除

### 错误：Permission denied

- 检查安全规则是否正确配置
- 确保用户已登录
- 验证用户 ID 是否匹配

### 错误：Firestore not initialized

- 确保 Firestore 已在 Firebase 控制台中启用
- 检查网络连接
- 清除浏览器缓存并重试

### 上传成功但看不到数据

- 刷新页面
- 检查浏览器控制台是否有错误
- 在 Firestore 控制台验证数据是否存在

## 下一步

- 考虑实现数据导入/导出功能
- 添加数据验证和清理
- 实现批量编辑功能
- 添加共享功能（允许用户共享自定义内容） 