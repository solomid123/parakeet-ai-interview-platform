# 🚀 Quick Start: Whisper Local Transcription

Get Whisper transcription running in 5 minutes!

## ⚡ Quick Setup

### 1. Install Python Backend (5 minutes)

```bash
# Navigate to whisper-backend
cd whisper-backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install PyTorch with AMD GPU support
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.7

# Install dependencies
pip install -r requirements.txt
```

### 2. Start Both Servers

**Terminal 1 - Whisper Backend:**
```bash
cd whisper-backend
# Windows:
start.bat
# Linux/Mac:
chmod +x start.sh
./start.sh
```

**Terminal 2 - Next.js Frontend:**
```bash
npm run dev
```

### 3. Use It!

1. Go to `http://localhost:3000`
2. Start an interview session
3. In the transcript panel, toggle the switch from `☁️ Cloud` to `🎙️ Local`
4. Click "Connect"
5. You should see "🎙️ Whisper (Local GPU) • Connected"

## ✅ Verify It's Working

You should see in the Python terminal:
```
🚀 Initializing Whisper model...
🎮 AMD GPU Available: True
🔧 Using device: cuda
✅ Whisper model loaded successfully!
🌐 Running on http://localhost:5000
```

## 🆘 Quick Troubleshooting

**Python server won't start?**
```bash
pip install flask flask-cors flask-socketio faster-whisper numpy
```

**No GPU detected?**
- Server will automatically use CPU (slower but works!)
- Install AMD ROCm drivers for GPU support

**Connection errors?**
- Make sure both servers are running
- Check if port 5000 is available
- Refresh the browser page

## 📚 Full Documentation

For detailed setup, troubleshooting, and configuration:
- See `WHISPER_SETUP_GUIDE.md`
- See `whisper-backend/README.md`

## 🎯 Features

- ✅ Free (no API costs!)
- ✅ Fast with AMD GPU
- ✅ Works offline
- ✅ 90+ languages supported
- ✅ Easy toggle between cloud and local

Enjoy your local transcription! 🎙️

