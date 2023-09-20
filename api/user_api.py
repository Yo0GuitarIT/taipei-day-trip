from flask import *
from mysql.connector import pooling
import json,jwt,datetime,pytz

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

database = [{"name": "Yo0", 
             "email": "Yo0@example.com", 
             "password": "12345678"}]

@user_info.route("/api/user/auth", methods=["PUT"])
def update_user_info():
    print(database)
    new_name = request.json.get("name")
    database[0]["name"] = new_name
    print(database)
    return json_process_utf8({"message": "名字已更新", "user": database}), 200

def json_process_utf8(result):
	result = Response(json.dumps(result, ensure_ascii = False),content_type ='application/json;charset=utf-8')
	return result



@user_info.route("/api/user", methods=["POST"])
def register_user():
    try:
        data = request.get_json()

        existing_user = next(
            (user for user in database if user['email'] == data['email']), None)
        if existing_user:
            return json_process_utf8({"error": True, "message": "註冊失敗，重複的 Email 或其他原因"}), 400
        
        database.append(data)
        print(data)
        return jsonify({"ok": True}), 200
    
    except Exception as error:
        return handle_error("伺服器內部錯誤")



def handle_error(message):
	return json_process_utf8({"error": True, "message": message}), 500



@user_info.route("/api/generate_token")
def generate_token():
    taipei_timezone = pytz.timezone('Asia/Taipei')
    expiration_time = datetime.datetime.utcnow().now(taipei_timezone) + datetime.timedelta(minutes=1)

    # 構建payload
    payload = {
        "user_id": 123,
        "username": "example_user",
        "exp": expiration_time # 使用時間戳表示過期時間
    }
    # 密鑰，這應該與生成 Token 時使用的密鑰一致
    secret_key = "Yo0_secret_key"

    # 生成JWT Token
    token = jwt.encode(payload, secret_key, algorithm="HS256")

    print(expiration_time)
    return jsonify({"token": token}), 200



@user_info.route("/api/validate_token", methods=["POST"])
def validate_token():
    token_to_decode = request.json.get("token")

    print(token_to_decode)
    secret_key = "Yo0_secret_key"

    try:
        decoded_payload = jwt.decode(token_to_decode, secret_key, algorithms=["HS256"])
        print(decoded_payload)
        return json_process_utf8({"message": "Token 驗證成功", "payload": decoded_payload}), 200
    except jwt.ExpiredSignatureError:
        return json_process_utf8({"error": True, "message": "Token 已過期"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": True, "message": "無效的 Token"}), 401


# log_in = True
# @user_info.route("/api/user/auth")
# def get_current_user():
#      result = {"data": {"id": 1, "name": "彭彭彭", "email": "ply@ply.com"}}
#      if log_in:
#           return json_process_utf8(result)
     


