import json

BASE_PATH1 = '/Users/yo0.guitar27/Desktop'
BASE_PATH2 = '/WeHelp Bootcamp/Week 9/taipei-day-trip'
json_file_path = f'{BASE_PATH1}/{BASE_PATH2}/data/taipei-attractions.json'

with open(json_file_path, 'r', encoding='utf-8') as json_file:
    json_data = json.load(json_file)


for result in json_data['result']['results']:
    for key, value in result.items():
        if value is None or value == "":
            print(f"Empty value found in '{key}' for ID {result['_id']}")
