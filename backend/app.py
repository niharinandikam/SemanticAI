import os
import re
import pdfplumber
from datetime import datetime, timedelta, timezone

from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from flask_pymongo import PyMongo
from dotenv import load_dotenv

import nltk
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

# -----------------------------
# NLTK SAFE LOAD
# -----------------------------
NLTK_PATH = os.getenv(
    "NLTK_DATA_PATH",
    os.path.join(os.path.dirname(__file__), "nltk_data"),
)
os.makedirs(NLTK_PATH, exist_ok=True)
if NLTK_PATH not in nltk.data.path:
    nltk.data.path.append(NLTK_PATH)

for resource_path, package_name in (
    ("tokenizers/punkt", "punkt"),
    ("tokenizers/punkt_tab", "punkt_tab"),
):
    try:
        nltk.data.find(resource_path)
    except LookupError:
        nltk.download(package_name, download_dir=NLTK_PATH, quiet=True)


def tokenize_sentences(text):
    try:
        return nltk.sent_tokenize(text)
    except LookupError:
        nltk.download("punkt", download_dir=NLTK_PATH, quiet=True)
        nltk.download("punkt_tab", download_dir=NLTK_PATH, quiet=True)
        try:
            return nltk.sent_tokenize(text)
        except LookupError:
            # Final fallback for environments with blocked downloads.
            chunks = re.split(r"(?<=[.!?])\s+", text.strip())
            return [chunk for chunk in chunks if chunk]

# -----------------------------
# AI MODEL
# -----------------------------
ai_model = None

def get_ai_model():
    global ai_model
    if ai_model is None:
        print("Loading SentenceTransformer model...")
        from sentence_transformers import SentenceTransformer
        ai_model = SentenceTransformer("all-MiniLM-L6-v2")
        print("AI model ready")
    return ai_model


# -----------------------------
# GEMINI
# -----------------------------
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
gemini_mode = None

if GEMINI_KEY:
    try:
        from google import genai

        gemini_client = genai.Client(api_key=GEMINI_KEY)
        gemini_model = "gemini-1.5-flash"
        gemini_mode = "new"
    except Exception:
        try:
            import google.generativeai as old_genai

            old_genai.configure(api_key=GEMINI_KEY)
            gemini_model = old_genai.GenerativeModel("gemini-1.5-flash")
            gemini_mode = "legacy"
        except Exception:
            gemini_model = None
            gemini_mode = None
else:
    gemini_model = None
    gemini_mode = None


# -----------------------------
# FLASK
# -----------------------------
app = Flask(__name__)

default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://plagirism-frontned.vercel.app",
]
cors_origins_raw = os.getenv("CORS_ORIGINS", "")
if cors_origins_raw.strip():
    cors_origins = [
        origin.strip()
        for origin in cors_origins_raw.split(",")
        if origin.strip()
    ]
else:
    cors_origins = default_origins

CORS(
    app,
    resources={r"/*": {"origins": cors_origins}},
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

mongo_uri = (os.getenv("MONGO_URI") or "").strip()
if not mongo_uri:
    # Development fallback so app can boot without a populated .env file.
    mongo_uri = "mongodb://127.0.0.1:27017/plagiarism_detection"
    print("[config] MONGO_URI not set, using local MongoDB fallback")

jwt_secret = (os.getenv("JWT_SECRET") or "").strip()
if not jwt_secret:
    # Keep local dev working; always override in production.
    jwt_secret = "dev-secret-change-me"
    print("[config] JWT_SECRET not set, using development fallback")

app.config["MONGO_URI"] = mongo_uri
app.config["JWT_SECRET_KEY"] = jwt_secret
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=5)

