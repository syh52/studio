# 数据初始化脚本说明

## 关于 initializeFirestoreData.ts

这个脚本用于将词汇和对话数据初始化到 Firestore 数据库中。它使用 Firebase Admin SDK，需要单独安装和配置。

## 使用步骤

### 1. 安装 Firebase Admin SDK

```bash
npm install -D firebase-admin @types/node
```

### 2. 获取服务账号密钥

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 进入项目设置 → 服务账号
3. 点击"生成新的私钥"
4. 将下载的 JSON 文件保存到安全位置（不要提交到 Git）

### 3. 设置环境变量

```bash
# Windows PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"

# macOS/Linux
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
```

### 4. 运行脚本

```bash
# 编译 TypeScript
npx tsc scripts/initializeFirestoreData.ts --outDir scripts/dist

# 运行编译后的脚本
node scripts/dist/initializeFirestoreData.js
```

## 注意事项

1. **安全性**：服务账号密钥拥有完全的数据库访问权限，请妥善保管
2. **成本**：初始化会产生 Firestore 写入操作，请注意配额
3. **幂等性**：脚本会覆盖现有数据，请谨慎使用

## 替代方案

如果不想使用脚本，也可以：

1. 使用 Firebase Console 手动创建数据
2. 使用 Firebase Emulator 进行本地测试
3. 创建一个管理后台界面来管理数据 