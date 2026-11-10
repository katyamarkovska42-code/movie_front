const API_URL = "http://127.0.0.1:8000/api";

const registerForm = document.getElementById("register-form");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const firstName = document.getElementById("first-name").value;
        const lastName = document.getElementById("last-name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const passwordConfirm = document.getElementById("password-confirm").value;

        const message = document.getElementById("auth-message");

        try {
            const response = await fetch(`${API_URL}/auth/register/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    password: password,
                    password_confirm: passwordConfirm
                })
            });

            const data = await response.json();

            if (response.ok) {
                message.textContent = "Реєстрація успішна! Тепер увійдіть.";
                message.style.color = "green";
                registerForm.reset();
            } else {
                message.textContent = JSON.stringify(data);
                message.style.color = "red";
            }
        } catch (error) {
            message.textContent = "Не вдалося підключитися до сервера.";
            message.style.color = "red";
        }
    });
}

const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const message = document.getElementById("auth-message");

        try {
            const response = await fetch(`${API_URL}/auth/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("access", data.access);
                localStorage.setItem("refresh", data.refresh);
                localStorage.setItem("username", username);

                window.location.href = "index.html";
            } else {
                message.textContent = "Неправильний логін або пароль.";
                message.style.color = "red";
            }
        } catch (error) {
            message.textContent = "Не вдалося підключитися до сервера.";
            message.style.color = "red";
        }
    });
}


async function refreshAccessToken() {
    const refresh = localStorage.getItem("refresh");

    if (!refresh) {
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/auth/refresh/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                refresh: refresh
            })
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();

        localStorage.setItem("access", data.access);

        if (data.refresh) {
            localStorage.setItem("refresh", data.refresh);
        }

        return true;

    } catch (error) {
        return false;
    }
}


const protectedPage = document.getElementById("welcome-message");

if (protectedPage) {
    async function checkAuthentication() {
        let access = localStorage.getItem("access");

        if (!access) {
            const refreshed = await refreshAccessToken();

            if (!refreshed) {
                window.location.href =
                    "login.html?next=protected.html";
                return;
            }

            access = localStorage.getItem("access");
        }

        const username = localStorage.getItem("username");

        protectedPage.textContent = `Вітаємо, ${username}!`;
    }

    checkAuthentication();
}



async function authorizedFetch(url, options = {}) {
    let access = localStorage.getItem("access");

    if (!access) {
        return null;
    }

    let response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            "Authorization": `Bearer ${access}`
        }
    });

    if (response.status === 401) {
        const refreshed = await refreshAccessToken();

        if (!refreshed) {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("username");

            window.location.href = "login.html";
            return null;
        }

        access = localStorage.getItem("access");

        response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                "Authorization": `Bearer ${access}`
            }
        });
    }

    return response;
}


const logoutButton = document.getElementById("logout-button");

if (logoutButton) {
    logoutButton.addEventListener("click", async function () {
        const refresh = localStorage.getItem("refresh");
        const access = localStorage.getItem("access");

        if (refresh && access) {
            try {
                await fetch(`${API_URL}/auth/logout/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${access}`
                    },
                    body: JSON.stringify({
                        refresh: refresh
                    })
                });
            } catch (error) {
                console.log("Помилка під час виходу:", error);
            }
        }

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("username");

        window.location.href = "login.html";
    });
}