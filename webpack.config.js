const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isDevelopment = process.env.NODE_ENV === "development";

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: ['./src/main.js'],
  devtool: isDevelopment && "source-map",
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        options: {
          presets: [
            "@babel/preset-env"
          ]
        }
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    })
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' webpack 1 用
    }
  },
  output: {
    filename: "bundle.js"
  }
};
