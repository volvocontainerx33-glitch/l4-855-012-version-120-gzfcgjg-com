(function() {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var nextButton = hero.querySelector('[data-hero-next]');
    var prevButton = hero.querySelector('[data-hero-prev]');
    var current = 0;
    var timer = null;

    var showSlide = function(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    var start = function() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    };

    if (nextButton) {
      nextButton.addEventListener('click', function() {
        showSlide(current + 1);
        start();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function() {
        showSlide(current - 1);
        start();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    start();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));

  searchInputs.forEach(function(input) {
    var scope = input.closest('.section') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var filters = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));

    var apply = function() {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function(card) {
        var matchedText = !keyword || (card.getAttribute('data-text') || '').indexOf(keyword) !== -1;
        var matchedFilters = filters.every(function(filter) {
          var attr = filter.getAttribute('data-filter');
          var value = filter.value;
          if (!value) {
            return true;
          }
          return (card.getAttribute(attr) || '').indexOf(value) !== -1;
        });
        card.classList.toggle('is-hidden', !(matchedText && matchedFilters));
      });
    };

    input.addEventListener('input', apply);
    filters.forEach(function(filter) {
      filter.addEventListener('change', apply);
    });
  });
})();
