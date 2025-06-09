import { dialogues, vocabularyPacks } from '@/lib/data';
import { dialoguesApi, vocabularyApi, vocabularyPacksApi } from '@/lib/firebase/firestore';

// 数据迁移脚本
export async function migrateDataToFirestore() {
  console.log('🚀 开始数据迁移到Cloud Firestore...');

  try {
    // 1. 迁移词汇包
    console.log('📚 迁移词汇包...');
    for (const pack of vocabularyPacks) {
      await vocabularyPacksApi.create({
        id: pack.id,
        title: pack.name,
        description: pack.description || `${pack.name}词汇包`,
        icon: pack.icon || 'BookOpen'
      });
      console.log(`  ✓ 创建词汇包: ${pack.name}`);
    }

    // 2. 迁移词汇数据
    console.log('📖 迁移词汇数据...');
    for (const pack of vocabularyPacks) {
      if (pack.items && pack.items.length > 0) {
        const result = await vocabularyApi.addManyToPack(pack.id, pack.items);
        console.log(`  ✓ 迁移词汇包 "${pack.name}": ${result.success} 成功, ${result.failed} 失败`);
      }
    }

    // 3. 迁移对话数据
    console.log('💬 迁移对话数据...');
    if (dialogues && dialogues.length > 0) {
      const result = await dialoguesApi.addMany(dialogues);
      console.log(`  ✓ 迁移对话: ${result.success} 成功, ${result.failed} 失败`);
    }

    console.log('🎉 数据迁移完成！');

    return {
      success: true,
      message: '数据迁移成功完成',
      details: {
        vocabularyPacks: vocabularyPacks.length,
        vocabularyItems: vocabularyPacks.reduce((sum, pack) => sum + (pack.items?.length || 0), 0),
        dialogues: dialogues.length
      }
    };

  } catch (error) {
    console.error('❌ 数据迁移失败:', error);
    return {
      success: false,
      message: `数据迁移失败: ${error instanceof Error ? error.message : '未知错误'}`,
      details: null
    };
  }
}

// 检查Firestore中是否已有数据
export async function checkExistingData() {
  try {
    const [existingDialogues, existingVocabulary] = await Promise.all([
      dialoguesApi.getAll(),
      vocabularyApi.getAll()
    ]);

    return {
      hasDialogues: existingDialogues.length > 0,
      hasVocabulary: existingVocabulary.length > 0,
      dialogueCount: existingDialogues.length,
      vocabularyCount: existingVocabulary.length
    };
  } catch (error) {
    console.error('检查现有数据失败:', error);
    return {
      hasDialogues: false,
      hasVocabulary: false,
      dialogueCount: 0,
      vocabularyCount: 0,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
} 