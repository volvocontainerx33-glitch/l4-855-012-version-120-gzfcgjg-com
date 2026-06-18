(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === current);
      });
    }

    function startHero() {
      if (slides.length <= 1) {
        return;
      }

      clearInterval(timer);
      timer = setInterval(function () {
        setSlide(current + 1);
      }, 5000);
    }

    if (slides.length) {
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          setSlide(parseInt(dot.getAttribute("data-slide"), 10) || 0);
          startHero();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          setSlide(current - 1);
          startHero();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          setSlide(current + 1);
          startHero();
        });
      }

      startHero();
    }

    var searchInput = document.querySelector(".site-search");
    var items = Array.prototype.slice.call(document.querySelectorAll(".movie-card-item"));
    var emptyState = document.querySelector(".empty-state");

    function filterCards(value) {
      var keyword = (value || "").trim().toLowerCase();
      var visible = 0;

      items.forEach(function (item) {
        var haystack = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        item.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    if (searchInput && items.length) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (query) {
        searchInput.value = query;
        filterCards(query);
      }

      searchInput.addEventListener("input", function () {
        filterCards(searchInput.value);
      });
    }
  });
})();
