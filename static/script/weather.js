let weather = {
    apiKey: "99637571efbd1288b5b43df68797c6da",
    fetchWeather: function (city) {
        fetch(
            "https://api.openweathermap.org/data/2.5/weather?q="
            + city
            + "&units=metric&appid="
            + this.apiKey
        )
            .then((response) => response.json())
            .then((data) => this.displayWeather(data));
    },
    displayWeather: function (data) {
        const { icon, description } = data.weather[0];
        const { temp, humidity } = data.main;
        const { speed } = data.wind;
        document.querySelector(".icon").src = "https://openweathermap.org/img/wn/" + icon + ".png"
        document.querySelector(".description").innerText = description;
        document.querySelector(".temp").innerText = temp + "°c";
        document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%";
        document.querySelector(".wind").innerText = "Wind Speed: " + speed + "km/h";
    }
}

weather.fetchWeather("Taipei");
