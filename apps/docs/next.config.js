const packageJson = require("./package.json");

const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

const BRANCH_NAME = process.env.VERCEL_GIT_COMMIT_REF || "";
const IS_RELEASE_BRANCH = BRANCH_NAME.startsWith("releases/");

module.exports = withNextra({
  transpilePackages: ["@measured/puck"],
  basePath: IS_RELEASE_BRANCH ? `/v/${packageJson.version}` : "",
});
