import numpy as np 
from flask import Flask, render_template, request, jsonify 

from data_saver import save_feedback

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")


# =========================
# FEEDBACK (SELF-LEARNING)
# =========================
@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.get_json()
    save_feedback(
        data["image"],
        data["label"],
        data["mode"]
    )
    return jsonify({"status": "success"})


if __name__ == "__main__":
    app.run(debug=True)
