#!/bin/bash

echo "========================================"
echo "Starting Whisper Transcription Server"
echo "========================================"
echo ""

# Activate virtual environment
source venv/bin/activate

# Start the server
python server.py

