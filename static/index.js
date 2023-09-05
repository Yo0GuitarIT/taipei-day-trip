const apiUrl = "http://127.0.0.1:3000/api/attractions";

fetch(apiUrl)
  .then((response) => response.json())
  .then((result) => {
    const data = result.data[0];
    const name = data["name"];
    const mrt = data["mrt"];
    const category = data["category"];
    const imageUrl = data["images"][0];

    const attractionName = document.getElementById("attraction-name");
    const attractionMrt = document.getElementById("mrt");
    const attractionCategory = document.getElementById("category");
    const attractionImage = document.getElementById("attraction-image");
    attractionName.textContent = name;
    attractionMrt.textContent = mrt;
    attractionCategory.textContent = category;
    attractionImage.src = imageUrl;
  })
  .catch((error) => {
    console.error("發生錯誤：", error);
  });

document.addEventListener("DOMContentLoaded", function () {
  const scrollLeftButton = document.getElementById("scroll-left-button");
  const scrollRightButton = document.getElementById("scroll-right-button");
  const middleContainer = document.querySelector(".middle-container");

  // 左滾動按鈕點擊事件
  scrollLeftButton.addEventListener("click", () => {
    console.log("scrollLeftButton");
    middleContainer.scrollLeft -= 200; // 滾動 100 像素
  });

  // 右滾動按鈕點擊事件
  scrollRightButton.addEventListener("click", () => {
    console.log("scrollRightButton");
    middleContainer.scrollLeft += 200; // 滾動 100 像素
  });
});
