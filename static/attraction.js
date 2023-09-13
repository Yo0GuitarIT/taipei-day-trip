let currentImageIndex = 0;
function changeImage(step) {
  const imageSlider = document.querySelector(".selection-img-box");
  const selectionImages = document.querySelectorAll(".selection-img");
  console.log(selectionImages);
  currentImageIndex += step;
  if (currentImageIndex < 0) {
    currentImageIndex = selectionImages.length - 1;
  } else if (currentImageIndex >= selectionImages.length) {
    currentImageIndex = 0;
  }
  imageSlider.style.transform = `translateX(-${currentImageIndex * 100}%)`;
}

function createSelectionImages(images) {
  const imgContainer = document.querySelector(".selection-img-box");
  imgContainer.innerHTML = "";

  const imagesContainer = document.querySelector(".selection-img-container");

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
      }
    };
    imgContainer.appendChild(imgElement);
  });
}

function loadAttractionDetails(attractionData) {
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
  createSelectionImages(images);
}

const apiUrl = `/api/attraction/${id}`;
fetch(apiUrl)
  .then((response) => response.json())
  .then((data) => {
    const attractionData = data["data"][0];
    loadAttractionDetails(attractionData);
  })
  .catch((error) => {
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
  });

changeImage(0);
