''' database_writer.py '''
import mysql.connector
from json_processing import main  
from mysql.connector import pooling

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

def write_to_mrt_table():
    for mrt_name , mrt_id in mrt_dict.items():
        insert_mrt_query = "INSERT INTO mrt (id, station_name) VALUES (%s, %s)"
        cursor.execute(insert_mrt_query, (mrt_id, mrt_name))
        connection.commit()
    
def write_to_category_table():
    for category_type , category_id in category_dict.items():        
        insert_category_query = "INSERT INTO category (id, category_style) VALUES (%s, %s)"
        cursor.execute(insert_category_query, (category_id, category_type))
        connection.commit()

def write_to_images_table():
    id_counters = 1
    for url,attraction_id in url_dict.items():
        insert_images_query = "INSERT INTO image_urls (id, url, attraction_id) VALUES (%s, %s, %s)"
        cursor.execute(insert_images_query, (id_counters, url, attraction_id))
        connection.commit()
        id_counters+=1


def write_to_attractions_table():
    for result in attraction_list:
        info_id = result['id']
        name = result['name']
        category_id = result['category']
        description = result['description']
        address = result['address']
        transport = result['transport']
        mrt_id = result['mrt']
        lat = result['lat']
        lng = result['lng']
        
        insert_attractions_query = "INSERT INTO attractions (id, name, category_id, description, address, transport, mrt_id, lat, lng) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
        cursor.execute(insert_attractions_query, (info_id, name, category_id, description, address, transport, mrt_id, lat, lng))
        connection.commit()

        

def clear_table(table_name):      
    cursor = connection.cursor()
    delete_query = f"DELETE FROM {table_name}"
    cursor.execute(delete_query)
    connection.commit()
    print(f"Data in table {table_name} has been cleared.")
        


if __name__ == "__main__":
    attraction_list, mrt_dict, category_dict, url_dict = main()
    

    connection = connection_pool.get_connection()
    cursor = connection.cursor()

    clear_table("image_urls")
    clear_table("attractions")
    clear_table("mrt")
    clear_table("category")

    write_to_mrt_table()
    write_to_category_table()
    write_to_attractions_table()
    write_to_images_table()

    cursor.close()
    connection.close()