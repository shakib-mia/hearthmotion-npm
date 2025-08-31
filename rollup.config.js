export default {
  input: "src/hearthmotion.js",
  output: [
    {
      file: "dist/hearthmotion.js",
      format: "umd",
      name: "HearthMotion",
      exports: "default",
    },
    {
      file: "dist/hearthmotion.esm.js",
      format: "es",
    },
  ],
};
