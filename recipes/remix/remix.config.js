/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
  /**
   * @see https://github.com/measuredco/puck/issues/112
   */
  browserNodeBuiltinsPolyfill: { modules: { crypto: true } },
};
