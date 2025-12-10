// craco.config.js
const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig) => {
      // ensure ts/tsx are resolved too
      webpackConfig.resolve.extensions = webpackConfig.resolve.extensions || [];
      [" .ts", ".tsx"].forEach((ext) => {
        if (!webpackConfig.resolve.extensions.includes(ext.trim())) {
          webpackConfig.resolve.extensions.push(ext.trim());
        }
      });
      return webpackConfig;
    },
  },
};
