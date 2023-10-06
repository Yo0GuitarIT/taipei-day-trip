from flask import *
from mysql.connector import pooling
import json
import requests
import jwt
import uuid

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

orders_info = Blueprint("orders_api", __name__)

SECRET_KEY = "Yo0-secret-key"

TAPPAY_API_URL = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
PARTNER_KEY = "partner_yf4HPx6lfRpgRq1NRs32KtrDn17ItLUr70LaD1jAJK7Tlff65YDvRNJm"

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
    
def generate_order_number():
    unique_id = uuid.uuid4()
    return str(unique_id)

def entry_database(data_to_database,order_id):
    price = data_to_database["order"]["price"]
    attraction_id = data_to_database["order"]["trip"]["attraction"]["id"]
    attraction_name = data_to_database["order"]["trip"]["attraction"]["name"]
    attraction_address = data_to_database["order"]["trip"]["attraction"]["address"]
    attraction_image = data_to_database["order"]["trip"]["attraction"]["image"]
    date = data_to_database["order"]["date"]
    time = data_to_database["order"]["time"]
    name = data_to_database["contact"]["name"]
    email = data_to_database["contact"]["email"]
    phone = data_to_database["contact"]["phone"]
        
    insert_data = {
        "number" : order_id,
        "price" : price,
        "attraction_id" : attraction_id,
        "attraction_name" : attraction_name,
        "attraction_address" : attraction_address,
        "attraction_image" : attraction_image,
        "date" : date,
        "time" : time,
        "name" : name,
        "email" : email,
        "phone" : phone,
        "is_paid" : False   #payment status 
        }   
    
    query = """
    INSERT INTO orders (
        number, 
        price, 
        attraction_id, 
        attraction_name, 
        attraction_address, 
        attraction_image, 
        date, 
        time, 
        name, email, phone, 
        is_paid)

    VALUES (
        %(number)s, 
        %(price)s, 
        %(attraction_id)s, 
        %(attraction_name)s, 
        %(attraction_address)s, 
        %(attraction_image)s, 
        %(date)s, 
        %(time)s,
        %(name)s, %(email)s, %(phone)s, 
        %(is_paid)s)
    """
    insert_data_to_database(query, insert_data)
    
def insert_data_to_database(query,params=None):
    connection = connection_pool.get_connection()
    cursor = connection.cursor(dictionary=True)
    # cursor.execute("SET GLOBAL group_concat_max_len = 102400;")
    try:
        cursor.execute(query,params)
        connection.commit()
        cursor.close()
        connection.close()
        print("Data has been inserted successfully!")

    except Exception as e:
        print(f"An error occurred: {str(e)}")
    
def update_order_status(order_id):
    connection = connection_pool.get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        update_query = "UPDATE orders SET is_paid = %s WHERE number = %s"
        cursor.execute(update_query, (True, order_id))
        
        connection.commit()
        cursor.close()
        connection.close()
        return True
    
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return False

def process_tappay_payment(data, order_id):
    headers = {
        "Content-Type": "application/json",
        "x-api-key": PARTNER_KEY,
    }
    prime = data["prime"]
    details = data["order"]["trip"]["attraction"]["name"]
    amount = data["order"]["price"]
    phone_number = data["contact"]["phone"]
    name = data["contact"]["name"]
    email = data["contact"]["email"]

    data = {
        "prime": prime,
        "partner_key": PARTNER_KEY,
        "merchant_id": "yo036563_TAISHIN",
        "details": f"{name} 預定行程：{details}",
        "amount": amount,
        "cardholder": {
            "phone_number": phone_number,
            "name": name,
            "email": email,
        },
        "order_number": order_id
    }

    response = requests.post(TAPPAY_API_URL, json=data, headers=headers)
    return response.json()

def json_process_utf8(result):
    result = Response(json.dumps(result, ensure_ascii=False), content_type="application/json;charset=utf-8")
    return result

def handle_error(message):
    return json_process_utf8({"error": True, "message": message}), 500

@orders_info.route("/api/orders", methods=["POST"])
def create_and_process_order():
    try:
        user_id = is_user_logged_in()
        if not user_id:
            return json_process_utf8({"error": True, "message": "未登入系統，拒絕存取"}), 403
       
        data = request.get_json()
        order_id = generate_order_number()

        entry_database(data,order_id) 
        order_status = process_tappay_payment(data, order_id)
        status =  order_status["status"]
        
        if order_status["status"] != 0:
             return json_process_utf8("建立失敗，輸入不正確或其他原因"), 400
        
        if not update_order_status(order_id):
            return json_process_utf8("建立失敗，輸入不正確或其他原因"), 400
            
        response_data = {
            "order_id": order_id,
            "payment": {
                "status": status,
                "message": "付款成功"
            },
        }

        session.clear()

        return json_process_utf8({"data": response_data}), 200

    except Exception as error:
        return handle_error("伺服器內部錯誤"), 500

@orders_info.route("/api/orders/<string:orderNumber>", methods=["GET"])
def get_orders(orderNumber):
    user_id = is_user_logged_in()
    if not user_id:
        return json_process_utf8({"error": True, "message": "未登入系統，拒絕存取"}), 403

    try:
        connection = connection_pool.get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SET GLOBAL group_concat_max_len = 102400;")
        
        search_query = "SELECT * FROM orders WHERE number = %s"
        
        cursor.execute(search_query,(orderNumber,))
        result = cursor.fetchone()

        cursor.close()
        connection.close()

        if not result:
            return handle_error("找不到該訂單"), 404
        
        number = result["number"]
        price = result["price"]
        attraction_id = result["attraction_id"]
        attraction_name = result["attraction_name"]
        attraction_address = result["attraction_address"]
        attraction_image = result["attraction_image"]
        date = result["date"]
        time = result["time"]
        name = result["name"]
        email = result["email"]
        phone = result["phone"]

        return_data = {
            "data":{
                "number": number,
                "price": price,
                "trip": {
                    "attraction":{
                        "id": attraction_id,
                        "name": attraction_name,
                        "address": attraction_address,
                        "image": attraction_image
                        },
                        "date": date,
                        "time": time
                    },
                    "contact":{
                        "name": name,
                        "email": email,
                        "phone": phone
                    }
                }
            }
        return json_process_utf8(return_data), 200

    except Exception as error:
        return handle_error("伺服器內部錯誤"), 500
