
const API_URL = "http://127.0.0.1:8000/api/movies/";

const moviesList = document.getElementById("movies-list");
const statusMessage = document.getElementById("status");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search");
const yearInput = document.getElementById("year");
const sortSelect = document.getElementById("sort");
const resetButton = document.getElementById("reset-button");


// Завантаження фільмів з API
async function loadMovies() {
    statusMessage.textContent = "Завантаження каталогу...";
    moviesList.replaceChildren();

    const url = new URL(API_URL);

    // Пошук фільму
    if (searchInput.value.trim()) {
        url.searchParams.set("search", searchInput.value.trim());
    }

    // Фільтрація за роком
    if (yearInput.value.trim()) {
        url.searchParams.set("year", yearInput.value.trim());
    }

    // Сортування
    if (sortSelect.value) {
        url.searchParams.set("sort_by", sortSelect.value);
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP-помилка: ${response.status}`);
        }

        const data = await response.json();

        // Підтримка звичайного списку та пагінації DRF
        let movies;

        if (Array.isArray(data)) {
            movies = data;
        } else if (data.results && Array.isArray(data.results)) {
            movies = data.results;
        } else {
            throw new Error("API повернуло дані в неочікуваному форматі.");
        }

        if (movies.length === 0) {
            showEmptyState();
            statusMessage.textContent = "Фільмів не знайдено.";
            return;
        }

        statusMessage.textContent =
            `У каталозі знайдено фільмів: ${movies.length}`;

        displayMovies(movies);

    } catch (error) {
        console.error("Помилка завантаження:", error);

        statusMessage.textContent =
            "Не вдалося завантажити каталог. Перевір підключення до сервера.";

        showErrorState();
    }
}


// Відображення карток фільмів
function displayMovies(movies) {
    moviesList.replaceChildren();

    movies.forEach((movie, index) => {

        const card = document.createElement("article");
        card.className = "movie-card";

        // Обкладинка
        const cover = document.createElement("div");
        cover.className = "movie-cover";

        const coverNumber = document.createElement("span");
        coverNumber.className = "movie-cover-number";
        coverNumber.textContent =
            `FILM ${String(index + 1).padStart(2, "0")}`;

        const coverTitle = document.createElement("span");
        coverTitle.className = "movie-cover-title";
        coverTitle.textContent = movie.title || "Без назви";

        const coverBottom = document.createElement("span");
        coverBottom.className = "movie-cover-bottom";
        coverBottom.textContent = "MOVIEGRID";

        cover.append(coverNumber, coverTitle, coverBottom);

        // Основна інформація
        const content = document.createElement("div");
        content.className = "movie-content";

        const meta = document.createElement("div");
        meta.className = "movie-meta";

        const year = document.createElement("span");
        year.textContent = movie.year || "Рік невідомий";

        const rating = document.createElement("span");
        rating.className = "movie-rating";

        rating.textContent =
            movie.rating !== null && movie.rating !== undefined
                ? `★ ${movie.rating}`
                : "★ Без оцінки";

        meta.append(year, rating);

        const title = document.createElement("h3");
        title.textContent = movie.title || "Без назви";

        const director = document.createElement("p");
        director.className = "movie-director";

        director.textContent =
            `Режисер: ${movie.director_name || "Не вказано"}`;

        const description = document.createElement("p");
        description.className = "movie-description";

        description.textContent =
            movie.description || "Опис фільму поки відсутній.";

        content.append(meta, title, director, description);

        card.append(cover, content);

        moviesList.append(card);
    });
}


// Повідомлення, якщо фільмів немає
function showEmptyState() {
    const empty = document.createElement("div");
    empty.className = "empty-state";

    const title = document.createElement("h3");
    title.textContent = "Поки що нічого не знайдено";

    const description = document.createElement("p");
    description.textContent =
        "Спробуй змінити пошуковий запит або очистити фільтри.";

    empty.append(title, description);

    moviesList.replaceChildren(empty);
}


// Повідомлення про помилку
function showErrorState() {
    const error = document.createElement("div");
    error.className = "empty-state";

    const title = document.createElement("h3");
    title.textContent = "Не вдалося завантажити фільми";

    const description = document.createElement("p");
    description.textContent =
        "Переконайся, що Django-сервер запущений.";

    error.append(title, description);

    moviesList.replaceChildren(error);
}


// Обробка пошуку
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loadMovies();
});


// Очищення фільтрів
resetButton.addEventListener("click", () => {
    searchInput.value = "";
    yearInput.value = "";
    sortSelect.value = "";

    loadMovies();
});


// Початкове завантаження каталогу
loadMovies();
