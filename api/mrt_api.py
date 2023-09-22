from flask import *
from mysql.connector import pooling
import json

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

mrt_info = Blueprint("mrt_api",__name__)

@mrt_info.route('/mrts')
def api_mrts():
	try:
		query = """
            SELECT m.station_name
            FROM mrt AS m
            LEFT JOIN attractions AS a ON m.id = a.mrt_id
            GROUP BY m.station_name
            ORDER BY COUNT(a.id) DESC;
        """

		mrt_result = execute_query(query)

		mrts = [row['station_name'] for row in mrt_result]
		result = {"data": mrts}
		return json_process_utf8(result)
		
	except ValueError as error:
		return handle_error("伺服器內部錯誤")

def execute_query(query, params=None):
    connection = connection_pool.get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SET GLOBAL group_concat_max_len = 102400;")
	
    cursor.execute(query, params)
    result = cursor.fetchall()
    cursor.close()
    connection.close()
    return result

def json_process_utf8(result):
	result = Response(json.dumps(result, ensure_ascii = False),content_type ='application/json;charset=utf-8'), 200
	return result

def handle_error(message):
	return json_process_utf8({"error": True, "message": message}), 500
