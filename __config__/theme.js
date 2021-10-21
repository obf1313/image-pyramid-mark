/**
 * @description: antd 主题配置
 * @author: cnn
 * @createTime: 2020/7/16 17:22
 **/
const { getThemeVariables } = require('antd/dist/theme');
module.exports = getThemeVariables({
  dark: true, // 开启暗黑模式
  'primary-color': '#fa541c',
  'link-color': '#fa541c',
});
