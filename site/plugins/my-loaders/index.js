module.exports = function (context, options) {
  return {
    name: "loaders",
    configureWebpack(config, isServer) {
      return {
        module: {
          rules: [
            {
              test: /\.html$/i,
              loader: "html-loader",
            },
          ],
        },
      };
    },
  };
};
