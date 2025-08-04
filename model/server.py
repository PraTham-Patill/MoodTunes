from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
from deepface import DeepFace
import requests
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS with environment variables
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:8080').split(',')
CORS(app, resources={r"/*": {"origins": allowed_origins}})

# Get API key from environment variable
TMDB_API_KEY = os.getenv('TMDB_API_KEY')

# Emotion-to-genre mapping
GENRE_MAP = {
    "happy": 35,      # Comedy
    "sad": 18,        # Drama
    "angry": 28,      # Action
    "fear": 27,       # Horror
    "surprise": 878,  # Sci-Fi
    "neutral": 10749  # Romance
}

@app.route("/detect-emotion", methods=["POST"])
def detect_emotion():
    try:
        data = request.json["image"].split(",")[1]
        image_bytes = base64.b64decode(data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Use face detector from OpenCV to explicitly check for faces
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            return jsonify({"error": "Face not detected", "emotion": None})
        
        # Only analyze if face is detected
        analysis = DeepFace.analyze(image, actions=["emotion"])
        emotion = analysis[0]["dominant_emotion"]
        print(f"Detected emotion: {emotion}")
        
        return jsonify({"emotion": emotion})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e), "emotion": None})

if __name__ == "__main__":
    print("Server starting...")
    port = int(os.getenv('PORT', 3030))
    app.run(host="0.0.0.0", port=port, debug=os.getenv('FLASK_ENV') == 'development')
    print("Server running")