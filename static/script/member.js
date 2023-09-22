const signinBackground = document.querySelector(".signin-background");
const memberButton = document.getElementById("signin-screen");
const userWelcome = document.getElementById("user-welcome");

const signinContainer = document.querySelector(".signin-main-container");
const exitButton1 = document.querySelector(".exit-img1");
const signinEmail = document.getElementById("signin-email");
const signinPassword = document.getElementById("signin-password");
const signinButton = document.querySelector(".signin-button");
const signupSwitchButton = document.querySelector(".switch-signup-mode");
const alertContainer1 = document.getElementById("alert-container1");

const signupContainer = document.querySelector(".signup-main-container");
const exitButton2 = document.querySelector(".exit-img2");
const signupName = document.getElementById("signup-name");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const signupButton = document.getElementById("register-button");
const signinSwitchButton = document.querySelector(".switch-signin-mode");
const alertContainer2 = document.getElementById("alert-container2");

let handleResize = () => {
  let windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (windowWidth < 500) {
    userWelcome.style.display = 'none';
  } else {
    userWelcome.style.display = 'block';
  }
}

let elementAnimation = (element) => {
  element.style.top = "-400px";
  console.log("PPP");
  setTimeout(() => {
    signinBackground.style.display = "none";
  }, 400);
};

let switchAnimation = (fade_out_element, fade_in_element) => {
  fade_out_element.style.top = "-400px";
  setTimeout(() => {
    fade_in_element.style.top = "80px";
  }, 400);
};

exitButton1.addEventListener("click", () => {
  elementAnimation(signinContainer);
});

exitButton2.addEventListener("click", () => {
  elementAnimation(signupContainer);
});

signupSwitchButton.addEventListener("click", () => {
  switchAnimation(signinContainer, signupContainer);
});

signinSwitchButton.addEventListener("click", () => {
  switchAnimation(signupContainer, signinContainer);
});

let isValidEmail = (email) => {
  let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(email);
}

// // 使用示例
// var emailToCheck = "example@example.com";
// if (isValidEmail(emailToCheck)) {
//   console.log(emailToCheck + " 是有效的电子邮件地址");
// } else {
//   console.log(emailToCheck + " 不是有效的电子邮件地址");
// }


signupButton.addEventListener("click", () => {
  const registerData = {
    name: signupName.value,
    email: signupEmail.value,
    password: signupPassword.value,
  };

  console.log(registerData);

  if (registerData["name"] === "" || registerData["email"] === "" || registerData["password"] === "") {
    alertContainer2.textContent = "請完整填寫欄位";
    return;
  };

  if (!isValidEmail(registerData["email"])) {
    alertContainer2.textContent = "請完整填寫正確E-mail";
    return;
  }

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

      if (data.error) {
        alertContainer2.textContent = errorMessage;
      } else {
        alertContainer2.textContent = "註冊成功";
        signupName.value = "";
        signupEmail.value = "";
        signupPassword.value = "";
        signinEmail.value = "";
        signinPassword.value = "";
        alertContainer1.textContent = "";

        setTimeout(() => {
          signupContainer.style.top = "-400px";
        }, 1000);
        setTimeout(() => {
          signinContainer.style.top = "80px";
          alertContainer2.innerHTML = "";
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

  fetch("/api/user/auth", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(signinData),
  })
    .then((response) => response.json())
    .then((data) => {
      const errorMessage = data.message;

      if (data.error) {
        alertContainer1.textContent = errorMessage;
        signinEmail.value = "";
        signinPassword.value = "";
      } else {
        alertContainer1.textContent = "登入成功";

        localStorage.setItem("token", data.token);

        signinEmail.value = "";
        signinPassword.value = "";

        setTimeout(() => { location.reload(); }, 800);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

let getCurrentUser = () => {
  const token = localStorage.getItem("token");

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
        throw new Error("未登錄或無效的令牌");
      }
    })
    .then((data) => {
      if (data.data === null) {
        userWelcome.style.display = "none";
        memberButton.textContent = "登入/註冊";
        memberButton.addEventListener("click", () => {
          signinBackground.style.display = "flex";
          setTimeout(() => {
            signinContainer.style.top = "80px";
          }, 1);
        });
      } else {
        userWelcome.style.display = "block";
        userWelcome.textContent = `${data.data["name"]}，歡迎光臨`;
        memberButton.textContent = "登出系統";

        memberButton.addEventListener("click", () => {
          localStorage.removeItem("token");
          location.reload();
        });
      }

      console.log(data.data);
    })
    .catch((error) => {
      console.error("發生錯誤:", error);
    });
};

window.addEventListener('resize', handleResize);
window.addEventListener("load", () => {
  getCurrentUser();
  handleResize();
});
