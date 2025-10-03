"""Quick test to see what's failing"""
import sys
print("Python version:", sys.version)
print("Testing imports...")

try:
    from flask import Flask
    print("[OK] Flask")
except Exception as e:
    print("[FAIL] Flask:", e)

try:
    from flask_cors import CORS
    print("[OK] flask_cors")
except Exception as e:
    print("[FAIL] flask_cors:", e)

try:
    from flask_socketio import SocketIO
    print("[OK] flask_socketio")
except Exception as e:
    print("[FAIL] flask_socketio:", e)

try:
    from faster_whisper import WhisperModel
    print("[OK] faster_whisper")
except Exception as e:
    print("[FAIL] faster_whisper:", e)

try:
    import torch
    print("[OK] torch")
    print("  CUDA available:", torch.cuda.is_available())
except Exception as e:
    print("[FAIL] torch:", e)

try:
    import numpy
    print("[OK] numpy")
except Exception as e:
    print("[FAIL] numpy:", e)

print("\nAll imports successful! Server should work.")
print("Now testing server startup...")

try:
    print("Importing server module...")
    import server
    print("[OK] Server module imported successfully!")
except Exception as e:
    print("[FAIL] Server import failed:", e)
    import traceback
    traceback.print_exc()

