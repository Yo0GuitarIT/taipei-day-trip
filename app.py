from flask import *
import os
from dotenv import load_dotenv
load_dotenv()

from api.attractions_api import attraction_info
from api.mrt_api import mrt_info
from api.booking_api import booking_info
from api.user_api import user_info
from api.orders_api import orders_info
from api.js_secrect_key import js_info

app = Flask(__name__, static_folder="static")
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config["JSON_SORT_KEYS"] = False

app.register_blueprint(attraction_info)
app.register_blueprint(mrt_info)
app.register_blueprint(booking_info)
app.register_blueprint(user_info)
app.register_blueprint(orders_info)
app.register_blueprint(js_info)

app.secret_key = os.getenv("APP_SECRET_KEY")

@app.route("/")
def index():
	return render_template("index.html")

@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")

@app.route("/booking")
def booking():
	return render_template("booking.html")

@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)
