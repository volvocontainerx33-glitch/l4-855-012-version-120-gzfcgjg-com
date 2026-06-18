(function () {
  function setupMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var overlay = document.getElementById(options.overlayId);
    var player = null;
    var prepared = false;

    if (!video || !overlay || !options.source) {
      return;
    }

    function showError() {
      overlay.classList.remove("is-hidden");
      overlay.innerHTML = "<span class=\"player-play\">!</span><strong>暂时无法播放，请稍后再试</strong>";
    }

    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }

      prepared = true;
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        player.loadSource(options.source);
        player.attachMedia(video);
        player.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            player.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            player.recoverMediaError();
          } else {
            showError();
          }
        });
        return Promise.resolve();
      }

      showError();
      return Promise.reject(new Error("unsupported"));
    }

    function play() {
      prepare().then(function () {
        overlay.classList.add("is-hidden");
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }).catch(function () {});
    }

    overlay.addEventListener("click", play);
    if (button) {
      button.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (!prepared || video.paused) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (player) {
        player.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
