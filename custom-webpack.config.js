const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

module.exports = {
  externals: {
    sharp: "commonjs sharp",
    bcrypt: "commonjs bcrypt",
  },
  plugins: [new BundleAnalyzerPlugin()],
};
