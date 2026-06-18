function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function createHlsPlayer(videoId, overlayId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  if (!video || !overlay || !source) {
    return;
  }

  var hls = null;
  var started = false;

  function start() {
    overlay.classList.add("is-hidden");

    if (!started) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      started = true;
    }

    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  overlay.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
}

ready(function () {
  var header = document.querySelector("[data-site-header]");
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  function setHeaderState() {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
  }

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
  var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));

  function valueOf(name) {
    var item = filters.find(function (filter) {
      return filter.getAttribute("data-filter") === name;
    });
    return item ? item.value.trim().toLowerCase() : "";
  }

  function applyFilters() {
    var query = searchInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean).join(" ");
    var year = valueOf("year");
    var region = valueOf("region");
    var type = valueOf("type");

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();

      var matched = true;
      if (query && haystack.indexOf(query) === -1) {
        matched = false;
      }
      if (year && String(card.getAttribute("data-year")).toLowerCase() !== year) {
        matched = false;
      }
      if (region && String(card.getAttribute("data-region")).toLowerCase() !== region) {
        matched = false;
      }
      if (type && String(card.getAttribute("data-type")).toLowerCase() !== type) {
        matched = false;
      }
      card.classList.toggle("is-hidden-card", !matched);
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", applyFilters);
  });
  filters.forEach(function (filter) {
    filter.addEventListener("change", applyFilters);
  });
});
