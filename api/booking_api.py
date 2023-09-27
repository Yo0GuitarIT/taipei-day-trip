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

def is_user_logged_in():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return json_process_utf8({"data": None})
    
    token = auth_header.replace("Bearer ", "")
    decoded_payload = verify_jwt_token(token)
    
    if decoded_payload is None:
        return  json_process_utf8({"data":None})
    
    login_info = {
        "data": {
            "id": decoded_payload["user_id"],
            "name": decoded_payload["user_name"],
            "email": decoded_payload["user_email"]
        }
    }
    print(login_info)
    return True

def verify_jwt_token(token):
    try:
        decoded_payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded_payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

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

@booking_info.route("/api/booking", methods=["GET"])
def get_unconfirmed_bookings():
    if not is_user_logged_in():
        return json_process_utf8({"error": True, "message": "未登入系統，拒絕存取"}), 403
    booking_data = session.get('booking_data')
    print(booking_data)
    return json_process_utf8(booking_data), 200


@booking_info.route("/api/booking", methods=["POST"])
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

        session['booking_data'] = new_booking

        return jsonify({"ok":True}), 200

    except Exception as e:
        return json_process_utf8("伺服器內部錯誤"), 500


@booking_info.route("/api/booking", methods=["DELETE"])
def delete_booking():
    try:
        if not is_user_logged_in():
            return json_process_utf8({"error": True, "message": "未登入系統，拒絕存取"}), 403
        
        session.pop('booking_data', None)
        return jsonify({"ok": True})

    except Exception as e:
        return json_process_utf8("伺服器內部錯誤"), 500




