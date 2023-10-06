let loginStatus = () => {
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
    }).catch((error) => {
        console.error("發生錯誤", error);
        return false;
    });
    return true;
};

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
    if (loginStatus() === true) {
        const okMode = document.getElementById("ok-mode");
        const failMode = document.getElementById("fail-mode");
        const orderNumber = getOrderId();
        fetch(`/api/orders/${orderNumber}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then((data) => {
                const numberText = document.getElementById("order-id");
                okMode.style.display = "block";
                failMode.style.display = "none";
                numberText.textContent = `${data.data.number}`;
            })
            .catch((error) => {
                okMode.style.display = "none";
                failMode.style.display = "block";
                console.error(error.message);
            });
    } else {
        window.location.href = "/"
    };
};

fetchOrderDetails();
