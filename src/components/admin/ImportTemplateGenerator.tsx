"use client";

import { useState } from 'react';
import { Download, FileText, Table, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  generateVocabularyTemplate, 
  generateDialogueTemplate, 
  convertToCSV, 
  downloadFile 
} from '@/lib/import-utils';

export function ImportTemplateGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  // 生成词汇模板数据
  const generateVocabularyTemplateData = () => {
    return [
      {
        id: 'vt001',
        english: 'Example Word',
        chinese: '示例单词',
        partOfSpeech: 'noun',
        exampleSentenceEn: 'This is an example sentence.',
        exampleSentenceZh: '这是一个示例句子。',
        pronunciationAudio: '',
        additionalExamples: JSON.stringify([
          {
            english: 'Another example sentence.',
            chinese: '另一个示例句子。'
          }
        ]),
        commonUsages: JSON.stringify([
          {
            phrase: 'example phrase',
            translation: '示例短语',
            example: 'This is how you use the phrase.'
          }
        ])
      },
      {
        id: 'vt002',
        english: 'Safety',
        chinese: '安全',
        partOfSpeech: 'noun',
        exampleSentenceEn: 'Safety is our top priority.',
        exampleSentenceZh: '安全是我们的首要任务。',
        pronunciationAudio: '',
        additionalExamples: JSON.stringify([
          {
            english: 'Please follow safety procedures.',
            chinese: '请遵循安全程序。'
          }
        ]),
        commonUsages: JSON.stringify([
          {
            phrase: 'safety measures',
            translation: '安全措施',
            example: 'We have implemented new safety measures.'
          }
        ])
      }
    ];
  };

  // 生成对话模板数据
  const generateDialogueTemplateData = () => {
    return [
      {
        title: '示例对话1',
        description: '这是一个示例对话，展示如何格式化对话数据。',
        icon: 'MessageCircle',
        speaker: 'Security Officer',
        english: 'Good morning, may I help you?',
        chinese: '早上好，我可以帮助您吗？',
        audio: ''
      },
      {
        title: '示例对话1',
        description: '这是一个示例对话，展示如何格式化对话数据。',
        icon: 'MessageCircle',
        speaker: 'Passenger',
        english: 'Yes, I have a question about my seat.',
        chinese: '是的，我对我的座位有个问题。',
        audio: ''
      },
      {
        title: '示例对话2',
        description: '另一个示例对话。',
        icon: 'ShieldAlert',
        speaker: 'Security Officer',
        english: 'Please follow the safety instructions.',
        chinese: '请遵循安全指示。',
        audio: ''
      },
      {
        title: '示例对话2',
        description: '另一个示例对话。',
        icon: 'ShieldAlert',
        speaker: 'Passenger',
        english: 'I understand, thank you.',
        chinese: '我明白了，谢谢。',
        audio: ''
      }
    ];
  };

  // 下载词汇CSV模板
  const downloadVocabularyCSV = () => {
    setIsGenerating(true);
    try {
      const data = generateVocabularyTemplateData();
      const csvContent = convertToCSV(data);
      downloadFile(csvContent, 'vocabulary_template.csv', 'text/csv;charset=utf-8;');
    } catch (error) {
      console.error('生成CSV模板失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载词汇JSON模板
  const downloadVocabularyJSON = () => {
    setIsGenerating(true);
    try {
      const data = generateVocabularyTemplate();
      const jsonContent = JSON.stringify(data, null, 2);
      downloadFile(jsonContent, 'vocabulary_template.json', 'application/json;charset=utf-8');
    } catch (error) {
      console.error('生成JSON模板失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载对话CSV模板
  const downloadDialogueCSV = () => {
    setIsGenerating(true);
    try {
      const data = generateDialogueTemplateData();
      const csvContent = convertToCSV(data);
      downloadFile(csvContent, 'dialogue_template.csv', 'text/csv;charset=utf-8;');
    } catch (error) {
      console.error('生成CSV模板失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载对话JSON模板
  const downloadDialogueJSON = () => {
    setIsGenerating(true);
    try {
      const data = generateDialogueTemplate();
      const jsonContent = JSON.stringify(data, null, 2);
      downloadFile(jsonContent, 'dialogue_template.json', 'application/json;charset=utf-8');
    } catch (error) {
      console.error('生成JSON模板失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载Excel模板说明
  const downloadExcelInstructions = () => {
    const instructions = `# Excel 导入模板使用说明

## 词汇数据 Excel 格式

Excel文件应包含以下列（列名必须完全匹配）：

| 列名 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | 文本 | 否 | 词汇ID，如不填写会自动生成 |
| english | 文本 | 是 | 英文单词 |
| chinese | 文本 | 是 | 中文翻译 |
| partOfSpeech | 文本 | 否 | 词性（noun, verb, adjective等） |
| exampleSentenceEn | 文本 | 是 | 英文例句 |
| exampleSentenceZh | 文本 | 是 | 中文例句 |
| pronunciationAudio | 文本 | 否 | 发音音频URL |
| additionalExamples | JSON | 否 | 附加例句（JSON格式） |
| commonUsages | JSON | 否 | 常用搭配（JSON格式） |

## 对话数据 Excel 格式

Excel文件应包含以下列：

| 列名 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | 文本 | 是 | 对话标题 |
| description | 文本 | 是 | 对话描述 |
| icon | 文本 | 否 | 图标名称 |
| speaker | 文本 | 是 | 说话人 |
| english | 文本 | 是 | 英文内容 |
| chinese | 文本 | 是 | 中文内容 |
| audio | 文本 | 否 | 音频URL |

注意：相同title的行会被合并为一个对话。

## 数据示例

### 附加例句格式：
[{"english": "Another example.", "chinese": "另一个例子。"}]

### 常用搭配格式：
[{"phrase": "common phrase", "translation": "常用短语", "example": "Example usage."}]
`;

    downloadFile(instructions, 'excel_import_instructions.md', 'text/markdown;charset=utf-8');
  };

  return (
    <div className="space-y-6">
      {/* 词汇模板 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            词汇数据模板
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-sm">
            下载标准格式的词汇导入模板，包含所有必填字段和示例数据。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-green-400" />
                <span className="font-medium text-white">CSV 格式</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  推荐
                </Badge>
              </div>
              <p className="text-sm text-gray-400">
                适合Excel编辑，兼容性最好
              </p>
              <Button
                onClick={downloadVocabularyCSV}
                disabled={isGenerating}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                下载 CSV 模板
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-white">JSON 格式</span>
              </div>
              <p className="text-sm text-gray-400">
                支持完整数据结构，包含嵌套字段
              </p>
              <Button
                onClick={downloadVocabularyJSON}
                disabled={isGenerating}
                variant="outline"
                className="w-full border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                下载 JSON 模板
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 对话模板 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            对话数据模板
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-sm">
            下载标准格式的对话导入模板，包含多个对话示例。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-green-400" />
                <span className="font-medium text-white">CSV 格式</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  推荐
                </Badge>
              </div>
              <p className="text-sm text-gray-400">
                每行一句对话，相同标题自动合并
              </p>
              <Button
                onClick={downloadDialogueCSV}
                disabled={isGenerating}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                下载 CSV 模板
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-white">JSON 格式</span>
              </div>
              <p className="text-sm text-gray-400">
                完整对话结构，包含对话行数组
              </p>
              <Button
                onClick={downloadDialogueJSON}
                disabled={isGenerating}
                variant="outline"
                className="w-full border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                下载 JSON 模板
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Excel 说明 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Table className="w-5 h-5" />
            Excel 导入说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-sm">
            Excel文件导入的详细说明文档，包含列名要求和数据格式示例。
          </p>
          
          <Button
            onClick={downloadExcelInstructions}
            disabled={isGenerating}
            variant="outline"
            className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            下载 Excel 使用说明
          </Button>
        </CardContent>
      </Card>

      {/* 使用提示 */}
      <Alert className="bg-blue-500/10 border-blue-500/30">
        <AlertDescription className="text-blue-200">
          <div className="space-y-2">
            <div className="font-medium">使用建议：</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>首次使用建议下载CSV模板，在Excel中编辑后保存为CSV格式</li>
              <li>如需复杂数据结构（如附加例句、常用搭配），建议使用JSON格式</li>
              <li>Excel导入需要严格按照列名格式，建议先下载使用说明</li>
              <li>导入前建议先用少量数据进行测试</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* 字段说明 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">词汇字段说明</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="space-y-1">
              <div className="text-green-400">必填字段：</div>
              <ul className="list-disc list-inside text-gray-300 ml-2">
                <li>english - 英文单词</li>
                <li>chinese - 中文翻译</li>
                <li>exampleSentenceEn - 英文例句</li>
                <li>exampleSentenceZh - 中文例句</li>
              </ul>
            </div>
            <div className="space-y-1">
              <div className="text-blue-400">可选字段：</div>
              <ul className="list-disc list-inside text-gray-300 ml-2">
                <li>partOfSpeech - 词性</li>
                <li>pronunciationAudio - 发音音频</li>
                <li>additionalExamples - 附加例句</li>
                <li>commonUsages - 常用搭配</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">对话字段说明</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="space-y-1">
              <div className="text-green-400">必填字段：</div>
              <ul className="list-disc list-inside text-gray-300 ml-2">
                <li>title - 对话标题</li>
                <li>description - 对话描述</li>
                <li>speaker - 说话人</li>
                <li>english - 英文内容</li>
                <li>chinese - 中文内容</li>
              </ul>
            </div>
            <div className="space-y-1">
              <div className="text-blue-400">可选字段：</div>
              <ul className="list-disc list-inside text-gray-300 ml-2">
                <li>icon - 图标名称</li>
                <li>audio - 音频URL</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 