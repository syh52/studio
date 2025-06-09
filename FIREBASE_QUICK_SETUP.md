# 🚀 Firebase 快速配置指南

## 🔴 错误原因
您看到 `auth/invalid-api-key` 错误是因为还没有配置 Firebase 的环境变量。

## ✅ 快速解决方案

### 方案 1：使用模拟配置（立即可用）

在项目根目录创建 `.env.local` 文件，添加以下内容：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDMOCKLINVALIDKEYFORTESTING12345678
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lexicon-test.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lexicon-test
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lexicon-test.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

**注意**：这是模拟配置，只能让应用启动，但无法使用真实的 Firebase 功能。

### 方案 2：创建真实的 Firebase 项目（推荐）

#### 第 1 步：创建 Firebase 项目
1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击「创建项目」
3. 输入项目名称（如：lexicon-app）
4. 可以关闭 Google Analytics（不是必需的）
5. 点击「创建项目」

#### 第 2 步：添加 Web 应用
1. 在项目概览页面，点击 Web 图标 `</>`
2. 输入应用昵称（如：Lexicon Web）
3. 点击「注册应用」
4. 您会看到 Firebase 配置代码，类似这样：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

#### 第 3 步：创建 .env.local 文件
在项目根目录创建 `.env.local` 文件，添加您的配置：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=您的apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=您的authDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=您的projectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=您的storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=您的messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=您的appId
```

#### 第 4 步：启用必要的服务

1. **启用 Authentication**
   - 在 Firebase Console 左侧菜单选择「Authentication」
   - 点击「开始」
   - 在「Sign-in method」标签页
   - 启用「电子邮件/密码」
   - 启用「Google」（可选）

2. **启用 Firestore**
   - 在左侧菜单选择「Firestore Database」
   - 点击「创建数据库」
   - 选择「以生产模式启动」
   - 选择数据库位置（建议选择离您最近的）
   - 点击「启用」

#### 第 5 步：重启开发服务器
```bash
# 停止服务器（Ctrl+C）
# 重新启动
npm run dev
```

## 🎯 验证配置

配置成功后，访问测试页面：
http://localhost:9002/test-auth

您应该看到：
- ✅ Firebase 已初始化
- ✅ Firestore 已连接
- ⚠️ 未认证（这是正常的，因为还没登录）

## 📞 需要帮助？

如果遇到问题，请检查：
1. `.env.local` 文件是否在项目根目录
2. 所有环境变量名称是否以 `NEXT_PUBLIC_` 开头
3. Firebase Console 中是否已启用所需服务
4. 是否重启了开发服务器

## 🔒 安全提示

- 不要将 `.env.local` 文件提交到 Git
- 不要在前端代码中硬编码 Firebase 配置
- 生产环境应设置适当的安全规则 