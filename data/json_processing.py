""" json_processing.py """
import json
json_file_path = "/Users/mac/Desktop/taipei-day-trip/data/taipei-attractions.json"

def process_metadata(json_results, key):
    data_set = set()
    for item in json_results:
        data = item[key]
        if data == "其\u3000\u3000他":
            data = "其他"
        if data is None :
            data = "None"
        data_set.add(data)
    data_dict = {data: i+1 for i, data in enumerate(data_set)}
    return data_dict

def process_url_data(json_results, data_id, data_link):
    url_dict = {}
    for result in json_results:
        image_id = result[data_id]
        image_link = result[data_link]
        urls_split = image_link.split("https://")
        full_urls = ["https://" + url for url in urls_split if url]     
        filtered_urls = []
        for url in full_urls:
            if url.lower().endswith((".jpg", ".png")):
                filtered_urls.append(url)
        for number in filtered_urls:
            url_dict[number] = image_id
    return url_dict

def process_data(attraction_result, mrt_dict, category_dict):
    data_id = attraction_result["_id"]
    name = attraction_result["name"]
    category = attraction_result["CAT"]
    if category == "其\u3000\u3000他":
        category = "其他"
    description = attraction_result["description"]
    address = attraction_result["address"].replace(" ", "")
    transport = attraction_result["direction"]
    mrt = attraction_result["MRT"]
    if mrt is None:
        mrt = "None"
    latitude = float(attraction_result["latitude"])
    longitude = float(attraction_result["longitude"])
    attractions_data = {"id": data_id,
                   "name": name,
                   "category": category_dict.get("category, "),
                   "description": description,
                   "address": address,
                   "transport": transport,
                   "mrt": mrt_dict.get("mrt, "),
                   "lat": latitude,
                   "lng": longitude,
                   }
    return attractions_data

def main():
    with open(json_file_path, "r", encoding="utf-8") as json_file:
        json_data = json.load(json_file)["result"]["results"]

    mrt_dict = process_metadata(json_data, "MRT")
    category_dict = process_metadata(json_data, "CAT")
    url_dict = process_url_data(json_data, "_id", "file")

    attraction_list = []
    for result in json_data:
        result_data = process_data(result, mrt_dict, category_dict)
        attraction_list.append(result_data)

    return attraction_list, mrt_dict, category_dict, url_dict