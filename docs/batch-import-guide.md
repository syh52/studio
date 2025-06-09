# 📋 批量导入使用指南

本指南详细介绍如何使用Lexicon的批量导入功能来更新词汇库和对话库。

## 🚀 快速开始

### 1. 访问导入页面

访问 `/admin/import` 页面开始批量导入：

```
http://localhost:9002/admin/import
```

### 2. 选择导入类型

系统支持两种类型的数据导入：
- **词汇库导入**：批量导入单词和短语
- **对话库导入**：批量导入情景对话

## 📝 词汇库导入

### 支持格式

| 格式 | 扩展名 | 推荐度 | 说明 |
|------|--------|--------|------|
| CSV | .csv | ⭐⭐⭐⭐⭐ | 最兼容，支持Excel编辑 |
| Excel | .xlsx | ⭐⭐⭐⭐ | 功能丰富，支持多工作表 |
| JSON | .json | ⭐⭐⭐ | 完整数据结构支持 |

### 词汇数据结构

#### 必填字段
```csv
english,chinese,exampleSentenceEn,exampleSentenceZh
Safety,安全,Safety is our top priority.,安全是我们的首要任务。
Emergency,紧急情况,This is an emergency.,这是紧急情况。
```

#### 完整字段（CSV格式）
```csv
id,english,chinese,partOfSpeech,exampleSentenceEn,exampleSentenceZh,pronunciationAudio,additionalExamples,commonUsages
vt001,Safety,安全,noun,Safety is our top priority.,安全是我们的首要任务。,,"{""english"":""Follow safety procedures."",""chinese"":""遵循安全程序。""}","{""phrase"":""safety measures"",""translation"":""安全措施"",""example"":""New safety measures.""}"
```

#### JSON格式示例
```json
[
  {
    "id": "vt001",
    "english": "Safety",
    "chinese": "安全",
    "partOfSpeech": "noun",
    "exampleSentenceEn": "Safety is our top priority.",
    "exampleSentenceZh": "安全是我们的首要任务。",
    "pronunciationAudio": "",
    "additionalExamples": [
      {
        "english": "Follow safety procedures.",
        "chinese": "遵循安全程序。"
      }
    ],
    "commonUsages": [
      {
        "phrase": "safety measures",
        "translation": "安全措施",
        "example": "We implemented new safety measures."
      }
    ]
  }
]
```

### 词汇导入步骤

1. **选择目标词汇包**
   - 从下拉列表中选择要导入的词汇包
   - 如：`飞行基础与客舱安全` 或 `安保操作与应急处理`

2. **上传文件**
   - 点击文件选择按钮
   - 选择你准备好的词汇文件

3. **解析验证**
   - 点击"解析文件"按钮
   - 系统会自动验证数据格式

4. **预览确认**
   - 查看解析结果和错误提示
   - 确认要导入的词汇数量

5. **执行导入**
   - 点击"确认导入"按钮
   - 等待导入完成

## 💬 对话库导入

### 对话数据结构

#### CSV格式（推荐）
```csv
title,description,icon,speaker,english,chinese,audio
安全检查对话,安全员进行安全检查的标准对话,ShieldAlert,Security Officer,Please show me your ID.,请出示您的身份证。,
安全检查对话,安全员进行安全检查的标准对话,ShieldAlert,Passenger,Here is my ID.,这是我的身份证。,
登机协助,协助乘客登机的对话,PlaneTakeoff,Security Officer,Welcome aboard.,欢迎登机。,
登机协助,协助乘客登机的对话,PlaneTakeoff,Passenger,Thank you.,谢谢。,
```

#### JSON格式示例
```json
[
  {
    "id": "dialogue-security-check",
    "title": "安全检查对话",
    "description": "安全员进行安全检查的标准对话",
    "icon": "ShieldAlert",
    "lines": [
      {
        "id": "line-1",
        "speaker": "Security Officer",
        "english": "Please show me your ID.",
        "chinese": "请出示您的身份证。",
        "audio": ""
      },
      {
        "id": "line-2", 
        "speaker": "Passenger",
        "english": "Here is my ID.",
        "chinese": "这是我的身份证。",
        "audio": ""
      }
    ]
  }
]
```

### 对话导入特点

- **自动合并**：相同`title`的行会自动合并为一个完整对话
- **ID生成**：系统会自动生成唯一的对话ID和行ID
- **验证检查**：确保每个对话至少包含一行对话内容

## 📥 模板下载

### 快速获取模板

1. 访问导入页面的"模板下载"标签
2. 选择所需的数据类型和格式
3. 点击相应的下载按钮

