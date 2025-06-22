"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LexiconAIService, type AIResponse } from '@/lib/ai-service';
import { Loader2, Sparkles, MessageSquare, BookOpen, Calendar, Send, Trash2, UserCircle, Bot } from 'lucide-react';
import { vocabularyPacks, type VocabularyItem, type Dialogue } from '@/lib/data';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  className?: string;
}

export default function AIAssistant({ className }: AIAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  
  // 多轮对话状态
  const [chatMode, setChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, streamingMessage]);

  const handleVocabularyTip = async () => {
    setLoading(true);
    setResponse('');
    
    // 随机选择一个词汇进行演示
    const randomPack = vocabularyPacks[Math.floor(Math.random() * vocabularyPacks.length)];
    const randomVocab = randomPack.items[Math.floor(Math.random() * randomPack.items.length)];
    
    const result: AIResponse = await LexiconAIService.generateVocabularyTip(randomVocab);
    
    if (result.success && result.data) {
      setResponse(`📚 词汇: ${randomVocab.english} (${randomVocab.chinese})\n\n${result.data}`);
    } else {
      setResponse(`❌ 生成失败: ${result.error}`);
    }
    
    setLoading(false);
  };

  const handleDialogueQuestions = async () => {
    setLoading(true);
    setResponse('');
    
    // 模拟对话数据 - 实际使用时从dialogues数组中选择
    const mockDialogue: Dialogue = {
      id: "demo",
      title: "旅客吸烟事件处理",
      description: "安全员处理旅客违规吸烟行为",
      lines: [
        { id: "1", speaker: "Security Officer", english: "I'm the security officer of this flight.", chinese: "我是本次航班的安全员。" },
        { id: "2", speaker: "Passenger", english: "I'm sorry, yes I did smoke.", chinese: "是的，我很抱歉，我确实吸烟了。" },
        { id: "3", speaker: "Security Officer", english: "Smoking is a serious threat to flight safety.", chinese: "吸烟是严重威胁飞行安全的。" }
      ]
    };
    
    const result: AIResponse = await LexiconAIService.generateDialogueQuestions(mockDialogue);
    
    if (result.success && result.data) {
      setResponse(`🎯 对话场景: ${mockDialogue.title}\n\n${result.data}`);
    } else {
      setResponse(`❌ 生成失败: ${result.error}`);
    }
    
    setLoading(false);
  };

  const handleStudyPlan = async () => {
    setLoading(true);
    setResponse('');
    
    const result: AIResponse = await LexiconAIService.generateStudyPlan(
      "初级", 
      "航空安全执勤"
    );
    
    if (result.success && result.data) {
      setResponse(`📅 个性化学习计划:\n\n${result.data}`);
    } else {
      setResponse(`❌ 生成失败: ${result.error}`);
    }
    
    setLoading(false);
  };

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim()) return;
    
    setLoading(true);
    setResponse('');
    
    const result: AIResponse = await LexiconAIService.generateText(
      `作为航空英语学习助手，请回答以下问题：\n\n${customPrompt}`
    );
    
    if (result.success && result.data) {
      setResponse(result.data);
    } else {
      setResponse(`❌ 生成失败: ${result.error}`);
    }
    
    setLoading(false);
  };

  // 启动多轮对话
  const startChat = () => {
    setChatMode(true);
    // 不预先添加AI消息，让用户首先发言
    setChatMessages([]);
  };

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
    setStreamingMessage('');

    try {
      // 简单构建对话历史
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

      // 调试：打印对话历史角色序列
      const roleSequence = conversationHistory.map(msg => msg.role).join(' -> ');
      console.log('角色序列:', roleSequence);

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
      setStreamingMessage('');
    }
  };

  // 清空对话历史
  const clearChat = () => {
    setChatMessages([]);
    setChatMode(false);
  };

  // 退出聊天模式
  const exitChat = () => {
    setChatMode(false);
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-purple-400" />
            AI 学习助手
          </CardTitle>
          <CardDescription className="text-gray-400">
            使用 Firebase AI Logic SDK 为您提供个性化的航空英语学习建议
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!chatMode ? (
            <>
              {/* 快速功能按钮 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={handleVocabularyTip}
                  disabled={loading}
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2 text-left bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 text-white"
                >
                  <BookOpen className="h-5 w-5 text-purple-400" />
                  <div>
                    <div className="font-medium">词汇学习建议</div>
                    <div className="text-xs text-gray-400">获取记忆技巧</div>
                  </div>
                </Button>

                <Button
                  onClick={handleDialogueQuestions}
                  disabled={loading}
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2 text-left bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-white"
                >
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="font-medium">对话练习题</div>
                    <div className="text-xs text-gray-400">生成测试问题</div>
                  </div>
                </Button>

                <Button
                  onClick={handleStudyPlan}
                  disabled={loading}
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2 text-left bg-green-500/10 border-green-500/30 hover:bg-green-500/20 text-white"
                >
                  <Calendar className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="font-medium">学习计划</div>
                    <div className="text-xs text-gray-400">个性化规划</div>
                  </div>
                </Button>
              </div>

              {/* 多轮对话按钮 */}
              <div className="flex justify-center">
                <Button
                  onClick={startChat}
                  disabled={loading}
                  className="w-full max-w-md gradient-primary text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  开始智能对话
                </Button>
              </div>

              {/* 自定义提问 */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white">自定义问题</label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="请输入您想了解的航空英语学习问题..."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 resize-none"
                  rows={3}
                />
                <Button
                  onClick={handleCustomPrompt}
                  disabled={loading || !customPrompt.trim()}
                  className="w-full gradient-primary text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      AI 思考中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      获取 AI 建议
                    </>
                  )}
                </Button>
              </div>

              {/* 响应展示区域 */}
              {response && (
                <Card className="bg-gray-800/30 border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-white">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      AI 回复
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                        Gemini 2.5 Flash
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                        <span className="ml-2 text-gray-400">AI 正在生成回答...</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed">
                        {response}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* 多轮对话模式 */
            <div className="space-y-4">
              {/* 对话历史 */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2 text-white">
                      <MessageSquare className="h-4 w-4 text-green-400" />
                      智能对话
                      <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                        多轮对话
                      </Badge>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={clearChat}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={exitChat}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        退出
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 w-full pr-4">
                    <div className="space-y-4">
                      {chatMessages.length === 0 ? (
                        // 欢迎提示
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center space-y-4 py-8">
                            <div className="p-4 rounded-full bg-purple-500/20 w-fit mx-auto">
                              <Bot className="h-8 w-8 text-purple-400" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-lg font-medium text-white">
                                航空英语学习助手
                              </h3>
                              <p className="text-gray-400 text-sm max-w-md">
                                我可以帮助你：
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 max-w-md">
                                <div>🗣️ 练习口语对话</div>
                                <div>📚 解答词汇问题</div>
                                <div>🎯 模拟工作场景</div>
                                <div>📝 提供学习建议</div>
                              </div>
                              <p className="text-sm text-purple-300 mt-4">
                                输入你的问题开始对话吧！
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // 对话消息
                        <>
                          {chatMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex items-start gap-3 ${
                                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                              }`}
                            >
                              <div className={`p-2 rounded-full ${
                                message.role === 'user' 
                                  ? 'bg-blue-500/20' 
                                  : 'bg-purple-500/20'
                              }`}>
                                {message.role === 'user' ? (
                                  <UserCircle className="h-4 w-4 text-blue-400" />
                                ) : (
                                  <Bot className="h-4 w-4 text-purple-400" />
                                )}
                              </div>
                              <div className={`max-w-[80%] p-3 rounded-lg ${
                                message.role === 'user'
                                  ? 'bg-blue-500/10 border border-blue-500/20 text-blue-100'
                                  : 'bg-gray-800/50 border border-gray-600 text-gray-200'
                              }`}>
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                  {message.content}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {message.timestamp.toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      
                      {/* 流式消息显示 */}
                      {isStreaming && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-purple-500/20">
                            <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                          </div>
                          <div className="max-w-[80%] p-3 rounded-lg bg-gray-800/50 border border-gray-600 text-gray-200">
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {streamingMessage || 'AI 正在思考...'}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={chatEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* 消息输入 */}
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入您的问题或对话内容..."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 resize-none"
                  rows={2}
                  disabled={isStreaming}
                />
                <Button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || isStreaming}
                  className="gradient-primary text-white px-4"
                >
                  {isStreaming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* 功能说明 */}
          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-sm font-medium text-white mb-2">AI 功能特色</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              <div>✨ 个性化词汇建议</div>
              <div>🎯 智能练习生成</div>
              <div>📚 学习计划制定</div>
              <div>💬 多轮对话支持</div>
              <div>🖼️ 多模态输入</div>
              <div>⚡ 流式响应输出</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 