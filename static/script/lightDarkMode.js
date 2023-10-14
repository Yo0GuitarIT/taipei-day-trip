// 获取模式切换开关和样式表
const modeToggle = document.getElementById("mode-toggle");
const darkModeStylesheet = document.getElementById("darkModeStylesheet");

const currentTheme = localStorage.getItem("theme");

if (currentTheme) {
  if (currentTheme === "dark") {
    darkModeStylesheet.disabled = false;
    modeToggle.checked = true;
  }
}

modeToggle.addEventListener("change", function () {
  if (modeToggle.checked) {
    darkModeStylesheet.disabled = false;
    localStorage.setItem("theme", "dark"); 
  } else {
    darkModeStylesheet.disabled = true;
    localStorage.setItem("theme", "light"); 
  }
});
