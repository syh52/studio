"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default function TestAIPage() {
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const testFirebaseInit = async () => {
    try {
      setStatus("测试 Firebase 初始化...");
      setError("");
      
      const { firebaseApp } = await import("../../lib/firebase");
      setStatus(prev => prev + "\n✅ Firebase 初始化成功");
      setStatus(prev => prev + `\n- Project ID: ${firebaseApp.options.projectId}`);
      
    } catch (err: any) {
      setError(`Firebase 初始化失败: ${err.message}`);
      console.error(err);
    }
  };

  const testAIInit = async () => {
    try {
      setStatus("测试 AI 初始化...");
      setError("");
      
      const { getAIInstance } = await import("../../lib/firebase");
      const { ai, model } = getAIInstance();
      
      if (ai && model) {
        setStatus(prev => prev + "\n✅ AI 初始化成功");
      } else {
        setStatus(prev => prev + "\n❌ AI 初始化失败：未返回实例");
      }
      
    } catch (err: any) {
      setError(`AI 初始化失败: ${err.message}`);
      console.error("AI 初始化错误详情:", err);
    }
  };

  const testSimpleGeneration = async () => {
    try {
      setStatus("测试简单文本生成...");
      setError("");
      
      const { getAIInstance } = await import("../../lib/firebase");
      const { model } = getAIInstance();
      
      if (!model) {
        throw new Error("AI 模型未初始化");
      }
      
      const result = await model.generateContent("Hello, say hi in Chinese");
      const response = result.response.text();
      
      setStatus(prev => prev + `\n✅ 生成成功: ${response}`);
      
    } catch (err: any) {
      setError(`文本生成失败: ${err.message}`);
      console.error("生成错误详情:", {
        error: err,
        code: err.code,
        message: err.message,
        stack: err.stack,
        response: err.response
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-6">Firebase AI Logic 测试页面</h1>
      
      <div className="space-y-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">测试控制</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={testFirebaseInit}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              1. 测试 Firebase 初始化
            </Button>
            
            <Button 
              onClick={testAIInit}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              2. 测试 AI 初始化
            </Button>
            
            <Button 
              onClick={testSimpleGeneration}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              3. 测试文本生成
            </Button>
          </CardContent>
        </Card>

        {status && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">状态信息</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-green-400 text-sm">
                {status}
              </pre>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="bg-gray-800 border-red-700">
            <CardHeader>
              <CardTitle className="text-red-400">错误信息</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-red-400 text-sm">
                {error}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">调试信息</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-400 text-sm space-y-2">
            <p>打开浏览器控制台（F12）查看详细错误信息</p>
            <p>Firebase 项目: aviation-lexicon-trainer</p>
            <p>检查以下内容：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Firebase AI Logic API 是否已启用</li>
              <li>是否选择了 Gemini Developer API</li>
              <li>API 密钥是否有效</li>
              <li>网络连接是否正常</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 