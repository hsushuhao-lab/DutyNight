@echo off
chcp 65001 >nul
echo ======================================================================
echo   松德值班夜：與避無可避的傳說 (Songde Night Duty) - Act 1 Prototype
echo   正在啟動本地 3D 體驗伺服器...
echo ======================================================================
start http://localhost:5173
npm run dev
