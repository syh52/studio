@echo off
echo 这是一个测试脚本
echo.
echo 当前目录: %CD%
echo.
echo 正在检查studio目录...
cd /d "%~dp0\studio"
echo 切换后目录: %CD%
echo.

if exist package.json (
    echo 找到了 package.json 文件
) else (
    echo 没有找到 package.json 文件
)

echo.
echo 测试完成！请截图！
echo.
set /p input=请输入任意字符后按回车键关闭: 