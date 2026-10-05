from flask import Flask, request, jsonify, send_from_directory
from pathlib import Path
from mysql.connector import pooling
from dotenv import load_dotenv
import os


# =========================
# LOAD ENVIRONMENT
# =========================

load_dotenv()


# =========================
# FLASK APP
# =========================

app = Flask(__name__)

# Project root folder
# app.py is inside /backend
# so .parent.parent = MY Portfolio
BASE_DIR = Path(__file__).resolve().parent.parent


# =========================
# DATABASE CONFIG
# =========================

db_config = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "port": int(os.getenv("DB_PORT", 3306))
}


# =========================
# CONNECTION POOL
# =========================

connection_pool = pooling.MySQLConnectionPool(
    pool_name="portfolio_pool",
    pool_size=5,
    **db_config
)


# =========================
# HELPER
# =========================

def get_db_connection():
    return connection_pool.get_connection()


# =========================
# HOME / HTML PAGES
# =========================

@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/about.html")
def about():
    return send_from_directory(BASE_DIR, "about.html")


@app.route("/projects.html")
def projects():
    return send_from_directory(BASE_DIR, "projects.html")


@app.route("/contact.html")
def contact_page():
    return send_from_directory(BASE_DIR, "contact.html")


@app.route("/reviews.html")
def reviews_page():
    return send_from_directory(BASE_DIR, "reviews.html")


# =========================
# CSS / JS / STATIC FILES
# =========================

@app.route("/css/<path:filename>")
def css_files(filename):
    return send_from_directory(BASE_DIR / "css", filename)


@app.route("/js/<path:filename>")
def js_files(filename):
    return send_from_directory(BASE_DIR / "js", filename)


@app.route("/assets/<path:filename>")
def assets_files(filename):
    return send_from_directory(BASE_DIR / "assets", filename)

# =========================
# HEALTH CHECK
# =========================

@app.route("/api/health", methods=["GET"])
def health():

    try:

        connection = get_db_connection()

        cursor = connection.cursor()

        cursor.execute("SELECT 1")

        cursor.fetchone()

        cursor.close()
        connection.close()

        return jsonify({
            "success": True,
            "message": "Portfolio backend and MySQL are running."
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Database connection failed.",
            "error": str(e)
        }), 500


# =========================================================
# CONTACT / INQUIRY API
# =========================================================

@app.route("/api/contact", methods=["POST"])
def create_inquiry():

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "No data received."
        }), 400


    name = data.get("name", "").strip()

    business_name = data.get("business_name", "").strip()

    business_type = data.get("business_type", "").strip()

    contact = data.get("contact", "").strip()

    message = data.get("message", "").strip()


    # =========================
    # VALIDATION
    # =========================

    if not name:

        return jsonify({
            "success": False,
            "message": "Name is required."
        }), 400


    if not contact:

        return jsonify({
            "success": False,
            "message": "Phone or email is required."
        }), 400


    if not message:

        return jsonify({
            "success": False,
            "message": "Message is required."
        }), 400


    try:

        connection = get_db_connection()

        cursor = connection.cursor()


        query = """
            INSERT INTO inquiries
            (
                name,
                business_name,
                business_type,
                contact,
                message
            )

            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s
            )
        """


        values = (
            name,
            business_name,
            business_type,
            contact,
            message
        )


        cursor.execute(query, values)

        connection.commit()

        inquiry_id = cursor.lastrowid

        cursor.close()
        connection.close()


        return jsonify({

            "success": True,

            "message": "Your inquiry has been submitted successfully.",

            "inquiry_id": inquiry_id

        }), 201


    except Exception as e:

        return jsonify({

            "success": False,

            "message": "Something went wrong while saving your inquiry.",

            "error": str(e)

        }), 500


# =========================================================
# GET APPROVED REVIEWS
# =========================================================

@app.route("/api/reviews", methods=["GET"])
def get_reviews():

    try:

        connection = get_db_connection()

        cursor = connection.cursor(dictionary=True)


        query = """
            SELECT
                id,
                name,
                business_name,
                rating,
                review,
                created_at

            FROM reviews

            WHERE approved = TRUE

            ORDER BY created_at DESC
        """


        cursor.execute(query)

        reviews = cursor.fetchall()


        cursor.close()
        connection.close()


        return jsonify({

            "success": True,

            "reviews": reviews

        })


    except Exception as e:

        return jsonify({

            "success": False,

            "message": "Could not load reviews.",

            "error": str(e)

        }), 500


# =========================================================
# SUBMIT REVIEW
# =========================================================

@app.route("/api/reviews", methods=["POST"])
def create_review():

    data = request.get_json()


    if not data:

        return jsonify({

            "success": False,

            "message": "No data received."

        }), 400


    name = data.get("name", "").strip()

    business_name = data.get("business_name", "").strip()

    review = data.get("review", "").strip()

    rating = data.get("rating")


    # =========================
    # VALIDATION
    # =========================

    if not name:

        return jsonify({

            "success": False,

            "message": "Name is required."

        }), 400


    if not review:

        return jsonify({

            "success": False,

            "message": "Review is required."

        }), 400


    try:

        rating = int(rating)

    except (TypeError, ValueError):

        return jsonify({

            "success": False,

            "message": "Rating must be a number."

        }), 400


    if rating < 1 or rating > 5:

        return jsonify({

            "success": False,

            "message": "Rating must be between 1 and 5."

        }), 400


    try:

        connection = get_db_connection()

        cursor = connection.cursor()


        query = """
            INSERT INTO reviews
            (
                name,
                business_name,
                rating,
                review,
                approved
            )

            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                FALSE
            )
        """


        values = (
            name,
            business_name,
            rating,
            review
        )


        cursor.execute(query, values)

        connection.commit()

        review_id = cursor.lastrowid

        cursor.close()
        connection.close()


        return jsonify({

            "success": True,

            "message": "Thank you! Your review has been submitted and is awaiting approval.",

            "review_id": review_id

        }), 201


    except Exception as e:

        return jsonify({

            "success": False,

            "message": "Something went wrong while submitting your review.",

            "error": str(e)

        }), 500


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )