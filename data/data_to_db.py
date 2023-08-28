"""module for JSON encoder and decoder """
import json
import mysql.connector
from mysql.connector import pooling

# 資料庫連線設定
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "12345678",
    "database": "taipei_day_trip"
}

# 建立連線池
connection_pool = pooling.MySQLConnectionPool(
    pool_name = "my_pool",
    pool_size = 5,  # 設定連線池中的連線數量
    **db_config
)

# 從連線池中取得連線
connection = connection_pool.get_connection()

# 顯示連線成功訊息
print("Connected to MySQL database")

# 進行資料庫操作
# ...

# 釋放連線回連線池
connection.close()

# 顯示釋放連線訊息
print("Connection released to the pool")

def url_decoder(url_string):
    urls_split = url_string.split('https://')

    full_urls = []
    for url in urls_split:
        if url:
            full_url = 'https://' + url
            full_urls.append(full_url)
    return full_urls

def process_data(result):
    data_id = result['_id']
    name = result['name']
    category = result['CAT']
    description = result['description']
    address = result['address'].replace(' ', '')
    transport = result['direction']
    mrt = result['MRT']
    if mrt is None:
        mrt = ''
    latitude = float(result['latitude'])
    longitude = float(result['longitude'])
    images = url_decoder(result['file'])
    
    result_data = {"id": data_id,
                   "name": name,
                   "category": category,
                   "description": description,
                   "address": address,
                   "transport": transport,
                   "mrt": mrt,
                   "lat": latitude,
                   "lng": longitude,
                   "images": images}
    
    return result_data

BASE_PATH1 = '/Users/yo0.guitar27/Desktop'
BASE_PATH2 = '/WeHelp Bootcamp/Week 9/taipei-day-trip'
json_file_path = f'{BASE_PATH1}/{BASE_PATH2}/data/taipei-attractions.json'

with open(json_file_path, 'r', encoding="utf-8") as json_file:
    json_data = json.load(json_file)

all_result_data = []
for result in json_data['result']['results']:
    result_data = process_data(result)
    all_result_data.append(result_data)

# for data in all_result_data:
#     print(data)
#     print("\n")