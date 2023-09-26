from flask import *
from mysql.connector import pooling
import json
import jwt

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "12345678",
    "database": "taipei_day_trip"
}

connection_pool = pooling.MySQLConnectionPool(
    pool_name = "my_pool",
    pool_size = 5,  
    **db_config
)

SECRET_KEY = "Yo0-secret-key"

booking_info = Blueprint("booking_api",__name__)


booking_data = []

@booking_info.route("/api/booking", methods=["GET"])
def get_unconfirmed_bookings():
    if not is_user_logged_in():
        return json_process_utf8({"error": True, "message": "未登入系統，拒絕存取"}), 403
    
    return json_process_utf8(booking_data)


@booking_info.route("/api/booking" ,methods=["POST"])
def booking():
    try:
        data = request.json
        date = data["date"]
        time = data["time"]
        price = data["price"]

        if not is_user_logged_in():
            return json_process_utf8({"error": True, "message": "未登入系統，拒絕存取"}), 403
        if not data :
            return json_process_utf8("建立失敗，輸入不正確或其他原因"), 400
        
        data_from_database = get_attraction_info(data["attractionId"])

        name = data_from_database[0]["attraction_name"]
        address = data_from_database[0]["attraction_address"]
        image = data_from_database[0]["attraction_image_url"]

        new_booking = {
            "data":{
                "attraction": {
                    "id": data["attractionId"],
                    "name": name,
                    "address": address,
                    "image": image
                }},
            "date": date,
            "time": time,
            "price": price
        }

        booking_data.append(new_booking)
        return jsonify({"ok":True})

    except Exception as e:
        return json_process_utf8("伺服器內部錯誤"), 500

def json_process_utf8(result):
	result = Response(json.dumps(result, ensure_ascii = False),
                   content_type ='application/json;charset=utf-8')
	return result

def get_attraction_info(attraction_number):
    query = """
    SELECT 
        a.name AS attraction_name, 
        a.address AS attraction_address,
        i.url AS attraction_image_url
    FROM attractions AS a
    LEFT JOIN image_urls AS i ON a.id = i.attraction_id
    WHERE a.id = %s
    LIMIT 1;
    """
    search_result = execute_query(query, (attraction_number,))
    return search_result

def execute_query(query,params=None):
    connection = connection_pool.get_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SET GLOBAL group_concat_max_len = 102400;")
	
    cursor.execute(query,params)
    result = cursor.fetchall()
    cursor.close()
    connection.close()
    return result

def is_user_logged_in():
    return True