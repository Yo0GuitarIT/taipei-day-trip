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
        "details": details,
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
        
        order_status = process_tappay_payment(data, order_id)
        is_paid = False
        if order_status["status"] != 0:
             return json_process_utf8("建立失敗，輸入不正確或其他原因"), 400
        if order_status["status"] == 0:
            is_paid = True
        
        status =  order_status["status"]
        record_to_database(data, order_id, status)

        response_data = {
            "order_id": order_id,
            "payment": {
                "status": status,
                "message": "付款成功"
            },
        }
        return json_process_utf8({"data": response_data}), 200

    except Exception as error:
        return handle_error("伺服器內部錯誤"), 500

@orders_info.route("/api/orders", methods=["GET"])
def get_orders():
    try:
        user_id = is_user_logged_in()
        if not user_id:
            return json_process_utf8({"error": True, "message": "未登入系統，拒絕存取"}), 403
        
        print("get orders")

    except Exception as error:
        return handle_error("伺服器內部錯誤"), 500




def record_to_database(booking_data, order_id, status):
    trip = booking_data["order"]["trip"]
    contact = booking_data["contact"]
    price = booking_data["order"]["price"]
    
    result = {
        "data": {
            "number": order_id,
            "price": price,
            "trip": trip,
            "contact": contact,
            "status": status,
            }
        }
    
    
    
    print(result)
