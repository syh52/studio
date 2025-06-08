# Firebase 环境变量配置指南

## 创建 .env.local 文件

在项目根目录（studio/）创建 `.env.local` 文件，并添加以下内容：

```env
# Firebase 配置
# 从 Firebase Console 获取这些值
NEXT_PUBLIC_FIREBASE_API_KEY=你的-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=你的项目.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=你的项目id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=你的项目.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=你的发送者id
NEXT_PUBLIC_FIREBASE_APP_ID=你的应用id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-你的测量id
```

## 获取这些值的步骤

1. 登录 [Firebase Console](https://console.firebase.google.com/)
2. 选择或创建一个项目
3. 点击左侧菜单的设置图标（⚙️）
4. 选择"项目设置"
5. 向下滚动到"您的应用"部分
6. 如果还没有应用，点击"添加应用"并选择 Web（</> 图标）
7. 复制显示的配置对象中的值

## 示例配置

```javascript
// Firebase Console 会显示类似这样的配置：
const firebaseConfig = {
  apiKey: "AIzaSyDOCAbC123dEf456GhI789jKl01-MnO",
  authDomain: "myapp-project-123.firebaseapp.com",
  projectId: "myapp-project-123",
  storageBucket: "myapp-project-123.appspot.com",
  messagingSenderId: "65211879809",
  appId: "1:65211879909:web:3ae38ef1cdcb2e01fe5f0c",
  measurementId: "G-8HWG0JG5K9"
};
```

将这些值复制到 `.env.local` 文件中对应的环境变量。

## 重要提示

1. **不要提交 .env.local 文件到 Git**
   - 该文件已在 `.gitignore` 中
   - 包含敏感信息

2. **所有变量必须以 NEXT_PUBLIC_ 开头**
   - 这是 Next.js 的要求
   - 只有这样前端代码才能访问

3. **重启开发服务器**
   - 修改环境变量后需要重启：`npm run dev`

## 验证配置

配置完成后，重启开发服务器。如果配置正确，你应该看到：
- 右下角显示"Firebase 已成功初始化 ✓"（3秒后消失）
- 控制台无错误信息

如果看到错误提示，请检查：
- 环境变量是否正确设置
- Firebase 项目是否已正确配置
- 是否启用了必要的 Firebase 服务（Authentication、Firestore） 