/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
  // crypto is used by packages/core/dist/index.js
  // is it possible to not send it to the browser?
  // for not, we need to polyfill it...
  browserNodeBuiltinsPolyfill: { modules: { crypto: true } },
};
