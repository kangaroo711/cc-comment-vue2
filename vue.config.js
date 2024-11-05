module.exports = {
  transpileDependencies: ["@dcloudio/uni-ui"],
  css: {
    loaderOptions: {
      sass: {
        implementation: require("sass"),
        sassOptions: {
          // 静默弃用警告
          silenceDeprecations: ["legacy-js-api", "import", "global-builtin"],
        },
      },
    },
  },
};
