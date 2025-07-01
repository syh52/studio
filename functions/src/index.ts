import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';
import express, { Request, Response } from 'express';

// 初始化Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const app = express();

// CORS配置 - 允许来自Lexicon应用的请求
const corsOptions = {
  origin: [
    'https://lexiconlab.cn',
    'https://www.lexiconlab.cn',
    'https://api.lexiconlab.cn',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// 🔥 添加根路径处理
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    service: 'Lexicon Cloud Functions API',
    timestamp: new Date().toISOString(),
    message: '🚀 欢迎使用 Lexicon Cloud Functions API',
    endpoints: {
      health: 'GET /health',
      userRegister: 'POST /users/register',
      getUser: 'GET /users/:uid',
      saveProgress: 'POST /progress/save',
      getProgress: 'GET /progress/:uid'
    },
    documentation: 'https://lexiconlab.cn/docs/api'
  });
});

// 🔥 用户注册 - 避免WebChannel问题
app.post('/users/register', async (req: Request, res: Response) => {
  try {
    const { uid, email, displayName, role = 'student' } = req.body;
    
    console.log('📝 用户注册请求:', { uid, email, displayName, role });
    
    // 创建用户文档
    const userDoc = {
      uid,
      email,
      displayName,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      stats: {
        totalSessions: 0,
        totalWords: 0,
        correctAnswers: 0,
        totalAnswers: 0
      },
      preferences: {
        difficulty: 'intermediate',
        dailyGoal: 20,
        notifications: true
      }
    };
    
    // 使用事务确保数据一致性
    await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(uid);
      
      // 检查用户是否已存在
      const userSnapshot = await transaction.get(userRef);
      if (userSnapshot.exists) {
        throw new Error('用户已存在');
      }
      
      // 创建用户
      transaction.set(userRef, userDoc);
      
      // 创建用户统计文档
      const statsRef = db.collection('userStats').doc(uid);
      transaction.set(statsRef, {
        uid,
        totalStudyTime: 0,
        streak: 0,
        lastStudyDate: null,
        achievements: [],
        level: 1,
        experience: 0
      });
    });
    
    console.log('✅ 用户注册成功:', uid);
    
    res.status(200).json({
      success: true,
      message: '用户注册成功',
      user: { uid, email, displayName, role }
    });
    
  } catch (error: any) {
    console.error('❌ 用户注册失败:', error);
    
    res.status(400).json({
      success: false,
      error: error.message || '注册失败',
      code: 'REGISTRATION_FAILED'
    });
  }
});

// 🔥 获取用户数据 - 避免实时监听问题
app.get('/users/:uid', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    
    console.log('📖 获取用户数据:', uid);
    
    const [userDoc, statsDoc] = await Promise.all([
      db.collection('users').doc(uid).get(),
      db.collection('userStats').doc(uid).get()
    ]);
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: '用户不存在',
        code: 'USER_NOT_FOUND'
      });
    }
    
    const userData = userDoc.data();
    const statsData = statsDoc.exists ? statsDoc.data() : null;
    
    res.status(200).json({
      success: true,
      user: userData,
      stats: statsData
    });
    
  } catch (error: any) {
    console.error('❌ 获取用户数据失败:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || '获取用户数据失败',
      code: 'FETCH_USER_FAILED'
    });
  }
});

// 🔥 保存学习进度 - 批量写入避免WebChannel
app.post('/progress/save', async (req: Request, res: Response) => {
  try {
    const { uid, sessionData } = req.body;
    
    console.log('💾 保存学习进度:', { uid, sessionType: sessionData.type });
    
    const batch = db.batch();
    
    // 保存学习会话
    const sessionRef = db.collection('learningSessions').doc();
    batch.set(sessionRef, {
      uid,
      ...sessionData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      id: sessionRef.id
    });
    
    // 更新用户统计
    const userStatsRef = db.collection('userStats').doc(uid);
    batch.update(userStatsRef, {
      totalStudyTime: admin.firestore.FieldValue.increment(sessionData.duration || 0),
      lastStudyDate: admin.firestore.FieldValue.serverTimestamp(),
      experience: admin.firestore.FieldValue.increment(sessionData.score || 0)
    });
    
    // 更新用户基础统计
    const userRef = db.collection('users').doc(uid);
    batch.update(userRef, {
      'stats.totalSessions': admin.firestore.FieldValue.increment(1),
      'stats.totalAnswers': admin.firestore.FieldValue.increment(sessionData.totalAnswers || 0),
      'stats.correctAnswers': admin.firestore.FieldValue.increment(sessionData.correctAnswers || 0),
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await batch.commit();
    
    console.log('✅ 学习进度保存成功');
    
    res.status(200).json({
      success: true,
      message: '学习进度保存成功',
      sessionId: sessionRef.id
    });
    
  } catch (error: any) {
    console.error('❌ 保存学习进度失败:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || '保存学习进度失败',
      code: 'SAVE_PROGRESS_FAILED'
    });
  }
});

// 🔥 获取学习历史 - 分页查询避免大量数据传输
app.get('/progress/:uid', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { limit = '20', offset = '0' } = req.query;
    
    console.log('📊 获取学习历史:', { uid, limit, offset });
    
    let query = db.collection('learningSessions')
      .where('uid', '==', uid)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit as string));
    
    if (offset !== '0') {
      // 简化分页，使用offset
      const offsetNum = parseInt(offset as string);
      const skipQuery = await db.collection('learningSessions')
        .where('uid', '==', uid)
        .orderBy('timestamp', 'desc')
        .limit(offsetNum)
        .get();
        
      if (!skipQuery.empty) {
        const lastDoc = skipQuery.docs[skipQuery.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }
    
    const snapshot = await query.get();
    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({
      success: true,
      sessions,
      hasMore: snapshot.docs.length === parseInt(limit as string)
    });
    
  } catch (error: any) {
    console.error('❌ 获取学习历史失败:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || '获取学习历史失败',
      code: 'FETCH_PROGRESS_FAILED'
    });
  }
});

// 🔥 健康检查
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    service: 'Lexicon Cloud Functions',
    timestamp: new Date().toISOString(),
    message: '🚀 Cloud Functions运行正常 - 避免WebChannel问题'
  });
});

// 导出Cloud Function
export const api = functions
  .region('us-central1') // 选择合适的区域
  .runWith({
    memory: '512MB',
    timeoutSeconds: 60
  })
  .https
  .onRequest(app);

// 🔥 用户删除触发器 - 清理相关数据
export const onUserDelete = functions
  .region('us-central1')
  .auth
  .user()
  .onDelete(async (user) => {
    const uid = user.uid;
    console.log('🗑️ 清理用户数据:', uid);
    
    const batch = db.batch();
    
    try {
      // 删除用户文档
      const userRef = db.collection('users').doc(uid);
      batch.delete(userRef);
      
      // 删除用户统计
      const statsRef = db.collection('userStats').doc(uid);
      batch.delete(statsRef);
      
      // 删除学习会话（批量）
      const sessionsQuery = await db.collection('learningSessions')
        .where('uid', '==', uid)
        .limit(500) // 批量删除限制
        .get();
        
      sessionsQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      console.log('✅ 用户数据清理完成:', uid);
    } catch (error) {
      console.error('❌ 用户数据清理失败:', error);
    }
  }); 