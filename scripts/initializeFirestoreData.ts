import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { vocabularyPacks, dialogues } from '../src/lib/data';

// 注意：这是一个 Node.js 脚本，需要 Firebase Admin SDK
// 运行前需要：
// 1. npm install -D firebase-admin
// 2. 下载服务账号密钥文件（从 Firebase Console）
// 3. 设置环境变量 GOOGLE_APPLICATION_CREDENTIALS 指向密钥文件

const initializeData = async () => {
  try {
    // 初始化 Admin SDK
    const app = initializeApp({
      credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS!)
    });

    const db = getFirestore(app);
    console.log('🔥 Firebase Admin SDK 已初始化');

    // 导入词汇包数据
    console.log('\n📚 开始导入词汇包数据...');
    for (const pack of vocabularyPacks) {
      const { items, ...packData } = pack;
      
      // 创建词汇包文档
      const packRef = db.collection('vocabularyPacks').doc(pack.id);
      await packRef.set({
        ...packData,
        itemCount: items.length,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 创建词汇项子集合
      const itemsCollection = packRef.collection('items');
      const batch = db.batch();
      
      items.forEach((item, index) => {
        const itemRef = itemsCollection.doc(item.id);
        batch.set(itemRef, {
          ...item,
          order: index,
          createdAt: new Date()
        });
      });

      await batch.commit();
      console.log(`✅ 已导入词汇包: ${pack.name} (${items.length} 个词汇)`);
    }

    // 导入对话数据
    console.log('\n💬 开始导入对话数据...');
    for (const dialogue of dialogues) {
      const { lines, ...dialogueData } = dialogue;
      
      // 创建对话文档
      const dialogueRef = db.collection('dialogues').doc(dialogue.id);
      await dialogueRef.set({
        ...dialogueData,
        lineCount: lines.length,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 创建对话行子集合
      const linesCollection = dialogueRef.collection('lines');
      const batch = db.batch();
      
      lines.forEach((line, index) => {
        const lineRef = linesCollection.doc(line.id);
        batch.set(lineRef, {
          ...line,
          order: index,
          createdAt: new Date()
        });
      });

      await batch.commit();
      console.log(`✅ 已导入对话: ${dialogue.title} (${lines.length} 行)`);
    }

    console.log('\n🎉 数据初始化完成！');
    console.log(`📊 总计: ${vocabularyPacks.length} 个词汇包, ${dialogues.length} 个对话`);

  } catch (error) {
    console.error('❌ 数据初始化失败:', error);
    process.exit(1);
  }
};

// 运行脚本
if (require.main === module) {
  console.log('🚀 开始初始化 Firestore 数据...');
  initializeData().then(() => {
    console.log('✨ 完成！');
    process.exit(0);
  });
} 