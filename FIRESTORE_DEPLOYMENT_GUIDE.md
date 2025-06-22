# Firestore 安全规则部署指南

## 🚨 问题诊断
如果数据没有正确上传到Firestore，可能的原因包括：

### 1. 安全规则未部署
安全规则文件已更新，但可能还没有部署到Firebase服务器。

### 2. Firebase CLI 设置问题
可能需要重新配置Firebase CLI。

## 🔧 解决步骤

### 第一步：重新认证Firebase CLI
```bash
firebase login --reauth
```

### 第二步：设置项目
```bash
firebase use aviation-lexicon-trainer
```

### 第三步：部署安全规则
```bash
firebase deploy --only firestore:rules
```

### 第四步：验证部署
1. 打开 [Firebase 控制台](https://console.firebase.google.com/project/aviation-lexicon-trainer/firestore/rules)
2. 检查安全规则是否已更新
3. 确认规则包含以下内容：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能读写自己的数据
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
      
      // 测试文档（用于调试）
      match /test/{document} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // 测试集合 - 仅用于连接测试
    match /test/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // 默认拒绝所有其他访问
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🧪 测试步骤

### 1. 访问测试页面
打开: `http://localhost:3000/test-firestore`

### 2. 运行诊断测试
- 点击"重新测试"按钮
- 检查所有测试项目是否通过
- 特别关注"写入权限测试"

### 3. 测试保存功能
- 点击"测试保存功能"按钮
- 如果成功，会在"词汇数据"标签页看到新的测试词汇包

### 4. 测试AI智能导入
1. 访问 `/upload` 页面
2. 在"AI智能导入"标签页输入测试数据：
   ```
   altitude 高度
   runway 跑道  
   clearance 许可
   ```
3. 点击"AI智能解析"
4. 点击"确认导入到云端"

## 🔍 故障排除

### 错误：permission-denied
- 安全规则未正确部署
- 用户未正确认证
- 项目ID不匹配

### 错误：unauthenticated  
- Firebase配置错误
- API密钥无效
- 认证状态异常

### 错误：failed-precondition
- Firestore未启用
- 项目配置错误

## 📞 获取帮助

如果问题持续存在：

1. 打开浏览器开发者工具
2. 查看控制台错误信息
3. 在测试页面点击"输出调试信息到控制台"
4. 将错误信息提供给技术支持

## 📋 检查清单

- [ ] Firebase CLI已安装并认证
- [ ] 项目已设置为 aviation-lexicon-trainer
- [ ] 安全规则已部署
- [ ] Firestore已在控制台启用
- [ ] 用户已正确登录应用
- [ ] 浏览器没有网络连接问题 