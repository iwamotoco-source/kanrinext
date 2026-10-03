@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist .venv (
  echo 初回セットアップ中...（数分かかります）
  py -3.10 -m venv .venv || (echo Python 3.10 が見つかりません & pause & exit /b 1)
  call .venv\Scripts\activate
  python -m pip install -U pip
  pip install -r requirements.txt
) else (
  call .venv\Scripts\activate
)
python server.py %*
pause
