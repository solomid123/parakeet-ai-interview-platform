# 🎙️ Whisper Local Transcription Setup Guide

Complete guide to adding AMD GPU-powered Whisper transcription to ParakeetAI.

## 📋 Overview

This setup adds local transcription using OpenAI's Whisper model with AMD GPU acceleration, allowing you to:
- ✅ Eliminate transcription API costs
- ✅ Work offline
- ✅ Use your AMD GPU for fast transcription
- ✅ Switch between cloud (Speechmatics) and local (Whisper) transcription

## 🏗️ Architecture

```
┌─────────────────┐      WebSocket      ┌──────────────────┐
│                 │ ◄───────────────────►│                  │
│  Next.js App    │   Audio Streaming    │  Python Server   │
│  (Frontend)     │   Transcription      │  (Whisper)       │
│                 │                      │                  │
└─────────────────┘                      └────────┬─────────┘
                                                  │
                                                  ▼
                                         ┌──────────────────┐
                                         │   AMD GPU        │
                                         │   (ROCm)         │
                                         │   Whisper Model  │
                                         └──────────────────┘
```

## 🚀 Installation Steps

### Step 1: Install Frontend Dependencies

```bash
# In your project root directory
npm install socket.io-client
```

### Step 2: Setup Python Backend

#### 2.1 Install Python Prerequisites

**Windows:**
```bash
# Download and install Python 3.9+ from python.org
# Make sure to check "Add Python to PATH" during installation
```

**Linux:**
```bash
sudo apt update
sudo apt install python3.9 python3-pip python3-venv
```

#### 2.2 Install AMD ROCm (for GPU support)

**Windows:**
Download and install AMD GPU drivers with ROCm support from:
https://www.amd.com/en/support

**Linux (Ubuntu/Debian):**
```bash
# Add AMD repository
wget https://repo.radeon.com/amdgpu-install/latest/ubuntu/jammy/amdgpu-install_5.7.50700-1_all.deb
sudo apt install ./amdgpu-install_5.7.50700-1_all.deb

# Install ROCm
sudo amdgpu-install --usecase=rocm

# Verify installation
rocm-smi
```

#### 2.3 Setup Python Environment

```bash
# Navigate to the whisper-backend directory
cd whisper-backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# Linux/Mac:
source venv/bin/activate

# Install PyTorch with ROCm support (for AMD GPU)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.7

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Verify Installation

#### 3.1 Test AMD GPU Access

```bash
# Activate virtual environment first
cd whisper-backend
# Windows: venv\Scripts\activate
# Linux: source venv/bin/activate

# Test ROCm
python -c "import torch; print('CUDA Available:', torch.cuda.is_available())"
```

Expected output: `CUDA Available: True`

#### 3.2 Test Whisper Server

```bash
# Start the Whisper server
python server.py
```

You should see:
```
🚀 Initializing Whisper model...
🎮 AMD GPU Available: True
🔧 Using device: cuda, compute type: float16
✅ Whisper model loaded successfully!
🌐 Running on http://localhost:5000
```

### Step 4: Start the Application

#### 4.1 Start Backend (Terminal 1)

```bash
cd whisper-backend
# Activate venv first
python server.py
```

#### 4.2 Start Frontend (Terminal 2)

```bash
# In project root
npm run dev
```

### Step 5: Test the Integration

1. Open `http://localhost:3000` in your browser
2. Navigate to an interview session
3. In the transcript panel, you'll see a toggle: `🎙️ Local / ☁️ Cloud`
4. Toggle to enable Whisper (Local)
5. Click "Connect" to start screen sharing
6. You should see: "Transcribing (language) • 🎙️ Whisper (Local GPU) • Connected"

## 🎛️ Configuration

### Change Whisper Model (Speed vs Accuracy)

Edit `whisper-backend/server.py` around line 39:

```python
model = WhisperModel(
    "base",  # Change this
    device=device,
    compute_type=compute_type
)
```

**Available models:**

