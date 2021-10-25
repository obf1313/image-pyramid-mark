/**
 * @description: 公共变量
 * @author: cnn
 * @createTime: 2020/7/16 16:53
 **/
/**
 * 公共颜色
 * **/
export enum colors {
  primaryColor = '#fa541c',
  error = '#f5222d'
}
/**
 * 服务器部署前缀路径
 * **/
const serverConfigs = require('./../../scripts/config.js');
export const { platform } = serverConfigs();
/**
 * API 接口路径
 **/
export const { serverPath } = serverConfigs();
/**
 * 项目名称
 **/
export const projectName: string = '图像金字塔标注';
export enum IPageSession { // page current的类型
  demo = '-demo', // 示例
}
export const PageSessionList: Array<IPageSession> = [
  IPageSession.demo
];
