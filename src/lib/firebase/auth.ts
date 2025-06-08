import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

// 用户数据接口
export interface UserData {
  username: string;
  email: string;
  photoURL?: string;
}

// 创建用户文档
const createUserDocument = async (userId: string, userData: UserData) => {
  const userRef = doc(db, 'users', userId);
  
  // 检查用户是否已存在
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    // 更新最后登录时间
    await updateDoc(userRef, {
      'profile.lastLoginAt': serverTimestamp()
    });
    return;
  }
  
  // 创建新用户文档
  await setDoc(userRef, {
    profile: {
      ...userData,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    },
    progress: {
      indexPoints: 0,
      lastCheckIn: null,
      totalCheckIns: 0,
      streakDays: 0
    },
    learning: {
      vocabularyProgress: {},
      dialogueProgress: {},
      quizHistory: []
    }
  });
};

// 更新最后登录时间
const updateLastLogin = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    'profile.lastLoginAt': serverTimestamp()
  });
};

// 邮箱密码登录
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await updateLastLogin(userCredential.user.uid);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 注册新用户
export const registerUser = async (username: string, email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 更新用户显示名称
    await updateProfile(user, { displayName: username });
    
    // 创建用户文档
    await createUserDocument(user.uid, { username, email });
    
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Google 登录
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // 创建或更新用户文档
    await createUserDocument(user.uid, {
      username: user.displayName || 'Google User',
      email: user.email!,
      photoURL: user.photoURL || undefined
    });
    
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 登出
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 重置密码
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 监听认证状态变化
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
}; 