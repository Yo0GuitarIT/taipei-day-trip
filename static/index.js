function scrollLeft() {
  const middleContainer = document.querySelector(".middle-container");
  middleContainer.scrollLeft -= 200;
}

function scrollRight() {
  const middleContainer = document.querySelector(".middle-container");
  middleContainer.scrollLeft += 200;
}

const scrollLeftButton = document.getElementById("scroll-left-button");
if (scrollLeftButton) {
  scrollLeftButton.addEventListener("click", () => {
    console.log("scrollLeftButton");
    scrollLeft();
  });
}

const scrollRightButton = document.getElementById("scroll-right-button");
if (scrollRightButton) {
  scrollRightButton.addEventListener("click", () => {
    console.log("scrollRightButton");
    scrollRight();
  });
}

function createAttractionContainers(containerSelector, numContainers) {
  const mainContainer = document.querySelector(containerSelector);

  for (let i = 1; i <= numContainers; i++) {
    const attractionContainer = document.createElement("div");
    attractionContainer.className = "attraction-container";

    const imgContainer = document.createElement("div");
    imgContainer.className = "attraction-img-container";

    const img = document.createElement("img");
    img.id = `attraction-image${i}`;
    img.className = "attraction-img";
    img.src = "";
    img.alt = "";

    const nameBox = document.createElement("div");
    nameBox.className = "attraction-name-box";

    const name = document.createElement("div");
    name.className = "attraction-name";

    const p = document.createElement("p");
    p.id = `attraction-name${i}`;
    p.className = "name-text body-bold";

    const textContainer = document.createElement("div");
    textContainer.className = "attraction-text-container";

    const mrtBox = document.createElement("div");
    mrtBox.className = "mrt-box";

    const mrtP = document.createElement("p");
    mrtP.id = `mrt${i}`;
    mrtP.className = "mrt-text";

    const categoryBox = document.createElement("div");
    categoryBox.className = "category-box";

    const categoryP = document.createElement("p");
    categoryP.id = `category${i}`;
    categoryP.className = "category-text";

    name.appendChild(p);
    nameBox.appendChild(name);
    imgContainer.appendChild(img);
    imgContainer.appendChild(nameBox);
    mrtBox.appendChild(mrtP);
    categoryBox.appendChild(categoryP);
    textContainer.appendChild(mrtBox);
    textContainer.appendChild(categoryBox);
    attractionContainer.appendChild(imgContainer);
    attractionContainer.appendChild(textContainer);

    mainContainer.appendChild(attractionContainer);
  }
}

function fetchAndFillAttractions(apiUrl) {
  fetch(apiUrl)
    .then((response) => response.json())
    .then((result) => {
      const data = result.data;
      const nextPage = result.nextPage;
      let numContainers = data.length;

      if (nextPage !== null) {
        numContainers -=1;
      }

      console.log(numContainers);

      createAttractionContainers(".main-container-attractions", numContainers);

      for (let i = 0; i < numContainers; i++) {
        const name = data[i]["name"];
        const mrt = data[i]["mrt"];
        const category = data[i]["category"];
        const imageUrl = data[i]["images"][0];

        const attractionName = document.getElementById(
          `attraction-name${i + 1}`
        );
        const attractionMrt = document.getElementById(`mrt${i + 1}`);
        const attractionCategory = document.getElementById(`category${i + 1}`);
        const attractionImage = document.getElementById(
          `attraction-image${i + 1}`
        );

        attractionName.textContent = name;
        attractionMrt.textContent = mrt;
        attractionCategory.textContent = category;
        attractionImage.src = imageUrl;
      }
    })
    .catch((error) => {
      console.error("發生錯誤：", error);
    });
}

function apiUrl(page) {
  return `http://127.0.0.1:3000/api/attractions?page=${page}`;
}

fetchAndFillAttractions(apiUrl(0));

// 添加滚动事件监听器
window.addEventListener('scroll', () => {
  // 获取页面的滚动位置
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY;
  const clientHeight = document.documentElement.clientHeight;
  let count = 0;

  // 判断是否已经滚动到了页面底部
  if (count == 0) {
    if (scrollTop + clientHeight >= scrollHeight) {
      fetchAndFillAttractions(apiUrl(1));
      count++;
    }
  }
  
});

