(function () {
  "use strict";

  var rootPrefix = document.body ? document.body.getAttribute("data-root") || "./" : "./";

  function buildUrl(path) {
    if (!path) {
      return rootPrefix;
    }
    if (/^(https?:)?\/\//.test(path)) {
      return path;
    }
    return rootPrefix + path.replace(/^\.\//, "");
  }

  function closeAllSearchResults(except) {
    document.querySelectorAll("[data-search-results]").forEach(function (box) {
      if (box !== except) {
        box.classList.remove("is-open");
      }
    });
  }

  function renderSearchResults(input, resultsBox, query) {
    var movies = window.SITE_MOVIES || [];
    var normalized = query.trim().toLowerCase();

    if (!normalized) {
      resultsBox.innerHTML = "";
      resultsBox.classList.remove("is-open");
      return;
    }

    var words = normalized.split(/\s+/).filter(Boolean);
    var matches = movies.filter(function (movie) {
      var text = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.category
      ].join(" ").toLowerCase();

      return words.every(function (word) {
        return text.indexOf(word) !== -1;
      });
    }).slice(0, 12);

    if (!matches.length) {
      resultsBox.innerHTML = '<div class="search-result-item"><div></div><span>没有找到匹配影片</span></div>';
      resultsBox.classList.add("is-open");
      return;
    }

    resultsBox.innerHTML = matches.map(function (movie) {
      return [
        '<a class="search-result-item" href="' + buildUrl(movie.url) + '">',
        '  <img src="' + buildUrl(movie.image) + '" alt="' + escapeHtml(movie.title) + '">',
        '  <span>',
        '    <strong>' + escapeHtml(movie.title) + '</strong>',
        '    <span>' + escapeHtml(movie.year + " · " + movie.region + " · " + movie.category) + '</span>',
        '  </span>',
        '</a>'
      ].join("");
    }).join("");

    resultsBox.classList.add("is-open");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-main-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initSearch() {
    document.querySelectorAll(".site-search-input").forEach(function (input) {
      var form = input.closest("form");
      var resultsBox = form ? form.querySelector("[data-search-results]") : null;

      if (!resultsBox) {
        return;
      }

      input.addEventListener("input", function () {
        closeAllSearchResults(resultsBox);
        renderSearchResults(input, resultsBox, input.value);
      });

      input.addEventListener("focus", function () {
        if (input.value.trim()) {
          renderSearchResults(input, resultsBox, input.value);
        }
      });

      if (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          var first = resultsBox.querySelector("a");
          if (first) {
            window.location.href = first.href;
          }
        });
      }
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest(".site-search")) {
        closeAllSearchResults(null);
      }
    });
  }

  function initLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    var list = document.querySelector("[data-card-list]");
    var count = document.querySelector("[data-filter-count]");

    if (!input || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute("data-search-text") || "";
        var show = keyword === "" || text.indexOf(keyword) !== -1;
        card.hidden = !show;

        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    });
  }

  function initImageFallback() {
    document.addEventListener("error", function (event) {
      var target = event.target;

      if (!target || target.tagName !== "IMG") {
        return;
      }

      target.classList.add("image-fallback");
      target.removeAttribute("srcset");
      target.alt = target.alt || "影片封面";
    }, true);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initHero();
    initSearch();
    initLocalFilter();
    initImageFallback();
  });
})();
