'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

export default function TestFirestore() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState<any[]>([]);

  // 测试写入数据
  const testWrite = async () => {
    setLoading(true);
    setStatus('正在测试写入数据...');
    
    try {
      // 测试添加文档到collection
      const testCollection = collection(db, 'test');
      const docRef = await addDoc(testCollection, {
        message: '这是一个测试消息',
        timestamp: new Date(),
        testId: Math.random().toString(36).substr(2, 9)
      });
      
      setStatus(`✅ 写入成功！文档ID: ${docRef.id}`);
    } catch (error: any) {
      setStatus(`❌ 写入失败: ${error.message}`);
      console.error('写入错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 测试读取数据
  const testRead = async () => {
    setLoading(true);
    setStatus('正在测试读取数据...');
    
    try {
      const testCollection = collection(db, 'test');
      const querySnapshot = await getDocs(testCollection);
      const data: any[] = [];
      
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setTestData(data);
      setStatus(`✅ 读取成功！找到 ${data.length} 条记录`);
    } catch (error: any) {
      setStatus(`❌ 读取失败: ${error.message}`);
      console.error('读取错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 测试特定文档操作
  const testDocOperation = async () => {
    setLoading(true);
    setStatus('正在测试文档操作...');
    
    try {
      // 写入特定文档
      const docRef = doc(db, 'test', 'specific-test-doc');
      await setDoc(docRef, {
        name: 'Firestore测试',
        description: '这是一个特定的测试文档',
        created: new Date(),
        version: '1.0'
      });
      
      // 读取特定文档
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setStatus(`✅ 文档操作成功！数据: ${JSON.stringify(docSnap.data())}`);
      } else {
        setStatus('❌ 文档不存在');
      }
    } catch (error: any) {
      setStatus(`❌ 文档操作失败: ${error.message}`);
      console.error('文档操作错误:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Firestore 数据库连接测试</h1>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">数据库连接测试</h2>
          
          <div className="space-y-4">
            <button
              onClick={testWrite}
              disabled={loading}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '测试中...' : '测试写入数据'}
            </button>
            
            <button
              onClick={testRead}
              disabled={loading}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? '测试中...' : '测试读取数据'}
            </button>
            
            <button
              onClick={testDocOperation}
              disabled={loading}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? '测试中...' : '测试文档操作'}
            </button>
          </div>
          
          {status && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p className="text-sm">{status}</p>
            </div>
          )}
        </div>
        
        {testData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">测试数据 ({testData.length} 条)</h3>
            <div className="space-y-2">
              {testData.map((item, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                  <p><strong>ID:</strong> {item.id}</p>
                  <p><strong>消息:</strong> {item.message}</p>
                  <p><strong>时间:</strong> {item.timestamp?.toDate?.()?.toLocaleString() || '无'}</p>
                  <p><strong>测试ID:</strong> {item.testId}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">说明</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 这个页面用于测试Firestore数据库连接</li>
            <li>• 测试写入：向'test'集合添加新文档</li>
            <li>• 测试读取：从'test'集合读取所有文档</li>
            <li>• 测试文档操作：创建和读取特定文档</li>
            <li>• 请检查Firebase控制台查看数据变化</li>
          </ul>
        </div>
        
        <div className="text-center">
          <a 
            href="/"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  );
} 