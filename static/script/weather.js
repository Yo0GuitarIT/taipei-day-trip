let fetchWeather = () => {
  const cityData = { city: "Taipei" };
  fetch("/api/weather", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cityData),
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("请求失败");
      }
    })
    .then((weatherData) => {
      displayWeather(weatherData);
    })
    .catch((error) => {
      console.error(error);
    });
};

let displayWeather = (weatherData) => {
  const { icon, description } = weatherData.weather[0];
  const { temp, humidity } = weatherData.main;
  const { speed } = weatherData.wind;

  document.querySelector(".icon").src =
    "https://openweathermap.org/img/wn/" + icon + ".png";
  document.querySelector(".description").innerText = description;
  document.querySelector(".temp").innerText = temp + "°c";
  document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%";
  document.querySelector(".wind").innerText = "Wind Speed: " + speed + "km/h";
};

fetchWeather();