# HearthMotion Documentation

## Overview

HearthMotion is a JavaScript library that provides smooth scrolling, custom scrollbars, and scroll-based animations for web applications. It leverages Lenis for smooth scrolling and Animate.css for animations.

## Installation

### NPM

```bash
npm install hearthmotion
```

```javascript
import HearthMotion from "hearthmotion";
```

### Browser (CDN)

```html
<!-- Include after your stylesheets -->
<script src="https://cdn.jsdelivr.net/npm/hearthmotion/dist/hearthmotion.min.js"></script>
```

### ES Module (CDN)

```javascript
import HearthMotion from "https://cdn.jsdelivr.net/npm/hearthmotion/dist/hearthmotion.esm.js";
```

## Initialization

```javascript
// Basic initialization
HearthMotion.init();

// With custom configuration
HearthMotion.init({
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
});
```

## Configuration Options

### Scrollbar Configuration

| Property      | Type    | Default             | Description                          |
| ------------- | ------- | ------------------- | ------------------------------------ |
| `trackColor`  | string  | `"rgba(0,0,0,0.2)"` | Color of the scrollbar track         |
| `thumbColor`  | string  | `"rgba(0,0,0,0.5)"` | Color of the scrollbar thumb         |
| `hoverColor`  | string  | `"rgba(0,0,0,0.7)"` | Color of the thumb on hover          |
| `trackWidth`  | string  | `"6px"`             | Width of the scrollbar track         |
| `thumbRadius` | string  | `"4px"`             | Border radius of the thumb           |
| `autoHide`    | boolean | `true`              | Whether to auto-hide the scrollbar   |
| `hideDelay`   | number  | `2000`              | Delay before hiding (ms)             |
| `edgeZone`    | number  | `20`                | Right-edge detection zone width (px) |

### Animations Configuration

| Property     | Type   | Default               | Description                      |
| ------------ | ------ | --------------------- | -------------------------------- |
| `threshold`  | number | `0.1`                 | IntersectionObserver threshold   |
| `rootMargin` | string | `"0px 0px -20px 0px"` | IntersectionObserver root margin |

### Lenis Configuration

| Property    | Type    | Default | Description             |
| ----------- | ------- | ------- | ----------------------- |
| `smooth`    | boolean | `true`  | Enable smooth scrolling |
| `syncWheel` | boolean | `true`  | Sync with wheel events  |
| `syncTouch` | boolean | `true`  | Sync with touch events  |

## Scroll Animations

Add scroll-triggered animations using data attributes:

```html
<div data-animate="fade-in" data-delay="200" data-duration="1000">
  Content that fades in when scrolled into view
</div>
```

### Available Animation Attributes

- `data-animate`: Animation type (e.g., "fade-in", "slide-in-up")
- `data-delay`: Animation delay (ms or with unit)
- `data-duration`: Animation duration (ms or with unit)

### Supported Animations

All [Animate.css](https://animate.style/) animations are supported. Use kebab-case names (e.g., "fade-in", "slide-in-left").

## Navigation Bar

Add a fixed navbar with scroll behavior by including an element with id "navbar":

```html
<nav id="navbar">
  <!-- Your navigation content -->
</nav>
```

The navbar will:

- Hide when scrolling down
- Show when scrolling up
- Change appearance based on scroll position

## API Reference

### Methods

| Method                         | Description                                         | Returns      |
| ------------------------------ | --------------------------------------------------- | ------------ |
| `init(config)`                 | Initialize HearthMotion with optional configuration | Promise      |
| `initScrollAnimations(config)` | Initialize scroll animations only                   | void         |
| `getLenis()`                   | Get the Lenis instance                              | Lenis object |

### Properties

| Property | Description                              |
| -------- | ---------------------------------------- |
| `_lenis` | Internal reference to the Lenis instance |

## Example Usage

```html
<!DOCTYPE html>
<html>
  <head>
    <title>HearthMotion Example</title>
    <style>
      #navbar {
        padding: 1rem;
        background: transparent;
      }

      section {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>
  </head>
  <body>
    <nav id="navbar">
      <h1>My Website</h1>
    </nav>

    <section>
      <h2 data-animate="fade-in" data-delay="200">Welcome</h2>
    </section>

    <section>
      <p data-animate="slide-in-up" data-duration="1000">
        Scroll to see animations
      </p>
    </section>

    <script src="https://cdn.jsdelivr.net/npm/hearthmotion/dist/hearthmotion.min.js"></script>
    <script>
      HearthMotion.init({
        scrollbar: {
          thumbColor: "#ff5252",
          hoverColor: "#ff0000",
        },
      });
    </script>
  </body>
</html>
```

## Browser Support

HearthMotion supports modern browsers including:

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Dependencies

- [Lenis](https://github.com/studio-freight/lenis) - Smooth scrolling library
- [Animate.css](https://animate.style/) - CSS animation library

These are automatically loaded from CDN when initializing HearthMotion.

## Package.json Reference

If you're installing via NPM, here's what you can expect in the package.json:

```json
{
  "name": "hearthmotion",
  "version": "1.0.0",
  "description": "Smooth scrolling, custom scrollbars, and scroll-based animations",
  "main": "dist/hearthmotion.cjs.js",
  "module": "dist/hearthmotion.esm.js",
  "browser": "dist/hearthmotion.min.js",
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w"
  },
  "keywords": [
    "smooth-scroll",
    "animations",
    "scrollbar",
    "lenis",
    "animate.css"
  ],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "rollup": "^2.60.0",
    "rollup-plugin-terser": "^7.0.2"
  }
}
```

## Troubleshooting

### Common Issues

1. **Animations not working**

   - Ensure Animate.css loads correctly
   - Check browser console for errors

2. **Scrollbar not appearing**

   - Verify the wrapper and content elements are created
   - Check if custom styles are conflicting

3. **Smooth scrolling not working**
   - Verify Lenis loads correctly
   - Check for JavaScript errors

### Debugging

Enable browser developer tools and check the console for error messages. The library logs initialization status and errors.

## License

HearthMotion is open source software licensed under MIT License.
