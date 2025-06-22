## Relevant Files

- `studio/src/lib/firestore-service.ts` - Firestore数据服务，需要添加公共内容相关的函数
- `studio/src/lib/data.ts` - 数据获取逻辑，需要修改为加载公共内容
- `studio/src/components/BulkUpload.tsx` - 上传组件，需要修改为保存到公共空间
- `studio/src/lib/ai-service.ts` - AI服务，需要改进例句生成逻辑
- `studio/firestore.rules` - Firestore安全规则，需要添加公共内容的访问权限
- `studio/src/app/manage/page.tsx` - 管理页面，需要支持公共内容的编辑
- `studio/src/components/manage/VocabularyEditingInterface.tsx` - 词汇编辑界面，需要集成新的AI例句生成
- `studio/src/components/AISmartImport.tsx` - AI导入组件，需要使用新的例句生成逻辑
- `studio/src/app/vocabulary/page.tsx` - 词汇页面，需要显示公共内容
- `studio/src/app/dialogues/page.tsx` - 对话页面，需要显示公共内容

### 注意事项

- 使用 `npm run dev` 启动开发服务器进行测试
- 数据迁移操作需要谨慎，建议先在测试环境验证
- AI例句生成可能需要时间，需要实现适当的loading状态

## 任务

- [x] 1.0 更新Firestore数据结构和安全规则
  - [x] 1.1 更新Firestore安全规则，添加公共内容集合的访问权限
  - [x] 1.2 在firestore-service.ts中添加公共内容的CRUD函数
  - [x] 1.3 添加数据迁移函数，将私有内容迁移到公共空间
  - [x] 1.4 测试新的数据结构和权限设置

- [x] 2.0 改进AI例句生成系统
  - [x] 2.1 优化ai-service.ts中的例句生成prompt，使其更自然简短
  - [x] 2.2 添加异步例句生成功能，支持后台处理
  - [x] 2.3 在VocabularyEditingInterface中集成新的AI例句生成
  - [x] 2.4 为AISmartImport组件添加改进的例句生成逻辑

- [x] 3.0 修改上传逻辑为公共内容保存
  - [x] 3.1 修改BulkUpload组件，将内容保存到公共空间而非用户私有空间
  - [x] 3.2 更新上传成功后的提示信息，说明内容已保存为公共资源
  - [x] 3.3 在上传过程中集成新的AI例句生成
  - [x] 3.4 测试上传功能，确保内容正确保存到公共空间

- [x] 4.0 更新内容显示和访问逻辑
  - [x] 4.1 修改data.ts中的getAllVocabularyPacks和getAllDialogues函数，加载公共内容
  - [x] 4.2 更新vocabulary页面，显示公共内容并添加作者信息
  - [x] 4.3 更新dialogues页面，显示公共内容并添加作者信息
  - [x] 4.4 在内容卡片上添加"公共内容"标识和原作者显示

- [x] 5.0 实现协作编辑功能
  - [x] 5.1 修改管理页面，支持编辑公共内容
  - [x] 5.2 在编辑公共内容前添加警告提示
  - [x] 5.3 记录编辑操作的用户和时间戳
  - [x] 5.4 测试多用户协作编辑功能

- [x] 6.0 执行数据迁移和系统测试
  - [x] 6.1 备份现有的所有用户数据
  - [x] 6.2 执行私有内容到公共空间的迁移
  - [x] 6.3 验证迁移后的数据完整性
  - [x] 6.4 进行全面的功能测试，确保所有功能正常工作 