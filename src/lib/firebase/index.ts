// 导出所有 Firebase 服务和功能

// 配置和核心服务
export { auth, db, storage, analytics } from './config';

// 认证功能
export {
  loginWithEmail,
  registerUser,
  loginWithGoogle,
  logout,
  resetPassword,
  onAuthChange,
  type UserData
} from './auth';

// 数据迁移
export {
  migrateLocalDataToFirebase,
  exportLocalData
} from './migration';

// 数据同步
export {
  enableOfflineSupport,
  getNetworkStatus,
  batchUpdateVocabularyProgress,
  batchUpdateDialogueProgress,
  syncQueue
} from './sync'; 