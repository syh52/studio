export default function TestRoutePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">测试路由页面</h1>
        <p className="text-gray-300">如果您能看到这个页面，说明路由正常工作</p>
        <div className="mt-8 space-y-4">
          <a href="/" className="block text-blue-400 hover:underline">使用a标签返回首页</a>
          <a href="/profile" className="block text-blue-400 hover:underline">使用a标签访问Profile</a>
          <a href="/vocabulary" className="block text-blue-400 hover:underline">使用a标签访问词汇</a>
        </div>
      </div>
    </div>
  );
} 