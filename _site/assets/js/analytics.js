(function () {
    "use strict";

    /**
     * Botanical Journal — локальный слой веб-аналитики.
     *
     * Пока события не отправляются на сервер и не сохраняются:
     * они доступны через CustomEvent и отображаются в консоли.
     * Позже здесь можно подключить выбранный аналитический сервис.
     */

    window.BotanicalAnalytics = {
        track(eventName, parameters = {}) {
            const event = {
                event: eventName,
                page: window.location.pathname,
                timestamp: new Date().toISOString(),
                ...parameters
            };

            window.dispatchEvent(
                new CustomEvent("botanical:analytics", {
                    detail: event
                })
            );
        }
    };

    // Режим разработки: выводим события в консоль.
    // Не передавайте текст поисковых запросов или личные данные.
    window.addEventListener("botanical:analytics", (event) => {
        console.debug("[Botanical Analytics]", event.detail);
    });

    // Автоматически фиксируем просмотр библиотеки.
    const isLibraryPage =
        window.location.pathname.endsWith("/pages/library.html") ||
        window.location.pathname.endsWith("/library.html");

    if (isLibraryPage) {
        window.BotanicalAnalytics.track("library_view");
    }
})();
