(function() {
  window.initMoviePlayer = function(videoUrl, posterUrl) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('play-overlay');
    var hlsInstance = null;
    var prepared = false;

    if (!video) {
      return;
    }

    if (posterUrl) {
      video.setAttribute('poster', posterUrl);
    }

    var attach = function() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = videoUrl;
    };

    var play = function() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function() {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function() {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('ended', function() {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
