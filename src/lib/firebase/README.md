<<<<<<< HEAD
# Firebase 配置和使用指南

## 已配置的服务

这个项目已经配置了以下 Firebase 服务：

- **Authentication** (认证)
- **Firestore Database** (数据库)
- **Storage** (存储)
- **Analytics** (分析)

## 使用方法

### 导入 Firebase 服务

```typescript
import { auth, db, storage, analytics } from '@/lib/firebase';
```

### Authentication 示例

```typescript
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// 登录
const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('登录失败:', error);
  }
};

// 注册
const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('注册失败:', error);
  }
};
```

### Firestore Database 示例

```typescript
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, addDoc } from 'firebase/firestore';

// 获取文档
const getDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log('文档不存在');
    return null;
  }
};

// 创建文档
const createDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error('创建文档失败:', error);
  }
};
```

### Storage 示例

```typescript
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// 上传文件
const uploadFile = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('文件上传失败:', error);
  }
};
```

### Analytics 示例

```typescript
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

// 记录自定义事件
const logCustomEvent = (eventName: string, parameters?: any) => {
  if (analytics) {
    logEvent(analytics, eventName, parameters);
  }
};

// 记录页面浏览
const logPageView = (pageName: string) => {
  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_title: pageName,
      page_location: window.location.href
    });
  }
};

// 记录用户行为
const logUserAction = (action: string, category: string) => {
  if (analytics) {
    logEvent(analytics, 'user_action', {
      action: action,
      category: category
    });
  }
};
```

## 项目信息

- **项目ID**: lexa-e87a6
- **域名**: lexa-e87a6.firebaseapp.com  
- **存储桶**: lexa-e87a6.firebasestorage.app
- **Analytics ID**: G-S1KEL6T2C2 
=======
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
>>>>>>> ae0a3175cd844dddbc719ac4af2991720512f695
