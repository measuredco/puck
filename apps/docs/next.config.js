const packageJson = require("./package.json");

const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

const BRANCH_NAME = process.env.VERCEL_GIT_COMMIT_REF || "";
const IS_RELEASE_BRANCH = BRANCH_NAME.startsWith("releases/");

module.exports = withNextra({
  async redirects() {
    return [
      {
        source: "/docs/api-reference/configuration/fields/:path*",
        destination: "/docs/api-reference/fields/:path*",
        permanent: true,
      },
      {
        source: "/docs/api-reference/plugins",
        destination: "/docs/api-reference/plugin",
        permanent: true,
      },
    ];
  },
  transpilePackages: ["@measured/puck"],
  basePath: IS_RELEASE_BRANCH
    ? `/v/${packageJson.version}`
    : process.env.NEXT_PUBLIC_IS_CANARY
    ? "/v/canary"
    : "",
});
