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

    function normalize(value) {
        return value
            .toLocaleLowerCase("ru-RU")
            .trim()
            .replace(/\s+/g, " ");
    }

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
                return b.dataset.date.localeCompare(a.dataset.date);
            }

            if (sortMode === "date-asc") {
                return a.dataset.date.localeCompare(b.dataset.date);
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
    }

    function resetFilters() {
        searchInput.value = "";
        categorySelect.value = "";
        sortSelect.value = "date-desc";
        applyFilters();
    }

    searchInput.addEventListener("input", applyFilters);
    categorySelect.addEventListener("change", applyFilters);
    sortSelect.addEventListener("change", applyFilters);
    resetButton.addEventListener("click", resetFilters);
    emptyResetButton.addEventListener("click", resetFilters);

    applyFilters();
});
