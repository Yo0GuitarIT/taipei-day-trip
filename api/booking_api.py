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

booking_info = Blueprint("booking_api",__name__)

@booking_info.route("/api/booking")
def booking():
    return "It's booking area"
    