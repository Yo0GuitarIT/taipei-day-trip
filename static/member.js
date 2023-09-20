const signinBackground = document.querySelector(".signin-background");
const loginButton = document.getElementById("signin-screen");

const signinContainer = document.querySelector(".signin-main-container");
const exitButton1 = document.querySelector(".exit-img1");
const signinEmail = document.getElementById("signin-email");
const signinPassword = document.getElementById("signin-password");
const signinButton = document.querySelector(".signin-button");
const signupSwitchButton = document.querySelector(".switch-signup-mode");

const signupContainer = document.querySelector(".signup-main-container");
const exitButton2 = document.querySelector(".exit-img2");
const signupName = document.getElementById("signup-name");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const signupButton = document.getElementById("register-button");
const signinSwitchButton = document.querySelector(".switch-signin-mode");
const alertContainer = document.getElementById("alert-container");

loginButton.addEventListener("click", () => {
  signinBackground.style.display = "flex";
  setTimeout(() => {
    signinContainer.style.top = "80px";
  }, 1);
});

exitButton1.addEventListener("click", () => {
  signinContainer.style.top = "-400px";
  setTimeout(() => {
    signinBackground.style.display = "none";
  }, 400);
});

exitButton2.addEventListener("click", () => {
  signupContainer.style.top = "-400px";
  setTimeout(() => {
    signinBackground.style.display = "none";
  }, 400);
});

signupSwitchButton.addEventListener("click", () => {
  signinContainer.style.top = "-400px";
  setTimeout(() => {
    signupContainer.style.top = "80px";
  }, 400);
});

signinSwitchButton.addEventListener("click", () => {
  signupContainer.style.top = "-400px";
  setTimeout(() => {
    signinContainer.style.top = "80px";
  }, 400);
});

signupButton.addEventListener("click", () => {
  const registerData = {
    name: signupName.value,
    email: signupEmail.value,
    password: signupPassword.value,
  };

  fetch("/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerData),
  })
    .then((response) => response.json())
    .then((data) => {
      const errorMessage = data.message;
      const alertParagraph = document.createElement("p");
      alertContainer.appendChild(alertParagraph);

      if (data.error) {
        alertParagraph.textContent = errorMessage;
      } else {
        alertContainer.textContent = "註冊成功";
        signupName.value = "";
        signupEmail.value = "";
        signupPassword.value = "";

        setTimeout(() => {
          signupContainer.style.top = "-400px";
        }, 1000);
        setTimeout(() => {
          signinContainer.style.top = "80px";
          alertContainer.innerHTML = "";
        }, 1400);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});


signinButton.addEventListener("click", () => {
  const signinData = {
    email: signinEmail.value,
    password: signinPassword.value,
  };
  console.log(signinData);

  fetch("/api/user/auth", {
    method: "GET",
    headers: {
      Accept: "application/json",
      },
    body: JSON.stringify(signinData)
  })
    .then((response) => response.json())
    .then((data) => {
    //   // 在这里处理返回的会员信息
    //   if (data && data.data) {
    //     const memberData = data.data;
    //     // 在这里使用会员信息，例如显示会员的姓名和电子邮件
    //     console.log("会员ID:", memberData.id);
    //     console.log("会员姓名:", memberData.name);
    //     console.log("会员电子邮件:", memberData.email);
    //   } else {
    //     // 如果data为null，则表示未登录
    //     console.log("未登录");
    //   }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
