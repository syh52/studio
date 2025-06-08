# Firebase 配置说明

## 环境变量配置

在项目根目录创建 `.env.local` 文件，并添加以下环境变量：

```env
# Firebase 配置
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## 获取 Firebase 配置

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 创建新项目或选择现有项目
3. 在项目设置中找到 "您的应用" 部分
4. 点击 "添加应用" 并选择 "Web"
5. 注册应用后，复制配置对象中的值

## Firebase 服务启用

确保在 Firebase Console 中启用以下服务：

1. **Authentication**
   - 启用邮箱/密码登录
   - 启用 Google 登录

2. **Firestore Database**
   - 创建数据库（选择生产模式）
   - 设置安全规则（见下方）

3. **Storage**（如需要）
   - 创建默认存储桶

## Firestore 安全规则

在 Firestore 控制台的 "规则" 标签页中，添加以下规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能访问自己的数据
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // 子集合规则
      match /{subcollection}/{document} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // 词汇包和对话 - 所有认证用户可读
    match /vocabularyPacks/{packId} {
      allow read: if request.auth != null;
      allow write: if false; // 只能通过管理后台写入
    }
    
    match /dialogues/{dialogueId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

## 初始化数据

首次部署后，需要将词汇包和对话数据导入 Firestore。可以使用 Firebase Admin SDK 或通过控制台手动导入。 