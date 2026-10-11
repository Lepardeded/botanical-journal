document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector("#library-search");
    const categorySelect = document.querySelector("#library-category");
    const sortSelect = document.querySelector("#library-sort");
    const grid = document.querySelector("#library-grid");
    const count = document.querySelector("#library-result-count");
    const resetButton = document.querySelector("#library-reset");
    const emptyResetButton = document.querySelector("#library-empty-reset");
    const emptyMessage = document.querySelector("#library-empty");

    if (
        !searchInput ||
        !categorySelect ||
        !sortSelect ||
        !grid ||
        !count ||
        !resetButton ||
        !emptyResetButton ||
        !emptyMessage
    ) {
        return;
    }

    const cards = Array.from(grid.querySelectorAll(".library-card"));

    let searchTimer = null;
    let lastNoResultsState = "";

    function normalize(value) {
        return (value || "")
            .toLocaleLowerCase("ru-RU")
            .trim()
            .replace(/\s+/g, " ");
    }

    // Передача события в analytics.js.
    function track(eventName, parameters = {}) {
        if (
            window.BotanicalAnalytics &&
            typeof window.BotanicalAnalytics.track === "function"
        ) {
            window.BotanicalAnalytics.track(eventName, parameters);
        }
    }

    // Поиск, фильтрация и сортировка карточек.
    function applyFilters() {
        const query = normalize(searchInput.value);
        const category = categorySelect.value;

        const matchingCards = cards.filter((card) => {
            const searchableText = normalize([
                card.dataset.title,
                card.dataset.description,
                card.dataset.category,
                card.dataset.tags
            ].join(" "));

            const matchesQuery =
                !query || searchableText.includes(query);

            const matchesCategory =
                !category || card.dataset.category === category;

            return matchesQuery && matchesCategory;
        });

        const sortMode = sortSelect.value;

        matchingCards.sort((a, b) => {
            if (sortMode === "date-desc") {
                return (b.dataset.date || "").localeCompare(
                    a.dataset.date || ""
                );
            }

            if (sortMode === "date-asc") {
                return (a.dataset.date || "").localeCompare(
                    b.dataset.date || ""
                );
            }

            const titleA = normalize(a.dataset.title);
            const titleB = normalize(b.dataset.title);

            if (sortMode === "title-desc") {
                return titleB.localeCompare(titleA, "ru");
            }

            return titleA.localeCompare(titleB, "ru");
        });

        cards.forEach((card) => {
            card.hidden = true;
        });

        matchingCards.forEach((card) => {
            card.hidden = false;
            grid.appendChild(card);
        });

        count.textContent =
            `Материалов: ${matchingCards.length} из ${cards.length}`;

        emptyMessage.hidden = matchingCards.length !== 0;
        grid.hidden = matchingCards.length === 0;

        resetButton.hidden =
            !query && !category && sortMode === "date-desc";

        // Фиксируем отсутствие результатов.
        const noResultsState = JSON.stringify({
            query,
            category,
            sortMode
        });

        if (
            matchingCards.length === 0 &&
            noResultsState !== lastNoResultsState
        ) {
            track("library_no_results", {
                category: category || "all",
                sort: sortMode,
                query_length: query.length
            });
        }

        lastNoResultsState =
            matchingCards.length === 0 ? noResultsState : "";

        return matchingCards.length;
    }

    // Фиксируем поиск после паузы в наборе текста.
    function scheduleSearchAnalytics() {
        window.clearTimeout(searchTimer);

        searchTimer = window.setTimeout(() => {
            const query = normalize(searchInput.value);

            if (!query) {
                return;
            }

            track("library_search", {
                query_length: query.length,
                category: categorySelect.value || "all",
                results_count: cards.filter(
                    (card) => !card.hidden
                ).length
            });
        }, 500);
    }

    // Сброс всех настроек библиотеки.
    function resetFilters() {
        window.clearTimeout(searchTimer);

        searchInput.value = "";
        categorySelect.value = "";
        sortSelect.value = "date-desc";

        lastNoResultsState = "";

        applyFilters();
    }

    // Поиск.
    searchInput.addEventListener("input", () => {
        applyFilters();
        scheduleSearchAnalytics();
    });

    // Изменение категории.
    categorySelect.addEventListener("change", () => {
        applyFilters();

        track("library_filter_change", {
            category: categorySelect.value || "all"
        });
    });

    // Изменение сортировки.
    sortSelect.addEventListener("change", () => {
        applyFilters();

        track("library_sort_change", {
            sort: sortSelect.value
        });
    });

    // Сброс фильтров.
    resetButton.addEventListener("click", () => {
        track("library_reset");
        resetFilters();
    });

    emptyResetButton.addEventListener("click", () => {
        track("library_reset");
        resetFilters();
    });

    // Открытие статьи через ссылку в карточке.
    grid.addEventListener("click", (event) => {
        const target = event.target;

        if (!(target instanceof Element)) {
            return;
        }

        const link = target.closest("a");

        if (!link || !grid.contains(link)) {
            return;
        }

        const card = link.closest(".library-card");

        if (!card) {
            return;
        }

        track("article_open", {
            article_id:
                card.dataset.id ||
                link.getAttribute("href") ||
                "unknown",

            article_title:
                card.dataset.title ||
                link.textContent.trim()
        });
    });

    // Первоначальное отображение карточек.
    applyFilters();
});