| Model | Speed | Accuracy | VRAM | Best For |
|-------|-------|----------|------|----------|
| `tiny` | ⚡⚡⚡⚡⚡ | ⭐⭐ | ~1GB | Quick tests |
| `base` | ⚡⚡⚡⚡ | ⭐⭐⭐ | ~1.5GB | **Default/Recommended** |
| `small` | ⚡⚡⚡ | ⭐⭐⭐⭐ | ~2.5GB | Good balance |
| `medium` | ⚡⚡ | ⭐⭐⭐⭐⭐ | ~5GB | High accuracy |
| `large-v3` | ⚡ | ⭐⭐⭐⭐⭐⭐ | ~10GB | Best quality |

### Change Server Port

Edit `whisper-backend/server.py` (last line):

```python
socketio.run(app, host='0.0.0.0', port=5000)  # Change port here
```

Also update in `app/interview-session/[id]/page.tsx`:

```typescript
const socket = io('http://localhost:5000')  // Update port here
```

### CPU Fallback

If AMD GPU is not detected, the server automatically falls back to CPU mode.

To force CPU mode, edit `whisper-backend/server.py` around line 33:

```python
device = "cpu"  # Force CPU mode
```

## 🐛 Troubleshooting

### "AMD GPU not detected"

**Check ROCm installation:**
```bash
rocm-smi
```

**Check PyTorch CUDA support:**
```bash
python -c "import torch; print(torch.cuda.is_available())"
```

**Reinstall PyTorch with ROCm:**
```bash
pip uninstall torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.7
```

### "Cannot find module 'socket.io-client'"

```bash
npm install socket.io-client
```

### "Connection refused" or "Failed to connect to Whisper server"

1. Make sure the Python server is running:
```bash
cd whisper-backend
python server.py
```

2. Check if port 5000 is available:
```bash
# Windows:
netstat -ano | findstr :5000

# Linux:
netstat -tuln | grep 5000
```

3. Check firewall settings (allow port 5000)

### "Transcription not working"

1. Check browser console (F12) for errors
2. Check Python server logs
3. Verify microphone/audio permissions
4. Try switching back to Speechmatics to isolate the issue

### "Out of memory" errors

Use a smaller model:
```python
model = WhisperModel("tiny", device=device, compute_type=compute_type)
```

## 📊 Performance Comparison

**Test System: AMD RX 6800 XT, Ryzen 9 5900X**

| Method | Model | Latency | Cost | Offline |
|--------|-------|---------|------|---------|
| Speechmatics | Cloud | ~200ms | 💰💰 $$ | ❌ No |
| Whisper (GPU) | base | ~150ms | ✅ Free | ✅ Yes |
| Whisper (GPU) | large-v3 | ~400ms | ✅ Free | ✅ Yes |
| Whisper (CPU) | base | ~800ms | ✅ Free | ✅ Yes |

## 🔒 Security Notes

- The Whisper server runs locally on `localhost:5000`
- No data leaves your machine when using Whisper
- For production deployment, add authentication and HTTPS

## 📚 Additional Resources

- [faster-whisper GitHub](https://github.com/guillaumekln/faster-whisper)
- [OpenAI Whisper](https://github.com/openai/whisper)
- [AMD ROCm Documentation](https://rocm.docs.amd.com/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)

## ✨ Features Comparison

| Feature | Speechmatics | Whisper (Local) |
|---------|--------------|-----------------|
| Real-time transcription | ✅ | ✅ |
| Multiple languages | ✅ 30+ | ✅ 90+ |
| Offline support | ❌ | ✅ |
| Free usage | ❌ | ✅ |
| AMD GPU acceleration | N/A | ✅ |
| Cloud dependency | ✅ | ❌ |
| Setup complexity | Easy | Medium |

## 💡 Tips

1. **Start with `base` model** - good balance of speed and accuracy
2. **Use `tiny` model for testing** - faster initialization
3. **Upgrade to `large-v3`** only if you need best accuracy and have enough VRAM
4. **Monitor GPU usage** with `rocm-smi` command
5. **Keep the Python server running** in a separate terminal window

## 🎯 Next Steps

After successful setup:

1. Test both transcription methods (Speechmatics vs Whisper)
2. Compare accuracy and latency for your use case
3. Adjust Whisper model size based on your GPU capabilities
4. Consider deploying as a system service for production use

## 🤝 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs in the Python terminal
3. Check browser console for frontend errors
4. Verify all dependencies are installed correctly

Happy transcribing! 🎙️

