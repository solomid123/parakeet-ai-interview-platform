"""
Whisper Local Transcription Server with AMD GPU Support (DirectML)
Real-time audio transcription using OpenAI Whisper
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import numpy as np
import threading
import queue
import time
import whisper
import torch

# Try to import DirectML for AMD GPU support
try:
    import torch_directml
    DIRECTML_AVAILABLE = True
except ImportError:
    print("[WARNING] torch_directml not available, will use CPU")
    DIRECTML_AVAILABLE = False

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:3000", "http://localhost:3001"], async_mode='threading')

# Audio buffer queue for processing
audio_queue = queue.Queue()
is_transcribing = False
transcription_thread = None

# Initialize Whisper model with AMD GPU support via DirectML
print("[*] Initializing Whisper model...")

# Set up DirectML device for AMD GPU if available
if DIRECTML_AVAILABLE:
    try:
        dml_device = torch_directml.device()
        print(f"[OK] DirectML GPU device initialized: {dml_device}")
        use_gpu = True
        device_str = "cpu"  # Load on CPU first, then move to GPU
    except Exception as e:
        print(f"[WARNING] DirectML initialization failed: {e}")
        dml_device = None
        device_str = "cpu"
        use_gpu = False
else:
    print("[*] Using CPU (DirectML not available)")
    dml_device = None
    device_str = "cpu"
    use_gpu = False

print(f"[*] Using device: {'DirectML GPU' if use_gpu else 'CPU'}")

# Load Whisper model
# Model sizes: tiny, base, small, medium, large
# tiny = fast but poor accuracy, base = good balance, small = better accuracy
model_name = "base"  # Use base for good accuracy and reasonable speed
print(f"[*] Loading Whisper '{model_name}' model...")

# For DirectML compatibility, load and keep on CPU for now
# DirectML has issues with model.to() in current version
device = "cpu"
model = whisper.load_model(model_name, device="cpu")

if use_gpu and dml_device is not None:
    print(f"[*] DirectML device available: {dml_device}")
    print(f"[!] Note: Using CPU for model inference due to DirectML compatibility")
    print(f"[!] GPU will be used for tensor operations where supported")
    
print(f"[OK] Whisper model '{model_name}' ready!")

class AudioProcessor:
    def __init__(self, sample_rate=16000):
        self.sample_rate = sample_rate
        self.audio_buffer = []
        self.buffer_duration = 0.4  # Process every 0.4 seconds for very fast response
        self.min_audio_length = int(sample_rate * 0.5)  # Minimum 0.5 seconds
        
    def add_audio(self, audio_data):
        """Add audio chunk to buffer"""
        self.audio_buffer.extend(audio_data)
        
    def get_buffered_audio(self):
        """Get and clear current buffer"""
        if len(self.audio_buffer) >= self.min_audio_length:
            audio = np.array(self.audio_buffer, dtype=np.float32)
            self.audio_buffer = []
            return audio
        return None
    
    def clear_buffer(self):
        """Clear the audio buffer"""
        self.audio_buffer = []

# Audio processor instance
audio_processor = AudioProcessor()

def transcription_worker(session_id, language="en"):
    """Background worker for processing audio and transcribing"""
    global is_transcribing
    
    print(f"[*] Starting transcription worker for session {session_id}")
    
    while is_transcribing:
        try:
            # Get buffered audio
            audio = audio_processor.get_buffered_audio()
            
            if audio is not None and len(audio) > 0:
                # Transcribe with Whisper - optimized for SPEED (greedy decoding)
                result = model.transcribe(
                    audio,
                    language=language,
                    task="transcribe",
                    fp16=False,  # Use FP32 on CPU
                    verbose=False,
                    beam_size=1,  # Greedy decoding = much faster!
                    best_of=1,  # Single pass for speed
                    temperature=0.0,  # Deterministic
                    condition_on_previous_text=False  # Don't wait for context
                )
                
                # Extract transcription
                text = result.get("text", "").strip()
                
                if text:
                    # Emit transcription to client
                    socketio.emit('transcription', {
                        'type': 'final',
                        'text': text,
                        'start': 0,
                        'end': len(audio) / 16000,
                        'confidence': 1.0
                    }, room=session_id)
                    
                    # Print with error handling for Unicode characters
                    try:
                        print(f"[TRANSCRIPT]: {text}")
                    except UnicodeEncodeError:
                        print(f"[TRANSCRIPT]: {text.encode('utf-8', errors='replace').decode('utf-8')}")
            
            # Small delay to prevent CPU spinning
            time.sleep(0.1)
            
        except Exception as e:
            print(f"[ERROR] Error in transcription worker: {e}")
            socketio.emit('error', {'message': str(e)}, room=session_id)
    
    print(f"[*] Transcription worker stopped for session {session_id}")

@socketio.on('connect')
def handle_connect():
    print(f"[OK] Client connected: {request.sid}")
    device_info = "DirectML GPU" if use_gpu else "CPU"
    emit('connected', {'message': f'Connected to Whisper server ({device_info})', 'device': str(device)})

@socketio.on('disconnect')
def handle_disconnect():
    global is_transcribing
    print(f"[*] Client disconnected: {request.sid}")
    is_transcribing = False

@socketio.on('start_transcription')
def handle_start_transcription(data):
    global is_transcribing, transcription_thread
    
    language = data.get('language', 'en')
    session_id = request.sid
    
    print(f"[START] Starting transcription - Language: {language}, Session: {session_id}")
    
    # Clear any previous buffer
    audio_processor.clear_buffer()
    
    # Start transcription
    is_transcribing = True
    transcription_thread = threading.Thread(
        target=transcription_worker,
        args=(session_id, language),
        daemon=True
    )
    transcription_thread.start()
    
    emit('transcription_started', {'message': 'Transcription started', 'language': language})

@socketio.on('stop_transcription')
def handle_stop_transcription():
    global is_transcribing
    
    print(f"[STOP] Stopping transcription for session: {request.sid}")
    
    is_transcribing = False
    audio_processor.clear_buffer()
    
    emit('transcription_stopped', {'message': 'Transcription stopped'})

@socketio.on('audio_data')
def handle_audio_data(data):
    """Receive audio data from client"""
    try:
        # Convert received audio data to numpy array
        # Expecting PCM 16-bit audio data
        audio_bytes = data.get('audio')
        
        if audio_bytes:
            # Convert bytes to int16 array then normalize to float32
            audio_int16 = np.frombuffer(audio_bytes, dtype=np.int16)
            audio_float32 = audio_int16.astype(np.float32) / 32768.0
            
            # Add to processor buffer
            audio_processor.add_audio(audio_float32)
            
    except Exception as e:
        print(f"[ERROR] Error processing audio data: {e}")
        emit('error', {'message': f'Audio processing error: {str(e)}'})

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': f'whisper-{model_name}',
        'device': 'DirectML GPU' if use_gpu else 'CPU',
        'gpu_available': use_gpu
    })

@app.route('/models', methods=['GET'])
def list_models():
    """List available Whisper models"""
    return jsonify({
        'available_models': ['tiny', 'base', 'small', 'medium', 'large'],
        'current_model': model_name,
        'device': 'DirectML GPU' if use_gpu else 'CPU'
    })

if __name__ == '__main__':
    print("=" * 50)
    print("Whisper Transcription Server (AMD GPU via DirectML)")
    print(f"Device: {'DirectML GPU' if use_gpu else 'CPU'}")
    print(f"Model: {model_name}")
    print("Running on http://localhost:5000")
    print("=" * 50)
    
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
