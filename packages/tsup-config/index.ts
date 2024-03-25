const config = {
  dts: true,
  format: "cjs",
  inject: ["../tsup-config/react-import.js"],
  loader: {
    ".css": "local-css",
  },
};

export default config;
