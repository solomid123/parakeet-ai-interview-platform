@echo off
REM Fix AMD GPU (DirectML) support for Whisper
REM This script uninstalls incompatible packages and reinstalls with correct versions for Python 3.12

echo ========================================
echo AMD GPU DirectML Fix Script (Python 3.12)
echo ========================================
echo.

echo [Step 1/5] Uninstalling incompatible PyTorch packages...
pip uninstall -y torch torchvision torchaudio torch-directml faster-whisper

echo.
echo [Step 2/5] Installing latest PyTorch (DirectML-compatible for Python 3.12)...
pip install --user torch==2.4.1 torchaudio==2.4.1

echo.
echo [Step 3/5] Installing latest torch-directml for AMD GPU...
pip install --user torch-directml==0.2.5.dev240914

echo.
echo [Step 4/5] Installing OpenAI Whisper...
pip install --user openai-whisper

echo.
echo [Step 5/5] Installing other dependencies...
pip install --user flask==3.0.0 flask-cors==4.0.0 flask-socketio==5.3.5 python-socketio==5.10.0 numpy==2.1.0

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Testing DirectML...
python -c "import torch_directml; print('DirectML device:', torch_directml.device()); print('SUCCESS: AMD GPU is ready!')"
echo.
echo Now run: python server.py
pause

