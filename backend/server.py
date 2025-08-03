from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import json

from app import SimpleTextExtractor  # Import your class

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['SUMMARIES_FOLDER'] = 'summaries'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['SUMMARIES_FOLDER'], exist_ok=True)

API_KEY = "AIzaSyCdopVKYikqDhRq-21uSeR-hDYHdLgs7uM"  # Replace with your actual key

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    session_id = request.form.get('sessionId')
    if not session_id:
        return jsonify({'error': 'No sessionId provided'}), 400

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
        "instructions": instructions
    }

    # Store the extracted data in user_data.json
    user_data_path = 'user_data.json'
    try:
        if os.path.exists(user_data_path):
            with open(user_data_path, 'r') as f:
                user_data = json.load(f)
        else:
            user_data = {}

        user_data[session_id] = {
            "patient_name": patient_name,
            "medication": medication,
            "doctor": doctor,
        }

        with open(user_data_path, 'w') as f:
            json.dump(user_data, f, indent=2)

    except Exception as e:
        return jsonify({'error': f'Failed to save user data: {str(e)}'}), 500

    return jsonify(result)

@app.route('/api/summaries', methods=['POST'])
def save_summary():
    data = request.get_json()
    if not data or 'summary' not in data or 'eventId' not in data:
        return jsonify({'error': 'Missing summary or eventId'}), 400

    event_id = data['eventId']
    summary_content = data['summary']

    # Sanitize event_id to prevent directory traversal attacks
    safe_event_id = secure_filename(str(event_id))
    if not safe_event_id:
        return jsonify({'error': 'Invalid eventId'}), 400

    filepath = os.path.join(app.config['SUMMARIES_FOLDER'], f"{safe_event_id}.json")

    summary_data = {
        'eventId': event_id,
        'summary': summary_content,
        'timestamp': request.date
    }

    try:
        with open(filepath, 'w') as f:
            json.dump(summary_data, f, indent=2)
        return jsonify({'message': f'Summary for event {event_id} saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to save summary: {str(e)}'}), 500

if __name__ == "__main__":
    app.run(debug=True)

@app.route('/api/user_data', methods=['GET'])
def get_user_data():
    session_id = request.args.get('sessionId')
    if not session_id:
        return jsonify({'error': 'No sessionId provided'}), 400

    user_data_path = 'user_data.json'
    if not os.path.exists(user_data_path):
        return jsonify({'error': 'No user data found'}), 404

    try:
        with open(user_data_path, 'r') as f:
            user_data = json.load(f)

        data = user_data.get(session_id)
        if not data:
            return jsonify({'error': 'No data found for this session'}), 404

        return jsonify(data)

    except Exception as e:
        return jsonify({'error': f'Failed to retrieve user data: {str(e)}'}), 500