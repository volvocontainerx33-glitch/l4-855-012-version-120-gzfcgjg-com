(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function filterCards(query) {
    var q = normalize(query);
    var cards = document.querySelectorAll("[data-movie-card]");
    var empty = document.querySelector("[data-empty-state]");
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search"));
      var match = !q || text.indexOf(q) !== -1;
      card.classList.toggle("is-hidden", !match);
      if (match) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("is-hidden", visible !== 0);
    }
  }

  function sortCards(mode) {
    var grid = document.querySelector("[data-card-grid]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
    cards.sort(function (a, b) {
      if (mode === "year-asc") {
        return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
      }
      if (mode === "title") {
        return a.getAttribute("data-title").localeCompare(b.getAttribute("data-title"), "zh-Hans-CN");
      }
      return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
    });
    cards.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  ready(function () {
    var nav = document.querySelector("[data-nav]");
    var toggle = document.querySelector("[data-menu-toggle]");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    document.querySelectorAll("[data-hero-next]").forEach(function (button) {
      button.addEventListener("click", function () {
        showSlide(current + 1);
      });
    });

    document.querySelectorAll("[data-hero-prev]").forEach(function (button) {
      button.addEventListener("click", function () {
        showSlide(current - 1);
      });
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
      });
    });

    if (slides.length) {
      showSlide(0);
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var pageSearch = document.querySelector("[data-page-search]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (pageSearch) {
      pageSearch.value = initialQuery;
      filterCards(initialQuery);
      pageSearch.addEventListener("input", function () {
        filterCards(pageSearch.value);
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (document.body.getAttribute("data-page") === "catalog") {
          event.preventDefault();
          filterCards(value);
          var url = value ? "./movies.html?q=" + encodeURIComponent(value) : "./movies.html";
          window.history.replaceState(null, "", url);
          if (pageSearch) {
            pageSearch.value = value;
          }
        }
      });
    });

    var sortSelect = document.querySelector("[data-sort-select]");
    if (sortSelect) {
      sortCards(sortSelect.value);
      sortSelect.addEventListener("change", function () {
        sortCards(sortSelect.value);
      });
    }
  });
})();
