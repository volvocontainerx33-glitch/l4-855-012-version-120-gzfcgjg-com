(function () {
    function qsAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    qsAll('[data-menu-toggle]').forEach(function (button) {
        button.addEventListener('click', function () {
            var menu = document.querySelector('[data-mobile-menu]');
            if (menu) {
                menu.classList.toggle('is-open');
            }
        });
    });

    qsAll('[data-hero-slider]').forEach(function (slider) {
        var slides = qsAll('[data-hero-slide]', slider);
        var dots = qsAll('[data-hero-dot]', slider);
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters(scope) {
        var queryInput = scope.querySelector('[data-filter-query]');
        var categorySelect = scope.querySelector('[data-filter-category]');
        var yearSelect = scope.querySelector('[data-filter-year]');
        var query = normalize(queryInput && queryInput.value);
        var category = categorySelect ? categorySelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var visible = 0;
        qsAll('[data-movie-card]', scope).forEach(function (card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.textContent
            ].join(' '));
            var cardCategory = card.getAttribute('data-category') || '';
            var cardYear = card.getAttribute('data-year') || '';
            var yearMatch = !year || (year === '2021' ? Number(cardYear) <= 2021 : cardYear === year);
            var matches = (!query || text.indexOf(query) !== -1) && (!category || cardCategory === category) && yearMatch;
            card.classList.toggle('is-hidden', !matches);
            if (matches) {
                visible += 1;
            }
        });
        var empty = scope.querySelector('[data-empty-state]');
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    qsAll('[data-filter-scope]').forEach(function (scope) {
        var queryInput = scope.querySelector('[data-filter-query]');
        var categorySelect = scope.querySelector('[data-filter-category]');
        var yearSelect = scope.querySelector('[data-filter-year]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (queryInput && q) {
            queryInput.value = q;
        }
        [queryInput, categorySelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', function () {
                    applyFilters(scope);
                });
                control.addEventListener('change', function () {
                    applyFilters(scope);
                });
            }
        });
        applyFilters(scope);
    });

    qsAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            if (!value) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });
}());
