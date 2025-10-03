@echo off
cd /d "%~dp0"
echo Starting Whisper Server with AMD GPU support...
python server.py
pause

