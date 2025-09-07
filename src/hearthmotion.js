(function () {
  function hyphenToCamelCase(text) {
    return text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  function loadAnimateCSS() {
    return new Promise((resolve, reject) => {
      if (document.querySelector("#animate-css")) {
        resolve();
        return;
      }
      const link = document.createElement("link");
      link.id = "animate-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css";
      link.onload = () => resolve();
      link.onerror = () => reject(new Error("Failed to load Animate.css"));
      document.head.appendChild(link);
    });
  }

  function initHearthMotion() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          const animation = el.dataset.animate;

          if (entry.isIntersecting && !el.classList.contains("animated")) {
            const delay = el.dataset.delay || "0ms";
            const duration = el.dataset.duration || "1000ms";

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
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => {
      el.style.opacity = "0";
      observer.observe(el);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadAnimateCSS().then(initHearthMotion).catch(console.error);
  });
})();
