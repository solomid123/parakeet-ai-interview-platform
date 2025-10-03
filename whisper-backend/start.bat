@echo off
echo ========================================
echo Starting Whisper Transcription Server
echo ========================================
echo.

REM Activate virtual environment
call venv\Scripts\activate

REM Start the server
python server.py

pause

