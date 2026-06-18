(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
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

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function cardText(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-genre") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-type") || ""
    ].join(" ").toLowerCase();
  }

  function setupFilters() {
    var input = document.querySelector(".js-filter-input");
    var yearSelect = document.querySelector("[data-filter-year]");
    var sortSelect = document.querySelector("[data-sort-select]");
    var container = document.querySelector("[data-card-container]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (input && query) {
      input.value = query;
    }

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      cards.forEach(function (card) {
        var matchesKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
        var matchesYear = !year || card.getAttribute("data-year") === year;
        card.classList.toggle("is-filter-hidden", !(matchesKeyword && matchesYear));
      });
    }

    function sortCards() {
      if (!sortSelect || !container) {
        return;
      }
      var value = sortSelect.value;
      if (value === "default") {
        cards.sort(function (a, b) {
          return 0;
        });
      }
      if (value === "year-desc") {
        cards.sort(function (a, b) {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
      }
      if (value === "year-asc") {
        cards.sort(function (a, b) {
          return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
        });
      }
      if (value === "score-desc") {
        cards.sort(function (a, b) {
          var left = b.querySelector(".score-badge, .ranking-score, .rank-score");
          var right = a.querySelector(".score-badge, .ranking-score, .rank-score");
          return Number(left ? left.textContent : 0) - Number(right ? right.textContent : 0);
        });
      }
      cards.forEach(function (card) {
        container.appendChild(card);
      });
      filterCards();
    }

    if (input) {
      input.addEventListener("input", filterCards);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", filterCards);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", sortCards);
    }
    filterCards();
  }

  window.setupMoviePlayer = function (streamUrl) {
    ready(function () {
      var video = document.getElementById("moviePlayer");
      var overlay = document.getElementById("playOverlay");
      if (!video || !streamUrl) {
        return;
      }
      var hls = null;
      var attached = false;

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      }

      function playVideo() {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      function attachAndPlay() {
        hideOverlay();
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (!video.getAttribute("src")) {
            video.setAttribute("src", streamUrl);
          }
          playVideo();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!attached) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            attached = true;
          } else {
            playVideo();
          }
          return;
        }
        if (!video.getAttribute("src")) {
          video.setAttribute("src", streamUrl);
        }
        playVideo();
      }

      if (overlay) {
        overlay.addEventListener("click", attachAndPlay);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          attachAndPlay();
        }
      });
      video.addEventListener("play", hideOverlay);
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
