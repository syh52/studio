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