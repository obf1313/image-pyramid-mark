/**
 * @description: 图像金字塔显示图片
 * @author: cnn
 * @createTime: 2021/10/21 14:45
 **/
import React, { useEffect } from 'react';
import OpenSeadragon from 'openseadragon';
import { serverPath } from '@utils/CommonVars';

interface IFile {
  folderName: string, // 服务器上文件夹名称
  cellSize: string, // 每张切片边长
  width: string, // 原始图片宽度
  height: string // 原始图片高度
}

const OnlyImage = () => {
  const section: IFile = {
    folderName: 'DSI0',
    cellSize: '512',
    width: '46511',
    height: '49974'
  };
  useEffect(() => {
    initOpenSeaDragon();
  }, []);
  // 初始化 openSeadragon
  const initOpenSeaDragon = () => {
    if (section) {
      OpenSeadragon({
        id: 'openSeaDragon',
        // 装有各种按钮名称的文件夹images地址
        prefixUrl: serverPath + '/images/',
        showNavigator: true,
        navigatorAutoFade: false,
        navigatorPosition: 'ABSOLUTE',
        navigatorTop: 0,
        navigatorLeft: 0,
        navigatorHeight: '90px',
        navigatorWidth: '200px',
        navigatorBackground: '#fefefe',
        navigatorBorderColor: '#191970',
        navigatorDisplayRegionColor: '#FF0000',
        tileSources: {
          Image: {
            // 指令集
            xmlns: 'http://schemas.microsoft.com/deepzoom/2009',
            Url: serverPath + section.folderName + '/',
            // 相邻图片直接重叠的像素值
            Overlap: '1',
            // 每张切片的大小
            TileSize: section.cellSize,
            Format: 'jpg',
            Size: {
              Width: section.width,
              Height: section.height
            }
          },
        },
        // 至少20%显示在可视区域内
        visibilityRatio: 0.2,
        // 开启调试模式
        // debugMode : true,
        // 是否允许水平拖动
        panHorizontal: true,
        // 初始化默认放大倍数，按home键也返回该层
        // defaultZoomLevel: 5,
        // 最小允许放大倍数
        minZoomLevel: 0.4,
        // 最大允许放大倍数
        maxZoomLevel: 40,
        zoomInButton: 'zoom-in',
        zoomOutButton: 'zoom-out',
        // 设置鼠标单击不可放大
        gestureSettingsMouse: {
          clickToZoom: false
        }
      });
    }
  };
  return (
    <div id="openSeaDragon" style={{ width: '100%', height: 'calc(100vh - 60px)' }} />
  );
};
export default OnlyImage;