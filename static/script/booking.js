let checkUserLoginStatus = () => {
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
      const userName = document.getElementById("user-name-text");
      userName.textContent = `您好，${data.data.name}，待預定的行程如下：`;
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
      updateBookingInfo(bookingData);
    })
    .catch((error) => {
      console.error("發生錯誤", error);
    });
};

let setupDeleteButton = (index) => {
  const deleteButton = document.getElementById(`delete-button${index}`);
  deleteButton.addEventListener("click", () => {
    if (!checkUserLoginStatus()) {
      return;
    }
    const dataToDelete = {
      sessionData: index,
    };
    fetch("/api/booking", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(dataToDelete),
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

let createBookingElement = (bookingInfo, index) => {
  const bookingSection = document.getElementById("booking-section");
  const sectionContainer = document.createElement("div");
  sectionContainer.className = "section-container"
  sectionContainer.setAttribute("data-aos", "fade-right");
  sectionContainer.setAttribute("data-aos-delay","200");

  const imgContainer = document.createElement("div");
  imgContainer.className = "img-container";
  const imgElement = document.createElement("img");
  imgElement.id = `booking-img${index}`;
  imgElement.src = bookingInfo.data.attraction.image;
  imgElement.alt = "";
  imgContainer.appendChild(imgElement);

  const infoContainer = document.createElement("div");
  infoContainer.className = "info-container";
  const deleteButton = document.createElement("img");
  deleteButton.id = `delete-button${index - 1}`;
  deleteButton.src = "/static/images/delete-icon.png";
  deleteButton.alt = "";
  infoContainer.appendChild(deleteButton);

  const infoTitle = document.createElement("div");
  infoTitle.className = "info-title body-bold";
  const attractionParagraph = document.createElement("p");
  attractionParagraph.id = `booking-attraction${index}`;
  infoTitle.appendChild(attractionParagraph);
  infoContainer.appendChild(infoTitle);

  const infoDate = document.createElement("div");
  infoDate.className = "info-date";
  const dateBoldParagraph = document.createElement("p");
  dateBoldParagraph.className = "body-bold";
  dateBoldParagraph.textContent = "日期：";
  const dateParagraph = document.createElement("p");
  dateParagraph.id = `booking-date${index}`;
  infoDate.appendChild(dateBoldParagraph);
  infoDate.appendChild(dateParagraph);
  infoContainer.appendChild(infoDate);

  const infoTime = document.createElement("div");
  infoTime.className = "info-time";
  const timeBoldParagraph = document.createElement("p");
  timeBoldParagraph.className = "body-bold";
  timeBoldParagraph.textContent = "時間：";
  const timeParagraph = document.createElement("p");
  timeParagraph.id = `booking-time${index}`;
  infoTime.appendChild(timeBoldParagraph);
  infoTime.appendChild(timeParagraph);
  infoContainer.appendChild(infoTime);

  const infoCost = document.createElement("div");
  infoCost.className = "info-cost";
  const costBoldParagraph = document.createElement("p");
  costBoldParagraph.className = "body-bold";
  costBoldParagraph.textContent = "費用：";
  const costParagraph = document.createElement("p");
  costParagraph.id = `booking-price${index}`;
  infoCost.appendChild(costBoldParagraph);
  infoCost.appendChild(costParagraph);
  infoContainer.appendChild(infoCost);

  const infoPlace = document.createElement("div");
  infoPlace.className = "info-place";
  const placeBoldParagraph = document.createElement("p");
  placeBoldParagraph.className = "body-bold";
  placeBoldParagraph.textContent = "地點：";
  const placeParagraph = document.createElement("p");
  placeParagraph.id = `booking-address${index}`;
  infoPlace.appendChild(placeBoldParagraph);
  infoPlace.appendChild(placeParagraph);
  infoContainer.appendChild(infoPlace);

  sectionContainer.appendChild(imgContainer);
  sectionContainer.appendChild(infoContainer);

  bookingSection.appendChild(sectionContainer);
}

let updateBookingInfo = (bookingData) => {
  const bookingInfoElement = document.getElementById("booking-info");
  const noBookingInfo = document.getElementById("no-booking-info");
  const totalPriceElement = document.getElementById("booking-totalprice");

  if (bookingData.length !== 0) {
    bookingInfoElement.style.display = "block";
    noBookingInfo.style.display = "none";

    let totalprice = 0;
    for (let i = 0; i < bookingData.length; i++) {
      const bookingInfo = bookingData[i];

      createBookingElement(bookingInfo, i + 1);
      setupDeleteButton(i);

      const attractionNameElement = document.getElementById(`booking-attraction${i + 1}`);
      const imgElement = document.getElementById(`booking-img${i + 1}`);
      const dateElement = document.getElementById(`booking-date${i + 1}`);
      const timeElement = document.getElementById(`booking-time${i + 1}`);
      const priceElement = document.getElementById(`booking-price${i + 1}`);
      const addressElement = document.getElementById(`booking-address${i + 1}`);
      

      attractionNameElement.textContent = `台北一日遊：${bookingInfo.data.attraction.name}`;
      imgElement.src = bookingInfo.data.attraction.image;
      dateElement.textContent = bookingInfo.date;
      timeElement.textContent =
        bookingInfo.time === "morning"
          ? "上午九點到下午四點"
          : "下午四點到晚上九點";
      priceElement.textContent = `新台幣：${bookingInfo.price}元`;
      addressElement.textContent = bookingInfo.data.attraction.address;

      totalprice += bookingInfo.price
      totalPriceElement.textContent = `總價：新台幣${totalprice}元`;
    }

  } else {
    bookingInfoElement.style.display = "none";
    noBookingInfo.style.display = "block";
  }
};

loadingBookingInfo();
