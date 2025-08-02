from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os

from app import SimpleTextExtractor  # Import your class

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

API_KEY = "AIzaSyCU3nUZyD7UXbin4yBr9c7YaAQCPC_Xhjo"  # Replace with your actual key

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    extractor = SimpleTextExtractor(API_KEY)
    all_text = extractor.extract_all_text(filepath)  # <-- uses uploaded file path
    patient_name = extractor.find_specific_info(all_text, "patient name")
    medication = extractor.find_specific_info(all_text, "medication name and strength")
    doctor = extractor.find_specific_info(all_text, "doctor's name")
    instructions = extractor.find_specific_info(all_text, "how to use this medication")

    result = {
        "full_text": all_text,
        "patient_name": patient_name,
        "medication": medication,
        "doctor": doctor,
        "expiry": expiry,
        "instructions": instructions
    }
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)