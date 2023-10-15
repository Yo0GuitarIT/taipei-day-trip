const appId = "137063";
const appKey =
  "app_O1zPbzPj1itJ7WKu8RKckUQrbjFWiVfVGTWW1Gbwvn5O50DsoUceUSclvn9I";

const phoneInput = document.getElementById("user-phone");

TPDirect.setupSDK(appId, appKey, "sandbox");
const displayCCVFields = {
  number: {
    element: document.getElementById("card-number"),
    placeholder: "**** **** **** ****",
  },
  expirationDate: {
    element: document.getElementById("card-expiration-date"),
    placeholder: "MM / YY",
  },
  ccv: {
    element: document.getElementById("card-ccv"),
    placeholder: "ccv",
  },
};

const styles = {
  input: { color: "gray" },
  "input.ccv": { "font-size": "16px" },
  "input.expiration-date": { "font-size": "16px" },
  "input.card-number": { "font-size": "16px" },
  ":focus": { color: "black" },
  ".valid": { color: "green" },
  ".invalid": { color: "red" },
};

TPDirect.card.setup({
  fields: displayCCVFields,
  styles: styles,
  isMaskCreditCardNumber: true,
  maskCreditCardNumberRange: {
    beginIndex: 6,
    endIndex: 11,
  },
});

let bookingResult = {};

let fieldContact = () => {
  const nameInput = document.getElementById("user-name");
  nameInput.value = userInfo.name;
  const emailInput = document.getElementById("user-email");
  emailInput.value = userInfo.email;
};

let showLoadingOverlay = () => {
  const overlay = document.getElementById("overlay");
  overlay.style.display = "flex";
};

let getAttractionsInfo = () => {
  fieldContact();
  if (userInfo.bookingData !== null) {
    const price = userInfo.bookingData.price;
    const date = userInfo.bookingData.date;
    const time = userInfo.bookingData.time;
    const attractionInfo = userInfo.bookingData.data.attraction;
    const order = {
      price: price,
      trip: {
        attraction: attractionInfo,
        date: date,
        time: time,
      },
      date: date,
      time: time,
    };
    bookingResult.order = order;
  }
};

let getContactInfo = () => {
  const bookingName = document.getElementById("user-name").value;
  const bookingEmail = document.getElementById("user-email").value;
  const bookingPhone = document.getElementById("user-phone").value;

  const contact = {
    name: bookingName,
    email: bookingEmail,
    phone: bookingPhone,
  };
  return contact;
};

let fetchOrdersApi = (bookingResult) => {
  const dataSent = JSON.stringify(bookingResult);
  showLoadingOverlay();

  fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: dataSent,
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("訂單創建失敗");
      }
    })
    .then((data) => {
      console.log("訂單已成功創建：", data);
      orderSerial = data.data.order_id;
      window.location.href = `/thankyou?number=${orderSerial}`;
    })
    .catch((error) => {
      console.error("發生錯誤：", error);
    });
};

phoneInput.addEventListener("input", () => {
  phoneInput.value = phoneInput.value.replace(/\D/g, "");
  if (phoneInput.value.length > 10) {
    phoneInput.value = phoneInput.value.slice(0, 10);
  }
  if (phoneInput.value.length === 10) {
    phoneInput.style.color = "green";
  }
});

document.getElementById("checkout-button").addEventListener("click", () => {
  const tappayStatus = TPDirect.card.getTappayFieldsStatus();
  console.log("TapPay Fields Status:", tappayStatus);

  TPDirect.card.getPrime((result) => {
    if (result.status !== 0) {
      console.error("getPrime error");
      window.alert("請完整填寫資訊～");
      return;
    }
    if (phoneInput.value.length < 10) {
      window.alert("請完整填寫手機資訊～");
      return;
    }
    const prime = result.card.prime;
    const contact = getContactInfo();
    bookingResult.prime = prime;
    bookingResult.contact = contact;

    console.log(bookingResult);

    fetchOrdersApi(bookingResult);
  });
});

setTimeout(() => {
  getAttractionsInfo();
}, 300);
