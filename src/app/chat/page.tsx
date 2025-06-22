"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { ScrollArea } from '../../components/ui/scroll-area';
import { LexiconAIService } from '../../lib/ai-service';
import { KnowledgeBase } from '../../lib/knowledge-base';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Loader2, 
  Send, 
  Bot, 
  UserCircle, 
  ArrowLeft,
  RotateCcw,
  MessageSquare,
  Brain,
  ExternalLink,
  Cloud,
  CloudOff
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

interface FirestoreChatSession {
  messages: {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: Timestamp;
  }[];
  lastUpdated: Timestamp;
  userId: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [knowledgeCount, setKnowledgeCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<'success' | 'error' | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 保存对话历史到 Firestore
  const saveChatHistory = async (messages: ChatMessage[]) => {
    if (!isAuthenticated || !user?.id || messages.length === 0) return;
    
    try {
      setIsSyncing(true);
      const chatDocRef = doc(db, 'chatSessions', user.id);
      
      const firestoreMessages = messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: Timestamp.fromDate(msg.timestamp)
      }));

      const chatSession: FirestoreChatSession = {
        messages: firestoreMessages,
        lastUpdated: serverTimestamp() as Timestamp,
        userId: user.id
      };

      await setDoc(chatDocRef, chatSession);
      setLastSyncStatus('success');
    } catch (error) {
      console.error('保存对话历史到云端失败:', error);
      setLastSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  // 从 Firestore 加载对话历史
  const loadChatHistory = async (): Promise<ChatMessage[]> => {
    if (!isAuthenticated || !user?.id) return [];
    
    try {
      const chatDocRef = doc(db, 'chatSessions', user.id);
      const chatDoc = await getDoc(chatDocRef);
      
      if (!chatDoc.exists()) return [];
      
      const data = chatDoc.data() as FirestoreChatSession;
      const messages = data.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toDate()
      }));
      
      return messages;
    } catch (error) {
      console.error('从云端加载对话历史失败:', error);
      return [];
    }
  };

  // 清除对话历史
  const clearChatHistory = async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      setIsSyncing(true);
      const chatDocRef = doc(db, 'chatSessions', user.id);
      await deleteDoc(chatDocRef);
      setLastSyncStatus('success');
    } catch (error) {
      console.error('清除云端对话历史失败:', error);
      setLastSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  // 页面加载时从云端恢复对话历史
  useEffect(() => {
    const loadHistory = async () => {
      if (isAuthenticated && user) {
        const savedHistory = await loadChatHistory();
        if (savedHistory.length > 0) {
          setChatMessages(savedHistory);
        }
      }
    };
    
    loadHistory();
  }, [isAuthenticated, user]);

  // 当对话消息变化时保存到云端
  useEffect(() => {
    const saveHistory = async () => {
      if (chatMessages.length > 0 && isAuthenticated && user) {
        await saveChatHistory(chatMessages);
      }
    };
    
    saveHistory();
  }, [chatMessages, isAuthenticated, user]);

  // 自动滚动到底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 页面加载时自动聚焦到输入框
  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 获取知识库信息
  useEffect(() => {
    const loadKnowledgeCount = async () => {
      try {
        // 首先尝试从本地缓存获取
        const syncKnowledge = KnowledgeBase.getAllKnowledgeSync().filter(item => item.importance === 'high');
        setKnowledgeCount(syncKnowledge.length);
        
        // 如果本地没有数据，则初始化知识库
        if (syncKnowledge.length === 0) {
          await KnowledgeBase.initialize();
          const allKnowledge = await KnowledgeBase.getAllKnowledge();
          const highImportanceKnowledge = allKnowledge.filter(item => item.importance === 'high');
          setKnowledgeCount(highImportanceKnowledge.length);
        }
      } catch (error) {
        console.error('加载知识库失败:', error);
        // 保持使用本地缓存的结果
      }
    };
    
    loadKnowledgeCount();
  }, []);

  // 发送聊天消息
  const sendChatMessage = async () => {
    if (!chatInput.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsStreaming(true);

    try {
      // 构建对话历史
      const conversationHistory: Array<{
        role: 'user' | 'model';
        parts: Array<{ text: string }>;
      }> = [];

      // 如果是第一条消息，添加系统设定
      if (chatMessages.length === 0) {
        conversationHistory.push({
          role: 'user',
          parts: [{ text: `你是一个专业的航空英语学习助手。请用中文回答，内容要准确、实用，适合航空安全员学习。现在用户问你：${userMessage.content}` }]
        });
      } else {
        // 添加所有历史消息
        chatMessages.forEach(msg => {
          conversationHistory.push({
            role: msg.role,
            parts: [{ text: msg.content }]
          });
        });
        
        // 添加当前用户消息
        conversationHistory.push({
          role: 'user',
          parts: [{ text: userMessage.content }]
        });
      }

      // 使用多轮对话API
      const result = await LexiconAIService.generateChatResponse(conversationHistory);
      
      if (result.success && result.data) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: result.data,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: `抱歉，我遇到了一些问题：${result.error}`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: '抱歉，发生了意外错误，请稍后重试。',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
    }
  };

  // 清空对话历史
  const clearChat = async () => {
    if (chatMessages.length > 0) {
      const confirmed = window.confirm('确定要清空所有对话记录吗？这将删除云端保存的历史记录。');
      if (!confirmed) return;
    }
    setChatMessages([]);
    await clearChatHistory(); // 同时清除云端存储
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  // 返回上一页
  const goBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* 顶部导航栏 - 手机友好 */}
      <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <Button
            onClick={goBack}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 p-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-purple-500/20">
              <MessageSquare className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">智能对话</h1>
              <p className="text-xs text-gray-400">
                航空英语学习助手
                {isAuthenticated && chatMessages.length > 0 && (
                  <span className="ml-2 flex items-center gap-1">
                    {isSyncing ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-yellow-400" />
                        <span className="text-yellow-400">同步中</span>
                      </>
                    ) : lastSyncStatus === 'success' ? (
                      <>
                        <Cloud className="h-3 w-3 text-green-400" />
                        <span className="text-green-400">已同步</span>
                      </>
                    ) : lastSyncStatus === 'error' ? (
                      <>
                        <CloudOff className="h-3 w-3 text-red-400" />
                        <span className="text-red-400">同步失败</span>
                      </>
                    ) : (
                      <>
                        <Cloud className="h-3 w-3 text-green-400" />
                        <span className="text-green-400">云端保存</span>
                      </>
                    )}
                  </span>
                )}
                {!isAuthenticated && chatMessages.length > 0 && (
                  <span className="ml-2 text-yellow-400">• 需要登录才能云端保存</span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 知识库状态指示器 */}
          <Button
            onClick={() => router.push('/knowledge')}
            variant="ghost"
            size="sm"
            className="text-green-400 hover:text-green-300 hover:bg-green-500/10 flex items-center gap-1"
            title="点击管理知识库"
          >
            <Brain className="h-4 w-4" />
            <span className="text-xs">{knowledgeCount}</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
          
          {chatMessages.length > 0 && (
            <Button
              onClick={clearChat}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 聊天区域 */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 px-4">
          <div className="py-4 space-y-4">
            {chatMessages.length === 0 ? (
              // 欢迎界面 - 手机优化
              <div className="flex items-center justify-center h-full min-h-[60vh]">
                <div className="text-center space-y-6 max-w-sm px-4">
                  <div className="p-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 w-fit mx-auto">
                    <Bot className="h-12 w-12 text-purple-400" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-white">
                      航空英语学习助手
                    </h2>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      我是您的专业航空英语学习伙伴，可以帮助您：
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-lg mb-1">🗣️</div>
                        <div className="text-gray-300">练习对话</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-lg mb-1">📚</div>
                        <div className="text-gray-300">学习词汇</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-lg mb-1">🎯</div>
                        <div className="text-gray-300">模拟场景</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-lg mb-1">📝</div>
                        <div className="text-gray-300">答疑解惑</div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-center gap-2 text-green-300 text-xs">
                        <Brain className="h-3 w-3" />
                        <span>已载入 {knowledgeCount} 条专业知识</span>
                      </div>
                      <div className="text-center text-xs text-gray-400">
                        {isAuthenticated ? (
                          <span className="flex items-center justify-center gap-1">
                            <Cloud className="h-3 w-3" />
                            对话历史云端同步，跨设备访问
                          </span>
                        ) : (
                          <span className="text-yellow-400">
                            💡 登录后可云端保存对话历史
                          </span>
                        )}
                      </div>
                      <p className="text-purple-300 text-sm font-medium">
                        开始输入您的问题吧！
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // 对话消息列表
              <>
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* 头像 */}
                    <div className={`flex-shrink-0 p-2 rounded-full ${
                      message.role === 'user' 
                        ? 'bg-blue-500/20' 
                        : 'bg-purple-500/20'
                    }`}>
                      {message.role === 'user' ? (
                        <UserCircle className="h-5 w-5 text-blue-400" />
                      ) : (
                        <Bot className="h-5 w-5 text-purple-400" />
                      )}
                    </div>
                    
                    {/* 消息内容 */}
                    <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-500/15 border border-blue-500/20 text-blue-100 rounded-br-md'
                        : 'bg-white/5 border border-white/10 text-gray-100 rounded-bl-md'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {/* AI 思考状态 */}
            {isStreaming && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 rounded-full bg-purple-500/20">
                  <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
                </div>
                <div className="max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl rounded-bl-md bg-white/5 border border-white/10 text-gray-100">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>AI 正在思考...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>

        {/* 输入区域 - 固定在底部，手机优化 */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm p-4">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <Textarea
              ref={textareaRef}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={chatMessages.length === 0 ? "试试问：如何用英语处理紧急情况？" : "输入您的问题..."}
              className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-gray-400 resize-none min-h-[44px] max-h-32 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              rows={1}
              disabled={isStreaming}
              style={{
                height: 'auto',
                minHeight: '44px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
              }}
            />
            <Button
              onClick={sendChatMessage}
              disabled={!chatInput.trim() || isStreaming}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl px-4 h-11 flex-shrink-0"
            >
              {isStreaming ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {/* 底部提示 - 仅在空白状态显示 */}
          {chatMessages.length === 0 && (
            <div className="text-center mt-3">
              <p className="text-xs text-gray-500">
                按 Enter 发送，Shift + Enter 换行
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 