### 可用模板

#### 词汇模板
- `vocabulary_template.csv` - CSV格式词汇模板
- `vocabulary_template.json` - JSON格式词汇模板

#### 对话模板  
- `dialogue_template.csv` - CSV格式对话模板
- `dialogue_template.json` - JSON格式对话模板

#### 说明文档
- `excel_import_instructions.md` - Excel导入详细说明

## ⚠️ 重要注意事项

### 数据验证规则

1. **词汇验证**
   - 英文单词和中文翻译不能为空
   - 英文和中文例句必须提供
   - ID必须唯一（如未提供会自动生成）

2. **对话验证**
   - 对话标题和描述不能为空
   - 每个对话至少包含一行内容
   - 说话人、英文、中文内容不能为空

### 重复处理

- **词汇重复**：基于英文单词判断，重复的词汇会被跳过
- **对话重复**：基于对话标题判断，重复的对话会被跳过
- **统计报告**：导入完成后会显示成功、失败、重复的数量

### 性能建议

- **批次大小**：建议每次导入不超过1000条记录
- **文件大小**：单个文件建议不超过10MB
- **测试导入**：正式导入前先用少量数据测试

## 🛠️ 实际使用示例

### 示例1：导入新词汇

假设你有一个Excel文件包含新的航空词汇：

1. **准备数据**
   ```
   在Excel中创建表格：
   A列: english    B列: chinese    C列: exampleSentenceEn    D列: exampleSentenceZh
   Altitude       高度            The aircraft flies at high altitude.    飞机在高空飞行。
   Runway         跑道            The plane landed on runway 24.          飞机在24号跑道降落。
   ```

2. **保存格式**
   - 另存为 CSV (逗号分隔) 格式
   - 文件名：`new_vocabulary.csv`

3. **执行导入**
   - 选择目标词汇包："飞行基础与客舱安全"
   - 上传 `new_vocabulary.csv`
   - 解析并确认导入

### 示例2：导入新对话

准备一个紧急情况对话：

1. **CSV数据**
   ```csv
   title,description,speaker,english,chinese
   紧急撤离,紧急情况下的撤离指导,Security Officer,Please remain calm and follow my instructions.,请保持冷静并听从我的指示。
   紧急撤离,紧急情况下的撤离指导,Security Officer,Move quickly to the nearest exit.,快速前往最近的出口。
   紧急撤离,紧急情况下的撤离指导,Passenger,Which way should I go?,我应该往哪个方向走？
   ```

2. **导入执行**
   - 上传CSV文件
   - 系统自动将3行合并为1个完整对话
   - 确认导入

## 🔧 故障排除

### 常见错误

1. **文件格式错误**
   ```
   错误：不支持的文件格式
   解决：确保文件扩展名为 .csv、.xlsx 或 .json
   ```

2. **必填字段缺失**
   ```
   错误：第X行: 英文单词不能为空
   解决：检查并填写所有必填字段
   ```

3. **JSON格式错误**
   ```
   错误：文件解析失败
   解决：使用JSON验证工具检查格式是否正确
   ```

### 数据格式问题

1. **CSV编码问题** ✅ **已解决**
   - 系统自动添加UTF-8 BOM，确保中文正确显示
   - 下载的模板文件已优化编码，可直接在Excel中打开
   - 如仍有乱码，请确保使用Excel 2016+版本

2. **特殊字符处理**
   - 包含逗号的文本自动用引号包围
   - JSON字符串会自动转义
   - 系统自动处理换行符和特殊字符

3. **Excel兼容性**
   - 推荐使用Microsoft Excel 2016或更新版本
   - 如使用WPS Office，请选择"编码"→"UTF-8"打开
   - 如使用记事本查看，确保编码设置为UTF-8

## 📊 导入日志

系统会记录所有导入操作：

- **成功记录**：显示成功导入的条目数
- **失败记录**：显示验证失败的条目和错误原因
- **重复记录**：显示被跳过的重复条目数
- **错误详情**：具体的错误信息和位置

## 🔄 数据更新流程

### 完整更新流程

1. **备份现有数据**（推荐）
2. **准备新数据文件**
3. **下载并填写模板**
4. **小批量测试导入**
5. **全量数据导入**
6. **验证导入结果**
7. **更新相关文档**

### 维护建议

- 定期备份词汇和对话数据
- 建立数据更新日志
- 制定数据质量检查流程
- 培训相关人员使用导入功能

---

**提示**: 如遇到问题，请查看导入页面的详细错误信息，或参考本文档的故障排除部分。如需技术支持，请联系开发团队。 