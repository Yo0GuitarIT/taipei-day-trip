const morningRadio = document.getElementById("morning");
const afternoonRadio = document.getElementById("afternoon");
const tourCostText = document.getElementById("tour-cost");
const imgContainer = document.querySelector(".selection-img-box");
const imagesContainer = document.querySelector(".selection-img-container");
const bookingForm = document.querySelector(".booking-list");

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

let checkUserLoginStatus = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }
  return fetch("/api/user/auth", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then(() => {
      return true;
    })
    .catch((error) => {
      console.error("發生錯誤:", error);
      return false;
    });
};

let isDateValid=(selectedDate)=> {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); 
  return selectedDate >= currentDate;
}

let getIdFromCurrentPath = () => {
  const currentPath = window.location.pathname;
  const attractionIdMatch = currentPath.match(/\/attraction\/(\d+)/);
  if (attractionIdMatch) {
    const attractionId = attractionIdMatch[1];
    return attractionId;
  } else {
    console.error("Couldn't get attractionId");
    return null;
  }
};

let init = () => {
  const attractionId = getIdFromCurrentPath();
  const apiUrl = `/api/attraction/${attractionId}`;
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

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (checkUserLoginStatus()) {
    const attractionId = parseInt(getIdFromCurrentPath());
    const customDate = document.getElementById("custom-date-input").value;
    const selectedTime = document.querySelector(
      'input[name="time"]:checked'
    ).value;

    const selectedDate = new Date(customDate);

    if (!isDateValid(selectedDate)) {
      alert("請選擇有效日期。");
      return;
    }

    let price = 0;
    if (selectedTime === "morning") {
      price = 2000;
    } else if (selectedTime === "afternoon") {
      price = 2500;
    }

    const data = {
      attractionId: attractionId,
      date: customDate,
      time: selectedTime,
      price: price,
    };

    const token = localStorage.getItem("token");

    fetch("/api/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        window.location.href = "/booking";
      })
      .catch((error) => {
        console.error("預約失敗", error);
      });
  } else {
    openLoginPage();
  }
});

