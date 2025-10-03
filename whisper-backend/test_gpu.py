"""
Test if AMD GPU (DirectML) is working with Whisper
"""
import sys

print("=" * 50)
print("Testing AMD GPU DirectML Setup")
print("=" * 50)

# Test 1: Import torch
try:
    import torch
    print("✓ PyTorch imported successfully")
    print(f"  Version: {torch.__version__}")
except Exception as e:
    print(f"✗ PyTorch import failed: {e}")
    sys.exit(1)

# Test 2: Import torch_directml
try:
    import torch_directml
    print("✓ torch_directml imported successfully")
except Exception as e:
    print(f"✗ torch_directml import failed: {e}")
    print("  This is the DirectML DLL error - needs reinstallation")
    sys.exit(1)

# Test 3: Initialize DirectML device
try:
    dml_device = torch_directml.device()
    print(f"✓ DirectML device initialized: {dml_device}")
except Exception as e:
    print(f"✗ DirectML device initialization failed: {e}")
    sys.exit(1)

# Test 4: Create tensor on GPU
try:
    test_tensor = torch.tensor([1.0, 2.0, 3.0], device=dml_device)
    print(f"✓ Created tensor on GPU: {test_tensor}")
except Exception as e:
    print(f"✗ GPU tensor creation failed: {e}")
    sys.exit(1)

# Test 5: Import Whisper
try:
    import whisper
    print("✓ Whisper imported successfully")
except Exception as e:
    print(f"✗ Whisper import failed: {e}")
    sys.exit(1)

# Test 6: Load Whisper model on GPU
try:
    print("\nLoading Whisper 'tiny' model on GPU...")
    model = whisper.load_model("tiny", device=dml_device)
    print("✓ Whisper model loaded on AMD GPU!")
except Exception as e:
    print(f"✗ Whisper model loading failed: {e}")
    sys.exit(1)

print("\n" + "=" * 50)
print("SUCCESS! AMD GPU is fully working with Whisper!")
print("=" * 50)
print("\nYou can now run: python server.py")

