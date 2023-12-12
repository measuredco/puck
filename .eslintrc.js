module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: ["custom"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
  rules: {
    "react-hooks/exhaustive-deps": "off",
  },
  // eslint-config-next causes warning on Remix's default remix.config.js
  ignorePatterns: ["recipes/remix/remix.config.js"],
};
