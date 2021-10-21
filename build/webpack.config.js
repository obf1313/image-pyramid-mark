/**
 * @description: webpack 公共配置
 * @author: cnn
 * @createTime: 2021/4/22 14:28
 **/
const developmentPlugins = require('./plugins/developmentPlugins');
const jsRules = require('./rules/jsRules');
const styleRules = require('./rules/styleRules');
const fileRules = require('./rules/fileRules');
const optimization = require('./optimization');
// 映射 tsconfig 路径
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { resolve } = require('./utils');
const serverConfigs = require('./../scripts/config');
const { platform } = serverConfigs();

module.exports = {
  entry: {
    'platform/index': resolve('src/app.tsx')
  },
  output: {
    path: resolve('dist'),
    publicPath: platform,
    filename: 'js/[name].js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve('tsconfig.json')
      })
    ]
  },
  module: {
    rules: [...styleRules, ...fileRules, ...jsRules],
  },
  plugins: [...developmentPlugins],
  optimization,
  devServer: {
    port: 3006,
    // 代理，将请求接口做代理，将前端从后台完全剥离出来
    // 部署时使用 nginx 反向代理到后台端口
    proxy: {
      '/api': {
        target: 'http://localhost:50010/openseadragon',
        pathRewrite: {
          '^/api': ''
        },
        bypass: (req) => {
          // https://webpack.js.org/configuration/dev-server/#devserverproxy
          if (req.url.indexOf('.') !== -1) {
            return null;
          }
          // 如果是访问页面
          else if (req.headers.accept.indexOf('html') !== -1) {
            return '/index.html';
          }
        }
      }
    }
  }
};
