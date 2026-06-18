(function () {
  "use strict";

  function setMessage(container, text) {
    var message = container.querySelector("[data-player-message]");

    if (message) {
      message.textContent = text;
    }
  }

  function playWithNativeHls(video, source, container) {
    video.src = source;
    video.controls = true;
    return video.play().then(function () {
      container.classList.add("is-playing");
    });
  }

  function playWithHlsJs(video, source, container) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.controls = true;
      video.play().then(function () {
        container.classList.add("is-playing");
      }).catch(function () {
        setMessage(container, "浏览器阻止了自动播放，请再次点击播放按钮。");
      });
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setMessage(container, "播放源加载失败，请稍后重试或更换浏览器。" + data.type);
        hls.destroy();
      }
    });

    video._hlsInstance = hls;
  }

  function initPlayer(container) {
    var video = container.querySelector("video");
    var button = container.querySelector("[data-player-button]");
    var source = container.getAttribute("data-player-src");

    if (!video || !button) {
      return;
    }

    button.addEventListener("click", function () {
      if (!source) {
        setMessage(container, "当前影片暂时没有可用播放源。");
        return;
      }

      if (video._hlsInstance) {
        video.play();
        container.classList.add("is-playing");
        return;
      }

      setMessage(container, "正在加载播放源...");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        playWithNativeHls(video, source, container).catch(function () {
          setMessage(container, "播放启动失败，请再次点击或更换浏览器。 ");
        });
        return;
      }

      if (window.Hls && Hls.isSupported()) {
        playWithHlsJs(video, source, container);
        return;
      }

      setMessage(container, "当前浏览器暂不支持在线播放，请使用新版 Chrome、Edge、Safari 或移动端浏览器。");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".movie-player").forEach(initPlayer);
  });
})();
