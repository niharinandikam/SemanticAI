from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pickle

from similarity_engine import find_similar_sentences
from ai_engine import AIAnalyzer


app = Flask(__name__)
CORS(app)

# Load ML model
model = pickle.load(open("plagiarism_model.pkl", "rb"))

# Initialize AI engine
ai = AIAnalyzer(api_key="AIzaSyBiRuD5rmvmUTVecNY335pC85p3Z81Zj5E")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():

    data = request.json

    doc1 = data.get("doc1")
    doc2 = data.get("doc2")

    if not doc1 or not doc2:
        return jsonify({"error": "Documents missing"}), 400


    # Example feature input (replace with your real feature vector)
    features = [[0.8, 0.75]]

    prediction = model.predict(features)[0]


    # Sentence similarity detection
    matches = find_similar_sentences(doc1, doc2)


    insights = {
        "matches_found": len(matches)
    }

    # AI explanation
    explanation = ai.generate_explanation(doc1, doc2, prediction)


    return jsonify({
        "plagiarism_score": float(prediction),
        "similar_sentences": matches,
        "insights": insights,
        "ai_explanation": explanation
    })


if __name__ == "__main__":
    app.run(debug=True)