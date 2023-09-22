from flask import *
from mysql.connector import pooling
import json
import jwt
import datetime

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "12345678",
    "database": "taipei_day_trip"
}

connection_pool = pooling.MySQLConnectionPool(
    pool_name="my_pool",
    pool_size=5,
    **db_config
)

user_info = Blueprint("user_api", __name__)

SECRET_KEY = "Yo0-secret-key"

def execute_query(query,params=None):
    connection = connection_pool.get_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SET GLOBAL group_concat_max_len = 102400;")
	
    cursor.execute(query,params)
    result = cursor.fetchall()
    cursor.close()
    connection.close()
    return result

def handle_error(message):
	return json_process_utf8({"error": True, "message": message}), 500

def json_process_utf8(result):
	result = Response(json.dumps(result, ensure_ascii = False),content_type ='application/json;charset=utf-8')
	return result

def generate_jwt_token(payload):
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

def verify_jwt_token(token):
    try:
        decoded_payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded_payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@user_info.route("/api/user", methods=["POST"])
def register_user():
    try:
        data = request.get_json()
        
        query = """SELECT * FROM member WHERE email = %s"""
        result = execute_query(query,(data['email'],))
        if result:
            return json_process_utf8({"error": True, "message": "註冊失敗，重複的 Email 或其他原因"}), 400
        
        connection = connection_pool.get_connection()
        cursor = connection.cursor()
        register_query = """INSERT INTO member (name, email, password) VALUES (%s, %s, %s)"""
        cursor.execute(register_query, (data['name'], data['email'], data['password']))
        connection.commit()
        
        cursor.close()
        connection.close()
        
        print("connection")
        return jsonify({"ok": True}), 200
    
    except Exception as error:
        return handle_error("伺服器內部錯誤")
      
@user_info.route("/api/user/auth", methods=["PUT"])
def auth_user():
    try:
        auth_data = request.get_json()   
        search_member_query = """
        SELECT id, name, email
        FROM member
        WHERE email = %s
        AND password = %s
        """
        search_result = execute_query(search_member_query,(auth_data["email"], auth_data["password"]))
        if search_result:
            user_info = search_result[0]  
            payload = {
                "user_id": user_info["id"],
                "user_name": user_info["name"],
                "user_email": user_info["email"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(weeks=1)
            }
            token = generate_jwt_token(payload)
            return jsonify({"token": token}), 200
        else:
            return json_process_utf8({"error": True, "message": "登入失敗，帳號或密碼錯誤或其他原因"}), 400
    except Exception as error:
        return handle_error("伺服器內部錯誤")
        
@user_info.route("/api/user/auth", methods=["GET"])
def get_user():
    print("Getting")
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
    return json_process_utf8(login_info), 200
