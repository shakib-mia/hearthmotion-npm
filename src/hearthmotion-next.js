// hearthmotion-global.js - Fixed for traditional script usage
(function () {
  "use strict";

  function hyphenToCamelCase(text) {
    return text.replace(/-([a-z])/g, function (_, letter) {
      return letter.toUpperCase();
    });
  }

  function loadResource(options) {
    return new Promise(function (resolve, reject) {
      var el;
      if (options.type === "css") {
        // Check if already loaded
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        var alreadyLoaded = false;
        for (var i = 0; i < links.length; i++) {
          if (links[i].href === options.href) {
            alreadyLoaded = true;
            break;
          }
        }
        if (alreadyLoaded) return resolve();

        el = document.createElement("link");
        el.rel = "stylesheet";
        el.href = options.href;
        document.head.appendChild(el);
      } else if (options.type === "js") {
        // Check if already loaded
        var scripts = document.querySelectorAll("script");
        var alreadyLoaded = false;
        for (var i = 0; i < scripts.length; i++) {
          if (scripts[i].src === options.src) {
            alreadyLoaded = true;
            break;
          }
        }
        if (alreadyLoaded) return resolve();

        el = document.createElement("script");
        el.src = options.src;
        document.body.appendChild(el);
      }
      el.onload = function () {
        resolve();
      };
      el.onerror = function () {
        reject(new Error("Failed to load " + (options.href || options.src)));
      };
    });
  }

  function loadAnimateCSS() {
    return loadResource({
      type: "css",
      href: "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
    });
  }

  function loadLenis() {
    return loadResource({
      type: "js",
      src: "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@latest/bundled/lenis.min.js",
    });
  }

  // Track moved elements and created elements for cleanup
  var movedElements = [];
  var createdElements = [];

  function initWrapper(config) {
    // Clean up any existing instance first
    cleanup();

    var wrapper = document.getElementById("hm-wrapper");
    var content = document.getElementById("hm-content");

    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.id = "hm-wrapper";
      document.body.appendChild(wrapper);
      createdElements.push(wrapper);
    }

    if (!content) {
      content = document.createElement("div");
      content.id = "hm-content";
      wrapper.appendChild(content);
      createdElements.push(content);
    }

    var track = document.createElement("div");
    track.id = "hm-track";
    createdElements.push(track);

    var thumb = document.createElement("div");
    thumb.id = "hm-thumb";
    createdElements.push(thumb);

    track.appendChild(thumb);
    wrapper.appendChild(track);

    // Clear previous moved elements
    movedElements = [];

    // Get all elements that should be moved
    var elementsToMove = Array.from(document.body.children).filter(function (
      child
    ) {
      var computed = window.getComputedStyle(child);
      var isFixed = computed.position === "fixed";
      var isScriptOrStyle = ["SCRIPT", "STYLE", "LINK"].includes(child.tagName);
      var isNextJsRoot = child.id === "__next";

      return child !== wrapper && !isFixed && !isScriptOrStyle && !isNextJsRoot;
    });

    // Move elements
    elementsToMove.forEach(function (child) {
      content.appendChild(child);
      movedElements.push(child);
    });

    // Apply custom scrollbar styles
    var scrollbarConfig = config.scrollbar;
    var style = document.createElement("style");
    style.innerHTML = [
      "html, body { margin: 0; height: 100%; overflow: hidden; }",
      "html::-webkit-scrollbar, body::-webkit-scrollbar, #hm-wrapper::-webkit-scrollbar, #hm-content::-webkit-scrollbar { display: none; }",
      "html, body, #hm-wrapper, #hm-content { -ms-overflow-style: none; scrollbar-width: none; }",
      "#hm-wrapper { position: fixed; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; }",
      "#hm-content { width: 100%; min-height: 100%; will-change: transform; }",
      "#hm-track { ",
      "  position: fixed; ",
      "  top: 0; ",
      "  right: 2px; ",
      "  width: " + scrollbarConfig.trackWidth + "; ",
      "  height: 100%; ",
      "  background: " + scrollbarConfig.trackColor + "; ",
      "  z-index: 99999999; ",
      "  border-radius: " + scrollbarConfig.thumbRadius + "; ",
      "  transition: width 0.3s ease, opacity 0.4s ease, transform 0.4s ease; ",
      "}",
      "#hm-thumb { ",
      "  position: absolute; ",
      "  top: 0; ",
      "  right: 0; ",
      "  width: 100%; ",
      "  height: 50px; ",
      "  background: " + scrollbarConfig.thumbColor + "; ",
      "  border-radius: " + scrollbarConfig.thumbRadius + "; ",
      "  cursor: pointer; ",
      "  z-index: 9999999; ",
      "  transition: background 0.2s ease; ",
      "}",
      "#hm-thumb:hover { ",
      "  background: " + scrollbarConfig.hoverColor + "; ",
      "}",
    ].join("");
    document.head.appendChild(style);
    createdElements.push(style);

    return { wrapper: wrapper, content: content, track: track, thumb: thumb };
  }

  function initLenis(wrapper, content, config) {
    if (!window.Lenis) {
      console.warn("Lenis not loaded yet!");
      return null;
    }

    var lenisConfig = Object.assign(
      { wrapper: wrapper, content: content },
      config.lenis
    );
    var lenis = new window.Lenis(lenisConfig);

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    window.HearthMotion._lenis = lenis;
    return lenis;
  }

  function initThumb(lenis, wrapper, content, track, thumb, config) {
    var scrollTimeout;
    var HIDE_DELAY = config.scrollbar.hideDelay;
    var EDGE_ZONE = config.scrollbar.edgeZone;

    function showScrollbar() {
      track.style.opacity = "1";
      track.style.transform = "translateX(0)";
    }

    function hideScrollbar() {
      if (config.scrollbar.autoHide) {
        track.style.opacity = "0";
        track.style.transform = "translateX(10px)";
      }
    }

    function resetScrollbarTimer() {
      showScrollbar();
      clearTimeout(scrollTimeout);
      if (config.scrollbar.autoHide) {
        scrollTimeout = setTimeout(hideScrollbar, HIDE_DELAY);
      }
    }

    function updateThumb(scroll) {
      if (scroll === undefined) scroll = lenis.scroll;
      var wrapperHeight = wrapper.clientHeight;
      var contentHeight = content.scrollHeight;
      var ratio = wrapperHeight / contentHeight;
      var thumbHeight = Math.max(ratio * wrapperHeight, 30);
      var maxScroll = Math.max(contentHeight - wrapperHeight, 1);
      var maxThumbTop = Math.max(wrapperHeight - thumbHeight, 1);
      var top = Math.min((scroll / maxScroll) * maxThumbTop, maxThumbTop);
      thumb.style.height = thumbHeight + "px";
      thumb.style.top = top + "px";
    }

    lenis.on("scroll", function (e) {
      updateThumb(e.scroll);
      resetScrollbarTimer();
    });

    window.addEventListener("resize", function () {
      updateThumb();
    });

    var isDragging = false;
    var startY = 0;
    var startScroll = 0;

    // Thumb drag
    thumb.addEventListener("mousedown", function (e) {
      isDragging = true;
      startY = e.clientY;
      startScroll = lenis.scroll;
      document.body.style.userSelect = "none";
      showScrollbar();
      clearTimeout(scrollTimeout);
    });

    document.addEventListener("mousemove", function (e) {
      // Thumb dragging
      if (isDragging) {
        var wrapperHeight = wrapper.clientHeight;
        var contentHeight = content.scrollHeight;
        var ratio = wrapperHeight / contentHeight;
        var thumbHeight = Math.max(ratio * wrapperHeight, 30);
        var maxScroll = Math.max(contentHeight - wrapperHeight, 1);
        var maxThumbTop = Math.max(wrapperHeight - thumbHeight, 1);

        var deltaY = e.clientY - startY;
        var newScroll = startScroll + (deltaY / maxThumbTop) * maxScroll;
        lenis.scrollTo(Math.max(0, Math.min(newScroll, maxScroll)), {
          immediate: false,
        });
      }

      // Right-edge detection
      var distanceFromRight = window.innerWidth - e.clientX;
      if (distanceFromRight <= EDGE_ZONE) {
        showScrollbar();
        clearTimeout(scrollTimeout);
        if (config.scrollbar.autoHide) {
          scrollTimeout = setTimeout(hideScrollbar, HIDE_DELAY);
        }
      }
    });

    document.addEventListener("mouseup", function () {
      if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = "";
        resetScrollbarTimer();
      }
    });

    // Track click scroll
    track.addEventListener("click", function (e) {
      // Prevent dragging from firing
      if (e.target === thumb) return;

      var rect = track.getBoundingClientRect();
      var clickY = e.clientY - rect.top;
      var wrapperHeight = wrapper.clientHeight;
      var contentHeight = content.scrollHeight;
      var ratio = wrapperHeight / contentHeight;
      var thumbHeight = Math.max(ratio * wrapperHeight, 30);
      var maxScroll = Math.max(contentHeight - wrapperHeight, 1);
      var maxThumbTop = Math.max(wrapperHeight - thumbHeight, 1);

      // Calculate scroll position proportional to click
      var newScroll = (clickY / maxThumbTop) * maxScroll;
      lenis.scrollTo(Math.max(0, Math.min(newScroll, maxScroll)), {
        immediate: false,
      });
      resetScrollbarTimer();
    });

    updateThumb();
    resetScrollbarTimer();
  }

  function initScrollAnimations(config) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var el = entry.target;
          var animation = el.dataset.animate;
          if (entry.isIntersecting && !el.classList.contains("animated")) {
            if (!animation) return;
            var delay = el.dataset.delay || "0";
            var duration = el.dataset.duration || "800";
            if (/^\d+$/.test(delay)) delay += "ms";
            if (/^\d+$/.test(duration)) duration += "ms";
            el.style.opacity = "1";
            el.style.animationDelay = delay;
            el.style.animationDuration = duration;
            el.classList.add(
              "animate__animated",
              "animate__" + hyphenToCamelCase(animation)
            );
            el.classList.add("animated");
            el.addEventListener(
              "animationend",
              function () {
                el.classList.remove(
                  "animate__animated",
                  "animate__" + hyphenToCamelCase(animation)
                );
              },
              { once: true }
            );
          }
        });
      },
      {
        threshold: config.animations.threshold,
        rootMargin: config.animations.rootMargin,
      }
    );

    setTimeout(function () {
      var elements = document.querySelectorAll("[data-animate]");
      elements.forEach(function (el) {
        el.style.opacity = "0";
        observer.observe(el);
      });
    }, 100);
  }

  function initNavbar(lenis, config) {
    var navbar = document.getElementById("navbar");
    if (!navbar) return;

    // Check if page has light background
    var hasLightBackground = document.body.classList.contains("light-header");

    var lastScrollY = 0;
    var scrollDirection = "up";
    navbar.style.transition = "all 0.5s ease";
    navbar.style.position = "fixed";
    navbar.style.top = "0";
    navbar.style.left = "0";
    navbar.style.right = "0";
    navbar.style.zIndex = "999997";

    function handleNavbar(scroll) {
      if (scroll > lastScrollY) scrollDirection = "down";
      else scrollDirection = "up";
      lastScrollY = scroll;

      if (scrollDirection === "down" && scroll > 50) {
        navbar.style.transform = "translateY(-100%)";
      } else {
        navbar.style.transform = "translateY(0)";
      }

      if (scroll > 0) {
        navbar.style.boxShadow = "0 0 20px 0 #2B245D21";
        navbar.style.backgroundColor = "#FFF";
        // Use appropriate text color based on background
        navbar.style.color = hasLightBackground
          ? (config.navbar && config.navbar.textColorScrolled) || "#000"
          : "#000";
      } else {
        navbar.style.boxShadow = "none";
        navbar.style.backgroundColor = "transparent";
        // Use appropriate text color based on background
        navbar.style.color = hasLightBackground
          ? (config.navbar && config.navbar.textColorTop) || "#333"
          : "#FFF";
      }
    }

    lenis.on("scroll", function (e) {
      handleNavbar(e.scroll);
    });

    handleNavbar(0);
  }

  // Default configuration
  var defaultConfig = {
    scrollbar: {
      trackColor: "rgba(0,0,0,0.2)",
      thumbColor: "rgba(0,0,0,0.5)",
      hoverColor: "rgba(0,0,0,0.7)",
      trackWidth: "6px",
      thumbRadius: "4px",
      autoHide: true,
      hideDelay: 2000,
      edgeZone: 20,
    },
    animations: {
      threshold: 0.1,
      rootMargin: "0px 0px -20px 0px",
    },
    lenis: {
      smooth: true,
      syncWheel: true,
      syncTouch: true,
    },
    // Add navbar configuration
    navbar: {
      textColorScrolled: "#000", // Default text color when scrolled
      textColorTop: "#FFF", // Default text color at top of page
    },
  };

  function mergeConfig(userConfig) {
    if (userConfig === void 0) {
      userConfig = {};
    }
    return {
      scrollbar: Object.assign(
        {},
        defaultConfig.scrollbar,
        userConfig.scrollbar
      ),
      animations: Object.assign(
        {},
        defaultConfig.animations,
        userConfig.animations
      ),
      lenis: Object.assign({}, defaultConfig.lenis, userConfig.lenis),
      navbar: Object.assign({}, defaultConfig.navbar, userConfig.navbar),
    };
  }

  // Add cleanup function
  function cleanup() {
    // Restore moved elements to their original position
    movedElements.forEach(function (element) {
      if (element.parentNode && element.parentNode.id === "hm-content") {
        try {
          document.body.appendChild(element);
        } catch (e) {
          console.warn("Could not restore element:", e);
        }
      }
    });

    // Remove created elements
    createdElements.forEach(function (element) {
      if (element && element.parentNode) {
        try {
          element.parentNode.removeChild(element);
        } catch (e) {
          console.warn("Could not remove element:", e);
        }
      }
    });

    // Clear Lenis instance
    if (window.HearthMotion && window.HearthMotion._lenis) {
      try {
        window.HearthMotion._lenis.destroy();
      } catch (e) {
        console.warn("Could not destroy Lenis:", e);
      }
      window.HearthMotion._lenis = null;
    }

    // Clear arrays
    movedElements = [];
    createdElements = [];
  }

  function init(userConfig) {
    if (userConfig === void 0) {
      userConfig = {};
    }
    return new Promise(function (resolve, reject) {
      try {
        // Clean up any existing instance first
        cleanup();

        var config = mergeConfig(userConfig);

        Promise.all([loadAnimateCSS(), loadLenis()])
          .then(function () {
            var _a = initWrapper(config),
              wrapper = _a.wrapper,
              content = _a.content,
              track = _a.track,
              thumb = _a.thumb;
            var lenis = initLenis(wrapper, content, config);
            if (lenis) {
              initThumb(lenis, wrapper, content, track, thumb, config);
              initNavbar(lenis, config);
              initScrollAnimations(config);
              console.log("HearthMotion initialized successfully!");
              resolve();
            } else {
              reject(new Error("Lenis failed to initialize"));
            }
          })
          .catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  // Enhanced cleanup function
  function cleanup() {
    // Safe element restoration
    movedElements.forEach(function (element) {
      try {
        if (
          element &&
          element.parentNode &&
          element.parentNode.id === "hm-content"
        ) {
          // Check if the element still exists in the DOM
          if (document.body.contains(element.parentNode)) {
            document.body.appendChild(element);
          }
        }
      } catch (e) {
        console.warn("Could not restore element:", e.message);
      }
    });

    // Safe element removal
    createdElements.forEach(function (element) {
      try {
        if (element && element.parentNode) {
          // Check if the element still exists in the DOM before removing
          if (document.body.contains(element)) {
            element.parentNode.removeChild(element);
          }
        }
      } catch (e) {
        console.warn("Could not remove element:", e.message);
      }
    });

    // Clear Lenis instance
    if (window.HearthMotion && window.HearthMotion._lenis) {
      try {
        window.HearthMotion._lenis.destroy();
      } catch (e) {
        console.warn("Could not destroy Lenis:", e.message);
      }
      window.HearthMotion._lenis = null;
    }

    // Clear arrays
    movedElements = [];
    createdElements = [];

    // Reset body styles
    try {
      document.body.style.overflow = "";
      document.body.style.userSelect = "";
      document.body.style.height = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
    } catch (e) {
      console.warn("Could not reset body styles:", e.message);
    }
  }

  // Create HearthMotion object
  window.HearthMotion = {
    init: init,
    initScrollAnimations: initScrollAnimations,
    getLenis: function () {
      return window.HearthMotion._lenis;
    },
    cleanup: cleanup,
    _lenis: null,
  };
})();
