from flask import Flask, request, jsonify, render_template
from ml.predict import predict_disease

app = Flask(__name__, template_folder="templates")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    symptoms = data["symptoms"]
    result = predict_disease(symptoms)
    return jsonify({"disease": result})

if __name__ == "__main__":
    app.run(debug=True)