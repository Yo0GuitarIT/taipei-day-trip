from flask import *
from mysql.connector import pooling
import json
import jwt
import os

database_host = os.getenv("DATABASE_HOST")
database_username = os.getenv("DATABASE_USERNAME")
database_password = os.getenv("DATABASE_PASSWORD")
token_secrect_key = os.getenv("TOKEN_SECRET_KEY")

db_config = {
    "host": database_host,
    "user": database_username,
    "password": database_password,
    "database": "taipei_day_trip"
}

connection_pool = pooling.MySQLConnectionPool(
    pool_name = "my_pool",
    pool_size = 5,  
    **db_config
)

SECRET_KEY = token_secrect_key

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
    user_id = login_info["data"]["id"]
    return user_id

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
    user_id = is_user_logged_in()
    if not user_id:
        return json_process_utf8({"error": True, "message": "未登入系統，拒絕存取"}), 403
    user_orders = session.get(f"user_orders_{user_id}", [])
    return json_process_utf8(user_orders), 200

@booking_info.route("/api/booking", methods=["POST"])
def booking():
    try:
        session.clear()

        user_id = is_user_logged_in()

        if not user_id:
            return json_process_utf8({"error": True, "message": "未登入系統，拒絕存取"}), 403
        
        data = request.json
        if not data :
            return json_process_utf8("建立失敗，輸入不正確或其他原因"), 400
        date = data["date"]
        time = data["time"]
        price = data["price"]

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
            "price": price,
            "user_id": user_id
        }

        user_orders = session.get(f"user_orders_{user_id}", [])
        user_orders.append(new_booking)
        session[f"user_orders_{user_id}"] = user_orders

        return jsonify({"ok":True}), 200

    except Exception as e:
        return json_process_utf8("伺服器內部錯誤"), 500

@booking_info.route("/api/booking", methods=["DELETE"])
def delete_booking():
    try:
        user_id = is_user_logged_in()
        if not user_id:
            return json_process_utf8({"error": True, "message": "未登入系統，拒絕存取"}), 403
        
        data = request.json
        data_to_delete = data["sessionData"]
        print(data_to_delete)

        user_orders = session.get(f"user_orders_{user_id}", [])
        
        if len(user_orders) != 0:
            user_orders.pop(data_to_delete)
            session[f"user_orders_{user_id}"] = user_orders

        return jsonify({"ok": True})

    except Exception as e:
        return json_process_utf8("伺服器內部錯誤"), 500
