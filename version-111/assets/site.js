(function () {
  var mobileButton = document.querySelector('.mobile-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (mobileButton && mobileMenu) {
    mobileButton.addEventListener('click', function () {
      var opened = mobileMenu.classList.toggle('is-open');
      mobileButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var panel = scope.previousElementSibling && scope.previousElementSibling.querySelector('[data-filter-panel]')
      ? scope.previousElementSibling.querySelector('[data-filter-panel]')
      : document.querySelector('[data-filter-panel]');
    var input = panel ? panel.querySelector('[data-search-input]') : null;
    var year = panel ? panel.querySelector('[data-year-filter]') : null;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matchedText = !query || text.indexOf(query) !== -1;
        var matchedYear = !selectedYear || cardYear === selectedYear;
        card.hidden = !(matchedText && matchedYear);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (year) {
      year.addEventListener('change', applyFilter);
    }
  });

  document.querySelectorAll('.watch-panel').forEach(function (panel) {
    var video = panel.querySelector('video[data-stream]');
    var trigger = panel.querySelector('.video-trigger');
    var tabs = Array.prototype.slice.call(panel.querySelectorAll('.stream-tab'));

    if (!video) {
      return;
    }

    function setStream(stream) {
      if (!stream) {
        return;
      }

      if (video._hlsPlayer) {
        video._hlsPlayer.destroy();
        video._hlsPlayer = null;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hlsPlayer = hls;
      } else {
        video.src = stream;
      }
    }

    function playStream(stream) {
      setStream(stream || video.getAttribute('data-stream'));
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (trigger) {
            trigger.classList.remove('is-hidden');
          }
        });
      }
    }

    if (trigger) {
      trigger.addEventListener('click', function () {
        playStream(video.getAttribute('data-stream'));
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (item) {
          item.classList.remove('is-active');
        });
        tab.classList.add('is-active');
        video.setAttribute('data-stream', tab.getAttribute('data-stream'));
        playStream(tab.getAttribute('data-stream'));
      });
    });

    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });
  });
})();
