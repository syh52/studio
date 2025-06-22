'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>系统错误 - Lexicon</title>
      </head>
      <body className="font-inter antialiased bg-gray-900 min-h-screen">
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-4">错误</h1>
            <h2 className="text-2xl text-gray-300 mb-8">出现了一些问题</h2>
            <button
              onClick={() => reset()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
