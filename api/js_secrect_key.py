from flask import *
import os
import requests

js_info = Blueprint("js_api", __name__)

@js_info.route("/api/weather", methods=["POST"])
def get_weather():
    weather_api = os.getenv("WEATHER_API_KEY")
    data = request.get_json()
    city = data["city"]

    weather_api_url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={weather_api}"

    try:
        response = requests.get(weather_api_url)
        weather_data = response.json()
        return jsonify(weather_data)
    
    except Exception as e:
        return jsonify({"error": str(e)})