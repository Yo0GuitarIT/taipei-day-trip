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
      console.log(data.data.name);
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

let updateBookingInfo = (bookingData) => {
  console.log(bookingData);
  const attractionNameElement = document.getElementById("booking-attraction");
  const imgElement = document.getElementById("booking-img");
  const dateElement = document.getElementById("booking-date");
  const timeElement = document.getElementById("booking-time");
  const priceElement = document.getElementById("booking-price");
  const addressElement = document.getElementById("booking-address");
  const totalPriceElement = document.getElementById("booking-totalprice");
  const bookingInfoElement = document.getElementById("booking-info");
  const noBookingInfo = document.getElementById("no-booking-info");

  if (bookingData !== null) {
    const bookingInfo = bookingData;
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
