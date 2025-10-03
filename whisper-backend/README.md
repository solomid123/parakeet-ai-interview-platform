# 🎙️ Whisper Local Transcription Backend

Real-time audio transcription using Whisper with AMD GPU support.

## 🚀 Features

- **AMD GPU Acceleration** via ROCm
- **Real-time transcription** with WebSocket streaming
- **Multiple language support** (English, French, and 90+ languages)
- **Voice Activity Detection** for better accuracy
- **Low latency** processing

## 📋 Prerequisites

### For AMD GPU Support:

1. **AMD GPU** with ROCm support (RX 5000 series or newer recommended)
2. **ROCm** installed (version 5.7 or newer)
3. **Python 3.9+**

### Check AMD GPU:
```bash
rocm-smi
```

## 🔧 Installation

### Step 1: Install ROCm (AMD GPU Drivers)

**Windows:**
```bash
# Download ROCm for Windows from AMD's website
# https://www.amd.com/en/support/linux-drivers
```

**Linux:**
```bash
# Ubuntu/Debian
wget https://repo.radeon.com/amdgpu-install/latest/ubuntu/jammy/amdgpu-install_5.7.50700-1_all.deb
sudo apt install ./amdgpu-install_5.7.50700-1_all.deb
sudo amdgpu-install --usecase=rocm

# Verify installation
rocm-smi
```

### Step 2: Install Python Dependencies

```bash
# Navigate to whisper-backend directory
cd whisper-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install PyTorch with ROCm support (AMD GPU)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.7

# Install other dependencies
pip install -r requirements.txt
```

### Step 3: Install faster-whisper

```bash
pip install faster-whisper
```

## 🎯 Quick Start

### 1. Start the Server

```bash
# Make sure virtual environment is activated
cd whisper-backend
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

### 2. Test the Server

Open browser and visit: `http://localhost:5000/health`

You should see:
```json
{
  "status": "healthy",
  "model": "faster-whisper-base",
  "device": "cuda",
  "gpu_available": true
}
```

## 🎛️ Configuration

### Change Whisper Model

Edit `server.py` line ~39:
```python
model = WhisperModel(
    "base",  # Options: tiny, base, small, medium, large-v2, large-v3
    device=device,
    compute_type=compute_type
)
```

**Model Comparison:**
- `tiny`: Fastest, least accurate (~1GB VRAM)
- `base`: Good balance (recommended) (~1.5GB VRAM)
- `small`: Better accuracy (~2.5GB VRAM)
- `medium`: High accuracy (~5GB VRAM)
- `large-v3`: Best accuracy (~10GB VRAM)

### Fallback to CPU

If AMD GPU is not available, the server automatically falls back to CPU mode.

To force CPU mode, edit `server.py` line ~33:
```python
device = "cpu"  # Force CPU mode
```

## 🧪 Testing

### Test with curl:
```bash
curl http://localhost:5000/health
curl http://localhost:5000/models
```

### Test WebSocket connection:
```javascript
const socket = io('http://localhost:5000');
socket.on('connect', () => console.log('Connected!'));
```

## 🐛 Troubleshooting

### "CUDA not available" or GPU not detected:

1. Check ROCm installation:
```bash
rocm-smi
```

2. Check PyTorch CUDA support:
```python
python -c "import torch; print(torch.cuda.is_available())"
```

3. Reinstall PyTorch with ROCm:
```bash
pip uninstall torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.7
```

### "Module not found" errors:

```bash
pip install -r requirements.txt --upgrade
```

### Port 5000 already in use:

Change port in `server.py` (last line):
```python
socketio.run(app, host='0.0.0.0', port=5001)  # Change to 5001
```

## 📊 Performance

**AMD RX 6800 XT (Example):**
- Model: base
- Latency: ~100-200ms per chunk
- Real-time factor: ~0.3x (3x faster than real-time)

**CPU Mode (8-core Intel i7):**
- Model: base
- Latency: ~500-800ms per chunk
- Real-time factor: ~1.5x

## 🔒 Security Note

This server is configured for local development only (`localhost`). 

For production deployment:
1. Add authentication
2. Use HTTPS
3. Configure proper CORS origins
4. Use production WSGI server (gunicorn)

## 📝 API Endpoints

### HTTP Endpoints

- `GET /health` - Health check
- `GET /models` - List available models

### WebSocket Events

**Client → Server:**
- `start_transcription` - Start transcription session
- `audio_data` - Send audio chunk
- `stop_transcription` - Stop transcription

**Server → Client:**
- `connected` - Connection established
- `transcription_started` - Transcription session started
- `transcription` - Transcription result
- `transcription_stopped` - Session stopped
- `error` - Error message

## 📚 Resources

- [faster-whisper Documentation](https://github.com/guillaumekln/faster-whisper)
- [ROCm Documentation](https://rocm.docs.amd.com/)
- [Whisper Model Details](https://github.com/openai/whisper)

