const morningRadio = document.getElementById("morning");
const afternoonRadio = document.getElementById("afternoon");
const tourCostText = document.getElementById("tour-cost");
const imgContainer = document.querySelector(".selection-img-box");
const imagesContainer = document.querySelector(".selection-img-container");

let currentImageIndex = 0;

let updateTourCost = (checkedRadio, costText) => {
  if (checkedRadio === morningRadio) {
    costText.textContent = "新台幣2000元";
  } else if (checkedRadio === afternoonRadio) {
    costText.textContent = "新台幣2500元";
  }
};

let changeImage = (step) => {
  const selectionImages = document.querySelectorAll(".selection-img");
  currentImageIndex += step;
  if (currentImageIndex < 0) {
    currentImageIndex = selectionImages.length - 1;
  } else if (currentImageIndex >= selectionImages.length) {
    currentImageIndex = 0;
  }
  imgContainer.style.transform = `translateX(-${currentImageIndex * 100}%)`;
  fillColorToDot(currentImageIndex);
};

let fillColorToDot = (targetDotIndex) => {
  const carouselDots = document.querySelectorAll(".carousel-dot");
  carouselDots.forEach((dot, index) => {
    if (index === targetDotIndex) {
      dot.style.backgroundColor = "#000";
    } else {
      dot.style.backgroundColor = "var(--additional)";
    }
  });
};

let createDotElements = (images) => {
  const numImages = images.length;
  const dotContainer = document.createElement("div");
  dotContainer.className = "carousel-dot-container";
  for (let i = 0; i < numImages; i++) {
    const dotElement = document.createElement("span");
    dotElement.className = "carousel-dot";
    dotElement.setAttribute("data-index", i);
    dotElement.addEventListener("click", () => {
      const dataIndex = parseInt(dotElement.getAttribute("data-index"));
      changeImage(dataIndex - currentImageIndex);
      fillColorToDot(dataIndex);
    });
    dotContainer.appendChild(dotElement);
  }
  imagesContainer.appendChild(dotContainer);
};

let createImageElements = (images) => {
  imgContainer.innerHTML = "";
  const loadingImg = document.createElement("div");
  loadingImg.className = "loading-img";
  imagesContainer.appendChild(loadingImg);

  let firstImageLoaded = false;
  images.forEach((image, index) => {
    const imgElement = document.createElement("img");
    imgElement.className = "selection-img";
    imgElement.src = image;
    imgElement.alt = "";
    imgElement.id = `selection-img${index + 1}`;
    imgElement.onload = () => {
      if (!firstImageLoaded) {
        firstImageLoaded = true;
        imgContainer.style.display = "flex";
        loadingImg.style.display = "none";
        fillColorToDot(0);
      }
    };
    imgContainer.appendChild(imgElement);
  });
};

let loadAttractionDetails = (attractionData) => {
  const { name, category, description, address, transport, mrt, images } =
    attractionData;

  const titleElement = document.querySelector(".dialog-title");
  const categoryMrtElement = document.querySelector(".category-and-mrt");
  const mainDescriptionElement = document.querySelector(".main-description");
  const infoText = document.querySelector(".info-title-text");
  const infoTransport = document.querySelector(".transport p:nth-child(2)");

  titleElement.textContent = name;
  categoryMrtElement.textContent = `${category} at ${mrt}`;
  mainDescriptionElement.textContent = description;
  infoText.textContent = address;
  infoTransport.textContent = transport;
  createImageElements(images);
  createDotElements(images);
};

let handleError = (error) => {
  console.error("發生錯誤：", error);

  const wrapper = document.querySelector(".wrapper");
  wrapper.innerHTML = "";

  const notFoundImage = document.createElement("img");
  const notFoundBox = document.createElement("div");
  notFoundImage.className = "not-found";
  notFoundImage.src = "/static/images/not-found.png";
  notFoundImage.alt = "Not Found";
  notFoundBox.className = "not-found-box";
  notFoundBox.appendChild(notFoundImage);
  wrapper.appendChild(notFoundBox);

  const footerElement = document.createElement("footer");
  footerElement.className = "footer";
  const divElement = document.createElement("div");
  divElement.className = "footer-content";
  const pElement = document.createElement("p");
  pElement.className = "footer-text body-bold";
  pElement.textContent = "COPYRIGHT © 2021 台北一日遊";
  divElement.appendChild(pElement);
  footerElement.appendChild(divElement);
  wrapper.appendChild(footerElement);
};

let getApiUrlFromCurrentPath = () => {
  const currentPath = window.location.pathname;
  const attractionIdMatch = currentPath.match(/\/attraction\/(\d+)/);
  if (attractionIdMatch) {
    const attractionId = attractionIdMatch[1];
    return `/api/attraction/${attractionId}`;
  } else {
    console.error("Couldn't get attractionId");
    return null;
  }
};

let init = () => {
  const apiUrl = getApiUrlFromCurrentPath();
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const attractionData = data["data"][0];
      loadAttractionDetails(attractionData);
    })
    .catch(handleError);

  changeImage(0);
};

window.addEventListener("load", init);

morningRadio.addEventListener("change", () => {
  updateTourCost(morningRadio, tourCostText);
});

afternoonRadio.addEventListener("change", () => {
  updateTourCost(afternoonRadio, tourCostText);
});
