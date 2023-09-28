const checkUserLoginStatus = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("未登錄，找不到令牌");
    window.location.href = "/";
    return false;
  }
  fetch("/api/user/auth", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        window.location.href = "/";
        throw new Error("未登錄或無效的令牌");
      }
    })
    .then((data) => {
      const userName = document.getElementById("user-name");
      userName.textContent = `您好，${data.data.name}，待預定的行程如下：`;
      // console.log(data.data.id);
    })
    .catch((error) => {
      console.error("發生錯誤", error);
    });
  return true;
};

let loadingBookingInfo = () => {
  if (!checkUserLoginStatus()) {
    return;
  }

  fetch("/api/booking", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("預定訊息失败");
      }
    })
    .then((bookingData) => {
      console.log(typeof bookingData);
      updateBookingInfo(bookingData);
    })
    .catch((error) => {
      console.error("發生錯誤", error);
    });
};

function setupDeleteButton() {
  const deleteButton = document.getElementById("delete-button");
  deleteButton.addEventListener("click", () => {
    if (!checkUserLoginStatus()) {
      return;
    }
    fetch("/api/booking", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          console.log("预定已成功删除");
          location.reload();
        } else {
          console.error("删除预定失败");
        }
      })
      .catch((error) => {
        console.error("發生錯誤", error);
      });
  });
}

function createBookingElement(bookingInfo) {
  const sectionContainer = document.querySelector(".section-container");

  const imgContainer = document.createElement("div");
  imgContainer.className = "img-container";
  const imgElement = document.createElement("img");
  imgElement.id = "booking-img";
  imgElement.src = bookingInfo.data.attraction.image;
  imgElement.alt = "";
  imgContainer.appendChild(imgElement);

  const infoContainer = document.createElement("div");
  infoContainer.className = "info-container";
  const deleteButton = document.createElement("img");
  deleteButton.id = "delete-button";
  deleteButton.src = "/static/images/delete-icon.png";
  deleteButton.alt = "";
  infoContainer.appendChild(deleteButton);

  const infoTitle = document.createElement("div");
  infoTitle.className = "info-title body-bold";
  const attractionParagraph = document.createElement("p");
  attractionParagraph.id = "booking-attraction";
  infoTitle.appendChild(attractionParagraph);
  infoContainer.appendChild(infoTitle);

  const infoDate = document.createElement("div");
  infoDate.className = "info-date";
  const dateBoldParagraph = document.createElement("p");
  dateBoldParagraph.className = "body-bold";
  dateBoldParagraph.textContent = "日期：";
  const dateParagraph = document.createElement("p");
  dateParagraph.id = "booking-date";
  infoDate.appendChild(dateBoldParagraph);
  infoDate.appendChild(dateParagraph);
  infoContainer.appendChild(infoDate);

  const infoTime = document.createElement("div");
  infoTime.className = "info-time";
  const timeBoldParagraph = document.createElement("p");
  timeBoldParagraph.className = "body-bold";
  timeBoldParagraph.textContent = "時間：";
  const timeParagraph = document.createElement("p");
  timeParagraph.id = "booking-time";
  infoTime.appendChild(timeBoldParagraph);
  infoTime.appendChild(timeParagraph);
  infoContainer.appendChild(infoTime);

  const infoCost = document.createElement("div");
  infoCost.className = "info-cost";
  const costBoldParagraph = document.createElement("p");
  costBoldParagraph.className = "body-bold";
  costBoldParagraph.textContent = "費用：";
  const costParagraph = document.createElement("p");
  costParagraph.id = "booking-price";
  infoCost.appendChild(costBoldParagraph);
  infoCost.appendChild(costParagraph);
  infoContainer.appendChild(infoCost);

  const infoPlace = document.createElement("div");
  infoPlace.className = "info-place";
  const placeBoldParagraph = document.createElement("p");
  placeBoldParagraph.className = "body-bold";
  placeBoldParagraph.textContent = "地點：";
  const placeParagraph = document.createElement("p");
  placeParagraph.id = "booking-address";
  infoPlace.appendChild(placeBoldParagraph);
  infoPlace.appendChild(placeParagraph);
  infoContainer.appendChild(infoPlace);

  sectionContainer.appendChild(imgContainer);
  sectionContainer.appendChild(infoContainer);
}

let updateBookingInfo = (bookingData) => {
  const bookingInfoElement = document.getElementById("booking-info");
  const noBookingInfo = document.getElementById("no-booking-info");

  if (bookingData.length !== 0) {
    const bookingInfo = bookingData[0];

    createBookingElement(bookingInfo);
    setupDeleteButton();
    const attractionNameElement = document.getElementById("booking-attraction");
    const imgElement = document.getElementById("booking-img");
    const dateElement = document.getElementById("booking-date");
    const timeElement = document.getElementById("booking-time");
    const priceElement = document.getElementById("booking-price");
    const addressElement = document.getElementById("booking-address");
    const totalPriceElement = document.getElementById("booking-totalprice");

    attractionNameElement.textContent = `台北一日遊：${bookingInfo.data.attraction.name}`;
    imgElement.src = bookingInfo.data.attraction.image;
    dateElement.textContent = bookingInfo.date;
    timeElement.textContent =
      bookingInfo.time === "morning"
        ? "上午九點到下午四點"
        : "下午四點到晚上九點";
    priceElement.textContent = `新台幣：${bookingInfo.price}元`;
    addressElement.textContent = bookingInfo.data.attraction.address;
    totalPriceElement.textContent = `總價：新台幣${bookingInfo.price}元`;

    noBookingInfo.style.display = "none";
  } else {
    bookingInfoElement.style.display = "none";
    noBookingInfo.style.display = "block";
  }
};

const creditCardInput = document.getElementById("credit-card-input");
creditCardInput.addEventListener("input", () => {
  const inputText = creditCardInput.value.replace(/\s/g, "");
  let maskedText = "";
  for (let i = 0; i < inputText.length; i++) {
    if (i < 2) {
      maskedText += inputText[i];
    } else {
      maskedText += "*";
    }
    if ((i + 1) % 4 === 0 && i + 1 !== inputText.length) {
      maskedText += " ";
    }
  }
  creditCardInput.value = maskedText;
});

loadingBookingInfo();
