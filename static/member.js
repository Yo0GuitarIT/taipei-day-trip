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

      if (data.error) {
        alertContainer2.textContent = errorMessage;
      } else {
        alertContainer2.textContent = "註冊成功";
        signupName.value = "";
        signupEmail.value = "";
        signupPassword.value = "";

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

        location.reload();
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

window.addEventListener("load", () => {
  getCurrentUser();
});
