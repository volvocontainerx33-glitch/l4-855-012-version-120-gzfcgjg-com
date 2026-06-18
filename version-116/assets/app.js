(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupHeader() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".menu-toggle");
    var mobile = document.querySelector(".mobile-nav");

    if (header) {
      var syncHeader = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 18);
      };
      syncHeader();
      window.addEventListener("scroll", syncHeader, { passive: true });
    }

    if (toggle && mobile && header) {
      toggle.addEventListener("click", function () {
        var open = mobile.classList.toggle("is-open");
        header.classList.toggle("menu-open", open);
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
  }

  function setupCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var prev = carousel.querySelector(".hero-prev");
      var next = carousel.querySelector(".hero-next");
      var index = Math.max(0, slides.findIndex(function (slide) {
        return slide.classList.contains("is-active");
      }));
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function play() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          play();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          play();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          play();
        });
      });

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", play);
      show(index);
      play();
    });
  }

  function setupFilters() {
    document.querySelectorAll(".library-panel").forEach(function (panel) {
      var input = panel.querySelector(".movie-search");
      var year = panel.querySelector(".year-filter");
      var type = panel.querySelector(".type-filter");
      var cards = Array.prototype.slice.call(panel.querySelectorAll(".movie-card"));

      function filter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";

        cards.forEach(function (card) {
          var text = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.type,
            card.dataset.year
          ].join(" ").toLowerCase();

          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchYear = !yearValue || card.dataset.year === yearValue;
          var matchType = !typeValue || card.dataset.type === typeValue;
          card.classList.toggle("is-hidden", !(matchKeyword && matchYear && matchType));
        });
      }

      if (input) {
        input.addEventListener("input", filter);
      }
      if (year) {
        year.addEventListener("change", filter);
      }
      if (type) {
        type.addEventListener("change", filter);
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && input) {
        input.value = query;
        filter();
      }
    });
  }

  function initMoviePlayer(source) {
    var video = document.getElementById("movieVideo");
    var button = document.getElementById("moviePlayButton");
    var attached = false;
    var hls = null;

    function attach() {
      if (!video || attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function begin() {
      if (!video) {
        return;
      }
      attach();
      if (button) {
        button.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", begin);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
          button.classList.remove("is-hidden");
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  }

  window.initMoviePlayer = initMoviePlayer;

  ready(function () {
    setupHeader();
    setupCarousels();
    setupFilters();
  });
})();