mongo = PyMongo(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


# -----------------------------
# HEALTH ROUTE
# -----------------------------
@app.route("/", methods=["GET"])
def health():
    return {"status": "server running"}


# -----------------------------
# DB CONNECTION TEST
# -----------------------------
try:
    mongo.cx.admin.command("ping")
    print("MongoDB connected")
except Exception as e:
    print("MongoDB error:", e)


# -----------------------------
# REGISTER
# -----------------------------
@app.route("/register", methods=["POST"])
def register():

    try:
        data = request.json

        if mongo.db.users.find_one({"email": data.get("email")}):
            return jsonify({"msg": "User already exists"}), 400

        hashed_pw = bcrypt.generate_password_hash(
            data["password"]
        ).decode("utf-8")

        mongo.db.users.insert_one({
            "name": data["name"],
            "email": data["email"],
            "password": hashed_pw,
            "scans_count": 0,
            "created_at": datetime.now(timezone.utc),
        })

        return jsonify({"msg": "User created"}), 201

    except Exception as e:
        return jsonify({"msg": str(e)}), 500


# -----------------------------
# LOGIN
# -----------------------------
@app.route("/login", methods=["POST"])
def login():

    try:
        data = request.json

        user = mongo.db.users.find_one({"email": data.get("email")})

        if user and bcrypt.check_password_hash(
            user["password"], data.get("password")
        ):

            token = create_access_token(identity=user["email"])

            return jsonify({
                "access_token": token,
                "user": {
                    "name": user["name"],
                    "email": user["email"]
                }
            })

        return jsonify({"msg": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"msg": str(e)}), 500


# -----------------------------
# PROFILE
# -----------------------------
@app.route("/profile", methods=["GET", "PUT"])
@jwt_required()
def profile():

    user_email = get_jwt_identity()
    user = mongo.db.users.find_one({"email": user_email})

    if not user:
        return jsonify({"msg": "User not found"}), 404

    if request.method == "GET":

        return jsonify({
            "name": user.get("name"),
            "email": user.get("email"),
            "scans": user.get("scans_count", 0),
        })

    if request.method == "PUT":

        data = request.json

        mongo.db.users.update_one(
            {"email": user_email},
            {"$set": {"name": data.get("name")}},
        )

        return jsonify({"msg": "Profile updated"})


# -----------------------------
# ANALYZE DOCUMENT
# -----------------------------
def _extract_text_from_request():
    if "file" in request.files:
        uploaded_file = request.files["file"]
        if uploaded_file.filename.endswith(".pdf"):
            with pdfplumber.open(uploaded_file) as pdf:
                return " ".join(
                    page.extract_text()
                    for page in pdf.pages
                    if page.extract_text()
                )
        return uploaded_file.read().decode("utf-8")

    if request.is_json:
        payload = request.get_json() or {}
        return payload.get("text", "")

    return request.form.get("text", "")


def _check_self_plagiarism(sentences):
    """Detect duplicate/similar sentences within the same document."""
    if len(sentences) < 2:
        return [{"text": s, "isPlagiarized": False} for s in sentences], 0

    model = get_ai_model()
    embeddings = model.encode(sentences, convert_to_numpy=True)
    self_sim_matrix = cosine_similarity(embeddings, embeddings)

    detailed_analysis = []
    plag_count = 0

    for i, sentence in enumerate(sentences):
        has_match = any(
            self_sim_matrix[i][j] > 0.85
            for j in range(len(sentences))
            if i != j
        )
        if has_match:
            plag_count += 1

        detailed_analysis.append({
            "text": sentence,
            "isPlagiarized": bool(has_match),
        })

    return detailed_analysis, plag_count


def _check_cross_plagiarism(sentences, prev_sentences):
    """Detect plagiarism against previous submissions."""
    model = get_ai_model()
    curr_embeddings = model.encode(sentences, convert_to_numpy=True)
    prev_embeddings = model.encode(prev_sentences, convert_to_numpy=True)
    sim_matrix = cosine_similarity(curr_embeddings, prev_embeddings)

    detailed_analysis = []
    plag_count = 0

    for i, sentence in enumerate(sentences):
        max_sim = max(sim_matrix[i])
        is_plag = max_sim > 0.65
        if is_plag:
            plag_count += 1
        detailed_analysis.append({
            "text": sentence,
            "isPlagiarized": bool(is_plag),
        })

    return detailed_analysis, plag_count


def _build_similarity_analysis(sentences, prev_sentences):
    if not prev_sentences:
        return _check_self_plagiarism(sentences)
    return _check_cross_plagiarism(sentences, prev_sentences)


def _generate_ai_insight(score, text_content):
    # Categorize insight based on plagiarism score
    if score <= 15:
        fallback_msg = "Document appears to have strong originality. Well done maintaining academic integrity!"
    elif score <= 40:
        fallback_msg = "Moderate plagiarism detected. Review flagged sections and rephrase in your own words to improve."
    elif score <= 70:
        fallback_msg = "Significant plagiarism detected. This document requires substantial revision to assert originality."
    else:
        fallback_msg = "Critical plagiarism level detected. This document appears to be largely copied or heavily paraphrased from existing sources."

    # If no Gemini available, return appropriate fallback
    if not gemini_model:
        return fallback_msg

    # Try to use Gemini for detailed analysis if available
    try:
        prompt = f"""
Score: {score}%

Text snippet:
{text_content[:600]}

Provide a brief, professional assessment of why this plagiarism level was detected and what the document's main issues are.
"""
        if gemini_mode == "new":
            response = gemini_client.models.generate_content(
                model=gemini_model,
                contents=prompt,
            )
            return response.text

        response = gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        print("Gemini error:", e)
        return fallback_msg


@app.route("/analyze", methods=["POST"])
@jwt_required()
def analyze():

    try:
        user_email = get_jwt_identity()
        text_content = _extract_text_from_request()

        if not text_content.strip():
            return jsonify({"msg": "No text content received"}), 400

        sentences = tokenize_sentences(text_content)

        previous_scans = list(
            mongo.db.scans.find({}, {"text": 1}).limit(50)
        )
        prev_text = " ".join(
            s.get("text", "") for s in previous_scans if s.get("text")
        )
        prev_sentences = tokenize_sentences(prev_text) if prev_text else []

        detailed_analysis, plag_count = _build_similarity_analysis(
            sentences, prev_sentences
        )
        score = int((plag_count / len(sentences)) * 100) if sentences else 0
        ai_insight = _generate_ai_insight(score, text_content)

        mongo.db.scans.insert_one({
            "user_email": user_email,
            "text": text_content,
            "score": score,
            "analysis": detailed_analysis,
            "ai_insight": ai_insight,
            "timestamp": datetime.now(timezone.utc),
        })

        mongo.db.users.update_one(
            {"email": user_email},
            {"$inc": {"scans_count": 1}},
        )

        return jsonify({
            "percentage": score,
            "analysis": detailed_analysis,
            "extracted_text": text_content,
            "ai_insight": ai_insight,
        })

    except Exception as e:

        print("Analyze error:", e)

        return jsonify({"msg": str(e)}), 500


# -----------------------------
# HISTORY
# -----------------------------
@app.route("/history", methods=["GET"])
@jwt_required()
def history():

    try:

        user_email = get_jwt_identity()

        scans = mongo.db.scans.find(
            {"user_email": user_email}
        ).sort("timestamp", -1)

        output = []

        for s in scans:

            output.append({
                "id": str(s["_id"]),
                "full_text": s.get("text", ""),
                "score": s.get("score", 0),
                "analysis": s.get("analysis", []),
                "ai_insight": s.get("ai_insight", ""),
                "date": s["timestamp"].strftime("%Y-%m-%d")
                if s.get("timestamp") else "N/A",
            })

        return jsonify(output)

    except Exception as e:
        return jsonify({"msg": str(e)}), 500


# -----------------------------
# PRELOAD MODEL
# -----------------------------
print("Preloading AI model...")
get_ai_model()
print("AI ready for requests")


# -----------------------------
# SERVER
# -----------------------------
if __name__ == "__main__":

    port = int(os.environ.get("PORT", 5000))

    app.run(host="127.0.0.1", port=port)