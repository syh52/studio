# Firebase Authentication 设置指南

## 概述

本项目使用 Firebase Authentication 实现真实的用户登录和注册系统，包括以下功能：

- 邮箱密码注册和登录
- 邮箱验证
- 密码重置
- 用户资料管理
- 积分系统
- 每日签到

## 功能特性

### 1. 用户注册
- 支持用户名、邮箱和密码注册
- 密码强度检测
- 自动发送验证邮件
- 用户数据自动同步到 Firestore

### 2. 用户登录
- 邮箱密码登录
- 错误提示（用户不存在、密码错误等）
- 忘记密码功能
- 登录后自动跳转

### 3. 密码重置
- 通过邮箱发送重置链接
- 安全的密码重置流程

### 4. 用户资料
- 查看和编辑个人信息
- 邮箱验证状态显示
- 重新发送验证邮件
- 每日签到获取积分
- 账户创建时间显示

### 5. 数据安全
- 用户数据存储在 Firestore
- 严格的安全规则控制
- 用户只能访问自己的数据

## Firebase 配置步骤

### 1. 启用 Authentication

1. 访问 [Firebase Console](https://console.firebase.google.com)
2. 选择您的项目
3. 在左侧菜单中选择 "Authentication"
4. 点击 "开始"
5. 在 "Sign-in method" 标签页中，启用 "电子邮件/密码"

### 2. 配置邮件模板（可选）

1. 在 Authentication 设置中，选择 "Templates" 标签
2. 自定义以下邮件模板：
   - 邮箱验证邮件
   - 密码重置邮件
   - 邮箱地址更改邮件

### 3. 配置授权域名

1. 在 Authentication 设置中，选择 "Settings" 标签
2. 在 "Authorized domains" 部分添加您的域名
3. 默认已包含 localhost 用于开发

### 4. Firestore 安全规则

确保 Firestore 规则已正确配置（见 `firestore.rules`）：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能读写自己的数据
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // 用户的子集合
      match /{subcollection}/{document} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 使用说明

### 注册新用户

```typescript
// 在 AuthContext 中已实现
const { register } = useAuth();
const success = await register(username, email, password);
```

### 登录用户

```typescript
const { login } = useAuth();
const success = await login(email, password);
```

### 重置密码

```typescript
const { resetPassword } = useAuth();
const success = await resetPassword(email);
```

### 更新用户资料

```typescript
const { updateUserProfile } = useAuth();
const success = await updateUserProfile({
  username: "新用户名",
  bio: "个人简介"
});
```

### 发送验证邮件

```typescript
const { sendVerificationEmail } = useAuth();
const success = await sendVerificationEmail();
```

## 用户数据结构

用户数据存储在 Firestore 的 `users` 集合中：

```typescript
interface User {
  id: string;              // Firebase Auth UID
  email: string;           // 用户邮箱
  username: string;        // 用户名
  indexPoints: number;     // 学习积分
  lastCheckIn: string | null;  // 最后签到日期
  photoURL?: string;       // 头像URL
  emailVerified: boolean;  // 邮箱验证状态
  createdAt: Date;         // 创建时间
  updatedAt: Date;         // 更新时间
  bio?: string;            // 个人简介
}
```

## 错误处理

系统会自动处理常见错误并显示友好的中文提示：

- `auth/user-not-found` → "用户不存在"
- `auth/wrong-password` → "密码错误"
- `auth/email-already-in-use` → "该邮箱已被注册"
- `auth/weak-password` → "密码强度太弱"
- `auth/invalid-email` → "邮箱格式无效"
- `auth/too-many-requests` → "尝试次数过多，请稍后再试"

## 测试账号

在开发环境中，您可以创建测试账号进行功能测试：

1. 访问 `/register` 页面
2. 填写测试信息（建议使用真实邮箱以测试邮件功能）
3. 注册成功后会自动跳转到登录页面
4. 使用注册的邮箱和密码登录

## 注意事项

1. **邮箱验证**：虽然系统会发送验证邮件，但用户无需验证也可以登录和使用基本功能
2. **密码要求**：密码至少需要6个字符（Firebase 的最低要求）
3. **积分系统**：每日签到可获得10积分，积分数据存储在 Firestore 中
4. **数据同步**：用户数据在 Firebase Auth 和 Firestore 之间自动同步

## 故障排除

### 无法发送邮件
- 检查 Firebase 项目是否已升级到 Blaze 计划
- 确认邮箱地址格式正确
- 查看 Firebase Console 中的 Authentication 日志

### 登录失败
- 确认邮箱和密码正确
- 检查账户是否被禁用
- 查看浏览器控制台的错误信息

### Firestore 权限错误
- 确认用户已登录
- 检查 Firestore 安全规则
- 确保访问的是用户自己的数据

## 扩展功能

未来可以添加的功能：

1. **第三方登录**：Google、GitHub、微信等
2. **双因素认证**：提高账户安全性
3. **账户关联**：允许用户关联多个登录方式
4. **用户角色**：管理员、普通用户等权限控制
5. **账户恢复**：通过安全问题恢复账户 