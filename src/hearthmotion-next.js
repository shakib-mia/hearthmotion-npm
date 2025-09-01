// hearthmotion-next.js
function hyphenToCamelCase(text) {
  return text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function loadResource({ type, href, src }) {
  return new Promise((resolve, reject) => {
    let el;
    if (type === "css") {
      el = document.createElement("link");
      el.rel = "stylesheet";
      el.href = href;
      document.head.appendChild(el);
    } else if (type === "js") {
      el = document.createElement("script");
      el.src = src;
      document.body.appendChild(el);
    }
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load ${href || src}`));
  });
}

async function loadAnimateCSS() {
  await loadResource({
    type: "css",
    href: "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
  });
}

async function loadLenis() {
  await loadResource({
    type: "js",
    src: "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@latest/bundled/lenis.min.js",
  });
}

// Track created elements for cleanup (optional)
let createdElements = [];

function initWrapper() {
  let wrapper = document.getElementById("hm-wrapper");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "hm-wrapper";
    document.body.appendChild(wrapper);
    createdElements.push(wrapper);
  }
  return wrapper;
}

function initLenis(wrapper, content, config) {
  const lenis = new window.Lenis({ wrapper, content, ...config.lenis });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  HearthMotion._lenis = lenis;
  return lenis;
}

function initScrollAnimations(config) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        const animation = el.dataset.animate;
        if (entry.isIntersecting && !el.classList.contains("animated")) {
          if (!animation) return;
          let delay = el.dataset.delay || "0";
          let duration = el.dataset.duration || "800";
          if (/^\d+$/.test(delay)) delay += "ms";
          if (/^\d+$/.test(duration)) duration += "ms";
          el.style.opacity = "1";
          el.style.animationDelay = delay;
          el.style.animationDuration = duration;
          el.classList.add(
            "animate__animated",
            `animate__${hyphenToCamelCase(animation)}`
          );
          el.classList.add("animated");
          el.addEventListener(
            "animationend",
            () => {
              el.classList.remove(
                "animate__animated",
                `animate__${hyphenToCamelCase(animation)}`
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

  const elements = document.querySelectorAll("[data-animate]");
  elements.forEach((el) => {
    el.style.opacity = "0";
    observer.observe(el);
  });
}

function mergeConfig(userConfig = {}) {
  const defaultConfig = {
    lenis: { smooth: true },
    animations: { threshold: 0.1, rootMargin: "0px 0px -20px 0px" },
    navbar: { textColorScrolled: "#000", textColorTop: "#FFF" },
  };
  return {
    lenis: { ...defaultConfig.lenis, ...userConfig.lenis },
    animations: { ...defaultConfig.animations, ...userConfig.animations },
    navbar: { ...defaultConfig.navbar, ...userConfig.navbar },
  };
}

function cleanup() {
  if (HearthMotion._lenis) {
    try {
      HearthMotion._lenis.destroy();
      HearthMotion._lenis = null;
    } catch (e) {
      console.warn("Could not destroy Lenis:", e);
    }
  }
  createdElements.forEach((el) => {
    if (el.parentNode) el.parentNode.removeChild(el);
  });
  createdElements = [];
}

async function init(userConfig = {}) {
  try {
    cleanup();
    const config = mergeConfig(userConfig);
    await loadAnimateCSS();
    await loadLenis();

    const wrapper = initWrapper();
    const content = document.getElementById("__next") || wrapper;

    initLenis(wrapper, content, config);
    initScrollAnimations(config);

    console.log("HearthMotion initialized successfully!");
  } catch (e) {
    console.error("HearthMotion initialization failed:", e);
  }
}

// HearthMotion object
const HearthMotion = {
  init,
  initScrollAnimations,
  cleanup,
  _lenis: null,
  getLenis: () => HearthMotion._lenis,
};

// Attach globally for CDN usage
if (typeof window !== "undefined") {
  window.HearthMotion = HearthMotion;
}

// Module export for NPM
export default HearthMotion;
