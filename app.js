
const API_URL = "http://127.0.0.1:8000/api/movies/";

const moviesList = document.getElementById("movies-list");
const statusMessage = document.getElementById("status");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search");

async function loadMovies(search = "") {
    statusMessage.textContent = "Завантаження...";
    moviesList.replaceChildren();

    const url = new URL(API_URL);

    if (search.trim()) {
        url.searchParams.set("search", search.trim());
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP-помилка: ${response.status}`);
        }

        const movies = await response.json();

        if (movies.length === 0) {
            statusMessage.textContent = "Фільмів не знайдено.";
            return;
        }

        statusMessage.textContent = `Знайдено фільмів: ${movies.length}`;

        for (const movie of movies) {
            const card = document.createElement("article");
            card.className = "movie-card";

            const title = document.createElement("h3");
            title.textContent = movie.title;

            const director = document.createElement("p");
            director.textContent =
                `Режисер: ${movie.director_name || "Не вказано"}`;

            const year = document.createElement("p");
            year.textContent =
                `Рік: ${movie.release_year || "Не вказано"}`;

            const rating = document.createElement("p");
            rating.textContent =
                `Рейтинг: ${movie.rating ?? "Не оцінено"}`;

            const synopsis = document.createElement("p");
            synopsis.textContent = movie.synopsis || "Опис відсутній.";

            card.append(title, director, year, rating, synopsis);
            moviesList.append(card);
        }
    } catch (error) {
        statusMessage.textContent =
            "Не вдалося завантажити каталог. Перевір, чи запущено бекенд.";
        console.error(error);
    }
}

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loadMovies(searchInput.value);
});

loadMovies();
