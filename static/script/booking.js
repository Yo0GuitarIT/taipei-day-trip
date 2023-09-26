let checkUserLoginStatus = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("未登錄，找不到令牌");
    window.location.href = "/";
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
      console.log(data.data);
    })

    .catch((error) => {
      console.error("發生錯誤", error);
    });
};

checkUserLoginStatus();


fetch("/api/booking", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => {
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error("获取预定信息失败");
    }
  })
  .then((bookingData) => {
    const attractionNameElement = document.getElementById("booking-attraction");
    const imgElement = document.getElementById("booking-img");
    const dateElement = document.getElementById("booking-date");
    const timeElement = document.getElementById("booking-time");
    const priceElement = document.getElementById("booking-price");
    const addressElement = document.getElementById("booking-address");
    const totalPriceElement = document.getElementById("booking-totalprice");
    


    attractionNameElement.textContent = `台北一日遊：${bookingData[0].data.attraction.name}`;
    imgElement.src = bookingData[0].data.attraction.image;
    dateElement.textContent = bookingData[0].date;
    timeElement.textContent = bookingData[0].time === 'morning' ? '上午九點到下午四點' : '下午四點到晚上九點';
    priceElement.textContent = `新台幣：${bookingData[0].price}元`;
    addressElement.textContent = bookingData[0].data.attraction.address;
    totalPriceElement.textContent = `總價：新台幣${bookingData[0].price}元`;

    // // 更新信用卡表单的总价
    // const checkoutPriceElement = document.querySelector(".checkout-price");
    // checkoutPriceElement.textContent = `總價：新台幣${bookingData.data.price}元`;
  })
  .catch((error) => {
    console.error("获取预定信息失败", error);
  });
