import terser from "@rollup/plugin-terser";

export default [
  // Regular build
  {
    input: "src/hearthmotion.js",
    output: {
      file: "dist/hearthmotion.js",
      format: "umd",
      name: "HearthMotion",
    },
  },
  // Minified build
  {
    input: "src/hearthmotion.js",
    output: {
      file: "dist/hearthmotion.min.js",
      format: "umd",
      name: "HearthMotion",
    },
    plugins: [terser()],
  },
];
