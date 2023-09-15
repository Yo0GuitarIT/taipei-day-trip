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

select_mrt = Blueprint("mrt_api",__name__)

@select_mrt.route("/api/attractions")
def api_attractions():
	try:
		page = int(request.args.get("page", 0)) 
		keyword = request.args.get("keyword", None)  

		if keyword == "test_error":
			raise ValueError("This is a test error")
		
		query = """
		SELECT a.id, a.name, c.category_style, a.description, a.address, a.transport,
			m.station_name AS mrt, a.lat, a.lng, GROUP_CONCAT(i.url) AS images
		FROM attractions AS a
		LEFT JOIN category AS c ON a.category_id = c.id
		LEFT JOIN mrt AS m ON a.mrt_id = m.id
		LEFT JOIN image_urls AS i ON a.id = i.attraction_id
		"""
		params = ()
		if keyword:
			query += "WHERE m.station_name = %s "
			params = (keyword,)
			
			query += "OR a.name LIKE %s "
			params += (f"%{keyword}%",)
		else:
			query += "WHERE 1 "  
		
		start_index = page * 12
		index_number = 13
		query += "GROUP BY a.id LIMIT %s, %s;"
		params += (start_index, index_number)

		attractions = execute_query(query, params)

		data = []
		for data_info in attractions:
			info = {
				"id": data_info['id'],
				"name": data_info['name'],
				"category": data_info['category_style'],
				"description": data_info['description'],
				"address": data_info['address'],
				"transport": data_info['transport'],
				"mrt": data_info['mrt'],
				"lat": float(data_info['lat']),
				"lng": float(data_info['lng']),
				"images": data_info['images'].split(',')
				}
			
			
			data.append(info)
		nextPage = None if len(data) < 13 else page + 1
		result = {
			"nextPage": nextPage, 
			"data": data}
		
		print(data[4])

		result = json_process_utf8(result)
		return result
	
	except ValueError as error:
		return handle_error("伺服器內部錯誤")

@select_mrt.route("/api/attraction/<int:attractionId>")
def api_attraction_id(attractionId):
	try:
		if attractionId == 12345678:
			raise ValueError("This is a test error")
		
		
		
		query = """
         SELECT a.id, a.name, c.category_style, a.description, a.address, a.transport,
             m.station_name AS mrt, a.lat, a.lng, GROUP_CONCAT(i.url) AS images
        FROM attractions AS a
        LEFT JOIN category AS c ON a.category_id = c.id
        LEFT JOIN mrt AS m ON a.mrt_id = m.id
        LEFT JOIN image_urls AS i ON a.id = i.attraction_id
        WHERE a.id = %s
        GROUP BY a.id;
        """

		attractions = execute_query(query,(attractionId,))

		if not attractions:
			return json_process_utf8({"error": True, "message": "景點編號不正確"}), 400
		
		data = []
		for data_info in attractions:
			info = {
				"id": data_info['id'],
				"name": data_info['name'],
				"category": data_info['category_style'],
				"description": data_info['description'],
				"address": data_info['address'],
				"transport": data_info['transport'],
				"mrt": data_info['mrt'],
				"lat": float(data_info['lat']),
				"lng": float(data_info['lng']),
				"images": data_info['images'].split(',')
				}
			data.append(info)
		result = {"data": data}
		
		result = json_process_utf8(result)
		return result

	except ValueError as error:
		return handle_error("伺服器內部錯誤")

@select_mrt.route('/api/mrts')
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