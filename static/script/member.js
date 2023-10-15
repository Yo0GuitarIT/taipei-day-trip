const bookingDriectButton = document.getElementById("booking-screen");
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

const navContainerSlogan = document.getElementById("slogan");

let userInfo = {};

let handleResize = () => {
  let windowWidth =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  if (windowWidth < 510) {
    userWelcome.style.display = "none";
    navContainerSlogan.style.fontSize = "20px";
  } else {
    userWelcome.style.display = "block";
    navContainerSlogan.style.fontSize = "30px";
  }
};

let elementAnimation = (element) => {
  element.style.top = "-400px";
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

let openLoginPage = () => {
  signinBackground.style.display = "flex";
  setTimeout(() => {
    signinContainer.style.top = "80px";
  }, 1);
};

let isValidEmail = (email) => {
  let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(email);
};

let handleSignUp = () => {
  const registerData = {
    name: signupName.value,
    email: signupEmail.value,
    password: signupPassword.value,
  };
  if (
    registerData["name"] === "" ||
    registerData["email"] === "" ||
    registerData["password"] === ""
  ) {
    alertContainer2.textContent = "請完整填寫欄位";
    return;
  }

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
};

let handleSignIn = () => {
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

        setTimeout(() => {
          location.reload();
        }, 800);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

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
        bookingDriectButton.textContent = "預定行程";
        memberButton.textContent = "登入/註冊";

        bookingDriectButton.addEventListener("click", () => {
          alert("請先登入謝謝～");
        });
        memberButton.addEventListener("click", () => {
          openLoginPage();
        });
      } else {
        userWelcome.style.display = "block";
        userWelcome.textContent = `${data.data["name"]}，歡迎光臨`;
        memberButton.textContent = "登出系統";
        bookingDriectButton.textContent = "預定行程";

        bookingDriectButton.addEventListener("click", () => {
          window.location.href = "/booking";
        });
        memberButton.addEventListener("click", () => {
          localStorage.removeItem("token");
          userInfo = {};
          location.reload();
        });

        userInfo.name = data.data.name;
        userInfo.email = data.data.email;
      }
      handleResize();
    })
    .catch((error) => {
      console.error("發生錯誤:", error);
    });
};

signupButton.addEventListener("click", handleSignUp);
signinButton.addEventListener("click", handleSignIn);

signupPassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSignUp();
  }
});

signinPassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSignIn();
  }
});

exitButton1.addEventListener("click", () => {
  alertContainer1.textContent = "";
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

getCurrentUser();
window.addEventListener("resize", handleResize);
