# Firebase Authentication 配置修复指南

## 问题描述
当前遇到的错误：`Firebase: Error (auth/operation-not-allowed)`
这表明Firebase Authentication的邮箱/密码登录方式没有被启用。

## 解决步骤

### 1. 访问Firebase Console
1. 打开浏览器，访问 [Firebase Console](https://console.firebase.google.com)
2. 使用您的Google账号登录
3. 选择项目 `aviation-lexicon-trainer`

### 2. 启用Authentication
1. 在左侧导航栏中，点击 **"Authentication"**
2. 如果是第一次使用，点击 **"开始使用"**
3. 选择 **"Sign-in method"** 标签页

### 3. 启用邮箱/密码登录
1. 在登录提供商列表中，找到 **"电子邮件地址/密码"**
2. 点击该选项进行编辑
3. 启用 **"电子邮件地址/密码"** 开关 ✅
4. （可选）如果需要无密码登录，也可以启用 **"电子邮件地址链接（无密码登录）"**
5. 点击 **"保存"**

### 4. 验证配置
启用后，您应该看到：
- "电子邮件地址/密码" 状态显示为 **"已启用"**
- 在项目概览中可以看到Authentication已激活

### 5. 测试应用
返回到您的应用：
1. 尝试注册新用户
2. 验证注册邮件发送
3. 尝试登录

## 可能的其他配置

### 邮件模板自定义（可选）
1. 在Authentication页面，选择 **"Templates"** 标签
2. 可以自定义：
   - 邮箱验证邮件
   - 密码重置邮件
   - 邮箱地址更改邮件

### 授权域名配置
1. 在Authentication页面，选择 **"Settings"** 标签
2. 在 **"Authorized domains"** 部分确认包含：
   - `localhost`（用于开发）
   - 您的生产域名

## 常见问题

### Q: 仍然显示 "operation-not-allowed" 错误
A: 请确认：
1. 刷新页面重新加载配置
2. 检查浏览器控制台是否有其他错误
3. 确认Firebase项目配置正确

### Q: 注册成功但无法登录
A: 可能原因：
1. 邮箱未验证（可以暂时忽略）
2. 用户账户被禁用
3. 检查Firestore安全规则

### Q: 发送验证邮件失败
A: 确认：
1. Firebase项目已升级到Blaze计划（免费额度通常够用）
2. 检查邮件提供商设置

## 预期结果
配置完成后，您应该能够：
✅ 注册新用户（会发送验证邮件）
✅ 登录已注册用户
✅ 重置密码
✅ 更新用户资料

## 联系支持
如果按照上述步骤仍然有问题，请：
1. 截图Firebase Console的Authentication配置页面
2. 提供浏览器控制台的完整错误信息
3. 确认是否收到验证邮件 