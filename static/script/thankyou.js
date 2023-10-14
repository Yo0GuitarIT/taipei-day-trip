let getOrderId = () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("number")) {
    const orderNumber = urlParams.get("number");
    return orderNumber;
  } else {
    throw new error("Not found");
  }
};

let fetchOrderDetails = () => {
  setTimeout(() => {
    if (Object.keys(userInfo).length > 0) {
      const okMode = document.getElementById("ok-mode");
      const failMode = document.getElementById("fail-mode");
      const vertifyImg = document.querySelector(".vertify-img-container");
      const nonVerifyImg = document.querySelector(".non-vertify-img-container");
      const orderInfo = document.querySelector(".order-info");
      const failOrderInfo = document.querySelector(".fail-order-info");
      const numberText = document.getElementById("order-id");
      const orderNumber = getOrderId();
      fetch(`/api/orders/${orderNumber}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          okMode.style.display = "block";
          failMode.style.display = "none";
          numberText.textContent = `${data.data.number}`;

          vertifyImg.setAttribute("data-aos", "zoom-in");
          orderInfo.setAttribute("data-aos", "fade-up");
          orderInfo.setAttribute("data-aos-delay", "200");
          AOS.init();
        })
        .catch((error) => {
          okMode.style.display = "none";
          failMode.style.display = "block";

          nonVerifyImg.setAttribute("data-aos", "zoom-in");
          failOrderInfo.setAttribute("data-aos", "fade-up");
          failOrderInfo.setAttribute("data-aos-delay", "200");

          AOS.init();

          console.error("發生錯誤：", error);
        });
    } else {
      window.location.href = "/";
    }
  }, 50);
};

fetchOrderDetails();
