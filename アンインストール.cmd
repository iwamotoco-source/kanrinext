@echo off
chcp 65001 >nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Remove-Item 'HKCU:\Software\Classes\kouji' -Recurse -Force -ErrorAction SilentlyContinue; Remove-Item (Join-Path $env:LOCALAPPDATA 'OdakyuFolderNavigator') -Recurse -Force -ErrorAction SilentlyContinue; Write-Host 'アンインストール完了'; Read-Host 'Enterキーで閉じる'"
