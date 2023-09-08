const mainContainerAttractions = document.querySelector(
  ".main-container-attractions"
);
const mainContainer = document.querySelector(".main-container");


// create mrt list elements
let createListItems = (mrtData) => {
  const middleContainer = document.querySelector(".middle-container");
  mrtData.forEach((stationName, index) => {
    const listItem = document.createElement("div");
    listItem.className = "list-item";

    const button = document.createElement("button");
    button.className = `list-text `;
    button.id = `station${index + 1}`;
    button.textContent = stationName;
    button.value = stationName;

    button.addEventListener('click', function () {
      console.log(button.value);

      while (mainContainerAttractions.firstChild) {
        mainContainerAttractions.removeChild(mainContainerAttractions.firstChild);
      }
      fetchAndFillAttractions(0, button.value);
    })

    listItem.appendChild(button);
    middleContainer.appendChild(listItem);
  });
};

//fetch mrt data
let fetchMrtInfo = () => {
  const apiUrl = "/api/mrts";
  fetch(apiUrl)
    .then((response) => response.json())
    .then((result) => {
      let mrtData = result.data;
      mrtData = mrtData.filter((element) => element !== "None");
      createListItems(mrtData);
    })
    .catch((error) => {
      console.error("發生錯誤：", error);
    });
};


//use buttons for list
let scrollLeft = () => {
  const middleContainer = document.querySelector(".middle-container");
  middleContainer.scrollLeft -= 200;
};

let scrollRight = () => {
  const middleContainer = document.querySelector(".middle-container");
  middleContainer.scrollLeft += 200;
};

let addButtonClickListener = (buttonId, clickHandler) => {
  const button = document.getElementById(buttonId);
  if (button) {
    button.addEventListener("click", clickHandler);
  }
};

addButtonClickListener("scroll-left-button", () => {
  scrollLeft();
});

addButtonClickListener("scroll-right-button", () => {
  scrollRight();
});

// search function
const inputField = document.querySelector(".search-input-text");
const searchButton = document.querySelector(".search-button-box");
let isSearchMode = false;
let handleSearch = () => {
  const searchText = inputField.value;
  isSearchMode = true;
  currentPage = 0;
  nextPageAvailable = true;
  while (mainContainerAttractions.firstChild) {
    mainContainerAttractions.removeChild(mainContainerAttractions.firstChild);
  }
  fetchAndFillAttractions(currentPage, searchText);
};

searchButton.addEventListener("click", handleSearch);
inputField.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

// create Attractions Element
let createAttractionContainers = (numContainers, startIndex) => {
  for (let i = 1 + startIndex; i <= numContainers + startIndex; i++) {
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

    mainContainerAttractions.appendChild(attractionContainer);
  }
};

//fetch Api and fill information
let startIndex = 0;
let fetchAndFillAttractions = (page, keyword) => {
  const apiUrl = `/api/attractions?page=${page}&keyword=${keyword}`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((result) => {
      const data = result.data;
      const nextPage = result.nextPage;
      let numContainers = data.length;
      toggleNotFound(false);

      if (data.length === 0) {
        toggleNotFound(true);
      }

      if (nextPage !== null) {
        numContainers -= 1;
      } else {
        nextPageAvailable = false;
      }
      startIndex = 12 * page;

      createAttractionContainers(numContainers, startIndex);

      for (let i = 0; i < numContainers; i++) {
        const name = data[i]["name"];
        const mrt = data[i]["mrt"];
        const category = data[i]["category"];
        const imageUrl = data[i]["images"][0];
        let classNumber = i + 1;

        const attractionName = document.getElementById(
          `attraction-name${classNumber + startIndex}`
        );
        const attractionMrt = document.getElementById(
          `mrt${classNumber + startIndex}`
        );
        const attractionCategory = document.getElementById(
          `category${classNumber + startIndex}`
        );
        const attractionImage = document.getElementById(
          `attraction-image${classNumber + startIndex}`
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
};


// if scroll to bottom ,load more
let currentPage = 0;
let nextPageAvailable = true;
let scrollListener = () => {
  console.log(
    "SearchMode: ",
    isSearchMode,
    "currentPage:",
    currentPage,
    "pageAvailable",
    nextPageAvailable
  );
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY;
  const clientHeight = document.documentElement.clientHeight;
  if (scrollTop + clientHeight >= scrollHeight && nextPageAvailable) {
    currentPage++;

    if (isSearchMode) {
      const searchText = inputField.value;
      fetchAndFillAttractions(currentPage, searchText);
    } else {
      fetchAndFillAttractions(currentPage, "");
    }
  }
};


let toggleNotFound = (isVisible) => {
  var element = document.querySelector(".not-found-box");

  if (element) {
    element.style.display = isVisible ? "flex" : "none";
  }
}

//page initial
fetchMrtInfo();
fetchAndFillAttractions(currentPage, "");
window.addEventListener("scroll", scrollListener);