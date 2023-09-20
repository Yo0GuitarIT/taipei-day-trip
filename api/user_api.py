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
        
        return jsonify({"ok": True}), 200
    
    except Exception as error:
        return handle_error("伺服器內部錯誤")
    
@user_info.route("/api/user/auth", methods=["GET"])
def get_user():
    login_info = request.get_data()
    check_user_login(login_info)  
    # if member_info:
    #     # 如果会员已登录，返回会员信息
    #     response_data = {
    #         "data": member_info
    #     }
    #     return jsonify(response_data)
    # else:
    #     # 如果会员未登录，返回null
    #     return jsonify({"data": None})


def check_user_login(login_info):
    print(login_info)


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




# @user_info.route("/api/generate_token")
# def generate_token():
#     taipei_timezone = pytz.timezone('Asia/Taipei')
#     expiration_time = datetime.datetime.utcnow().now(taipei_timezone) + datetime.timedelta(minutes=1)

#     # 構建payload
#     payload = {
#         "user_id": 123,
#         "username": "example_user",
#         "exp": expiration_time # 使用時間戳表示過期時間
#     }
#     # 密鑰，這應該與生成 Token 時使用的密鑰一致
#     secret_key = "Yo0_secret_key"

#     # 生成JWT Token
#     token = jwt.encode(payload, secret_key, algorithm="HS256")

#     print(expiration_time)
#     return jsonify({"token": token}), 200


# @user_info.route("/api/validate_token", methods=["POST"])
# def validate_token():
#     token_to_decode = request.json.get("token")

#     print(token_to_decode)
#     secret_key = "Yo0_secret_key"

#     try:
#         decoded_payload = jwt.decode(token_to_decode, secret_key, algorithms=["HS256"])
#         print(decoded_payload)
#         return json_process_utf8({"message": "Token 驗證成功", "payload": decoded_payload}), 200
#     except jwt.ExpiredSignatureError:
#         return json_process_utf8({"error": True, "message": "Token 已過期"}), 401
#     except jwt.InvalidTokenError:
#         return jsonify({"error": True, "message": "無效的 Token"}), 401





# log_in = True
# @user_info.route("/api/user/auth")
# def get_current_user():
#      result = {"data": {"id": 1, "name": "彭彭彭", "email": "ply@ply.com"}}
#      if log_in:
#           return json_process_utf8(result)
     

