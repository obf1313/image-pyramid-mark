/**
 * @description: 图像金字塔标注
 * @author: cnn
 * @createTime: 2021/10/8 10:34
 **/
import React, { useState, useEffect } from 'react';
import { Row, Button, Modal, message } from 'antd';
import { EditOutlined, PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import OpenSeadragon from 'openseadragon';
import { fabric } from 'fabric';
import { EPencilType, PencilSetting, usePencilSetting } from '@components/index';
import { serverPath } from '@utils/CommonVars';
import './../../static/js/openseadragon-scalebar';
import './ImageMark.less';

interface IFile {
  folderName: string, // 服务器上文件夹名称
  cellSize: string, // 每张切片边长
  width: string, // 原始图片宽度
  height: string // 原始图片高度
}

// 显示容器
let openSeadragon: any = null;
// 画布
let fabricCanvas: any = null;
// 绘制状态
let doDrawing: boolean = false;
// 当前选中对象
let selectObj: any;
// 绘制移动计数器
let moveCount: number = 1;
// 多边形数组
let lineList: Array<any> = [];
// 是否选中对象
let ifSelectObj: boolean = false;
// 正在绘制的对象
let currCanvasObject: any;
// 放大倍数列表
let multipleList = [2, 4, 10, 20, 40];
// canvas 外容器
let canvasDiv: any = null;
// canvas 容器
let myCanvas: any = null;
// 画笔初始位置
let mouseFrom = { x: 0, y: 0 };
// 画笔终止位置
let mouseTo = { x: 0, y: 0 };

const ImageMark = () => {
  const {
    toolBarBoxShow, setToolBarBoxShow, setPencilWidth, pencilColor, setPencilColor,
    pencilWidth, selectPencil, setSelectPencil, selectPencilHtml
  } = usePencilSetting();
  const [canvasShape, setCanvasShape] = useState<[number, number]>([1, 1]); // [canvas 宽度， canvas 高度]
  const [annotationView, setAnnotationView] = useState<boolean>(false);
  const [zoomNum, setZoomNum] = useState<number>(5);
  const section: IFile = { folderName: 'DSI0', cellSize: '512', width: '46511', height: '49974' };
  useEffect(() => {
    initOpenSeaDragon();
  }, []);
  useEffect(() => {
    resizeCanvas();
  }, [canvasShape]);
  useEffect(() => {
    mouseMove();
  }, [selectPencil, pencilWidth, pencilColor]);
  // 初始化 openSeadragon
  const initOpenSeaDragon = () => {
    if (section) {
      openSeadragon = OpenSeadragon({
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
      // 获取倍数
      scaleView();
      // 初始化比例尺
      initScale();
      // 自动更新比例
      autoUpdateScaleWidth();
      // 初始化画布
      initCanvas();
    }
  };
  // 初始化画布
  const initCanvas = () => {
    // 创建 canvas 画布容器
    canvasDiv = document.createElement('div');
    canvasDiv.style.position = 'absolute';
    canvasDiv.style.left = canvasDiv.style.top = '0';
    canvasDiv.style.width = canvasDiv.style.height = '100%';
    // 将容器放进 openSeadragon 中
    openSeadragon.canvas.appendChild(canvasDiv);
    // 创建画布
    myCanvas = document.createElement('canvas');
    myCanvas.setAttribute('id', 'canvas');
    // 将画布放入 画布容器中
    canvasDiv.appendChild(myCanvas);
    resize();
    fabricCanvas = new fabric.Canvas('canvas', { selection: false });
    // 设置笔刷颜色和宽度
    fabricCanvas.freeDrawingBrush.color = pencilColor;
    fabricCanvas.freeDrawingBrush.width = pencilWidth;
    // 设置 openSeadragon 事件监听
    openSeadragon.addHandler('update-viewport', resize);
    openSeadragon.addHandler('open', resize);
    // 设置 fabric 事件监听
    mouseDown();
    mouseMove();
    mouseUp();
    onSelectObject();
    // 注入批注数据
    getAnnotate();
  };
  // 初始化比例尺工具
  const initScale = () => {
    // 比例尺
    openSeadragon.scalebar({
      // 设置像素与实际的比值
      pixelsPerMeter: 1000000,
      minWidth: '150px',
      xOffset: 0,
      yOffset: 0,
      stayInsideImage: false,
      color: 'rgb(0, 0, 0)',
      fontColor: 'rgb(0, 0, 0)',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      fontSize: 'middle',
      barThickness: 4,
    });
  };
  // 自动更新放大倍数
  const autoUpdateScaleWidth = () => {
    openSeadragon.addHandler('animation', scaleView);
  };
  // 改变画布
  const resize = () => {
    let width = openSeadragon.container.clientWidth;
    let height = openSeadragon.container.clientHeight;
    setCanvasShape([width, height]);
    canvasDiv.setAttribute('width', width);
    myCanvas.setAttribute('width', width);
    canvasDiv.setAttribute('height', height);
    myCanvas.setAttribute('height', height);
  };
  // 改变画布
  const resizeCanvas = () => {
    if (section) {
      let origin = new OpenSeadragon.Point(0, 0);
      let viewportZoom = openSeadragon.viewport.getZoom(true);
      fabricCanvas.setWidth(canvasShape[0]);
      fabricCanvas.setHeight(canvasShape[1]);
      let zoom = openSeadragon.viewport._containerInnerSize.x * viewportZoom / Number(section.width);
      fabricCanvas.setZoom(zoom);
      let viewportWindowPoint = openSeadragon.viewport.viewportToWindowCoordinates(origin);
      let x = Math.round(viewportWindowPoint.x);
      let y = Math.round(viewportWindowPoint.y);
      let canvasOffset = canvasDiv.getBoundingClientRect();
      let pageScroll = OpenSeadragon.getPageScroll();
      fabricCanvas.absolutePan(new fabric.Point(canvasOffset.left - x + pageScroll.x, canvasOffset.top - y + pageScroll.y));
    }
  };
  // 监听键盘 delete 按钮
  const listenDelete = (e: any) => {
    if (e && e.keyCode === 46) {
      // 删除选中的图形
      fabricCanvas.remove(selectObj).renderAll();
      localStorage.setItem('markData', JSON.stringify(fabricCanvas.toJSON(['id'])));
      selectObj = null;
    }
  };
  // 显示工具盒子
  const showToolBarBox = () => {
    setToolBarBoxShow(!toolBarBoxShow);
    openSeadragon.setMouseNavEnabled(toolBarBoxShow);
  };
  // 选择画笔
  const handleSelectPencil = (e: MouseEvent, selectPencil: EPencilType) => {
    e.stopPropagation();
    ifSelectObj = false;
    setSelectPencil(selectPencil);
  };
  // 缩放视图
  const scaleView = () => {
    const zoom: number = openSeadragon.viewport.getZoom(true);
    setZoomNum(Number(zoom.toFixed(1)));
  };
  // 放大倍数
  const toMultiple = (multiple: number) => {
    openSeadragon.viewport.zoomTo(multiple);
  };
  // 取消添加批注
  const cancelAddAnnotate = () => {
    setAnnotationView(false);
    // 删除当前批注
    fabricCanvas.remove(selectObj).renderAll();
    resetCanvasOption();
  };
  // 重置画布各属性
  const resetCanvasOption = () => {
    currCanvasObject = null;
    moveCount = 1;
    doDrawing = false;
    lineList = [];
  };
  // 鼠标点击
  const mouseDown = () => {
    fabricCanvas.on('mouse:down', (options: any) => {
      if (!annotationView && !ifSelectObj) {
        let offsetX = fabricCanvas.calcOffset().viewportTransform[4];
        let offsetY = fabricCanvas.calcOffset().viewportTransform[5];
        const x: number = Math.round(options.e.offsetX - offsetX);
        const y: number = Math.round(options.e.offsetY - offsetY);
        mouseFrom.x = x;
        mouseFrom.y = y;
        doDrawing = true;
      }
    });
  };
  // 鼠标移动
  const mouseMove = () => {
    fabricCanvas.on('mouse:move', (options: any) => {
      if (selectPencil && doDrawing && !ifSelectObj && !annotationView) {
        if (moveCount % 2 && !doDrawing) {
          return;
        }
        moveCount++;
        let offsetX = fabricCanvas.calcOffset().viewportTransform[4];
        let offsetY = fabricCanvas.calcOffset().viewportTransform[5];
        const x = Math.round(options.e.offsetX - offsetX);
        const y = Math.round(options.e.offsetY - offsetY);
        mouseTo.x = x;
        mouseTo.y = y;
        drawing(x, y);
      }
    });
  };
  // 鼠标抬起
  const mouseUp = () => {
    fabricCanvas.on('mouse:up', (options: any) => {
      let offsetX = fabricCanvas.calcOffset().viewportTransform[4];
      let offsetY = fabricCanvas.calcOffset().viewportTransform[5];
      mouseTo.x = Math.round(options.e.offsetX - offsetX);
      mouseTo.y = Math.round(options.e.offsetY - offsetY);
      if (currCanvasObject) {
        if (Math.abs(currCanvasObject.width) <= 1) {
          fabricCanvas.remove(currCanvasObject).renderAll();
          message.error('标注范围太小，请重新标注！');
          resetCanvasOption();
          return;
        } else if (currCanvasObject) {
          setAnnotationView(true);
        }
      }
    });
  };
  // 画
  const drawing = (offsetX: number, offsetY: number) => {
    if (currCanvasObject) {
      // remove 仅将目前移除，clear 清除上一残留，只剩当前
      fabricCanvas.remove(currCanvasObject);
    }
    const zoom: any = openSeadragon.viewport.getZoom(true);
    let canZoom: any = openSeadragon.viewport.viewportToImageZoom(zoom);
    let canvasObject: any = null;
    let left: number = mouseFrom.x;
    let top: number = mouseFrom.y;
    const radius = Math.sqrt((mouseTo.x - left) * (mouseTo.x - left) + (mouseTo.y - top) * (mouseTo.y - top)) / canZoom;
    const commonParams = {
      stroke: pencilColor,
      strokeWidth: pencilWidth,
      selectionBackgroundColor: 'rgba(0, 0, 0, 0.25)',
      fill: 'rgba(255, 255, 255, 0)'
    };
    switch (selectPencil) {
      case EPencilType.circle:
        canvasObject = new fabric.Circle({
          left: left / canZoom,
          top: top / canZoom,
          originX: 'center',
          originY: 'center',
          radius: radius,
          hasControls: true,
          ...commonParams
        });
        break;
      case EPencilType.rectangle:
        canvasObject = new fabric.Rect({
          top: mouseFrom.y / canZoom,
          left: mouseFrom.x / canZoom,
          width: (mouseTo.x - mouseFrom.x) / canZoom,
          height: (mouseTo.y - mouseFrom.y) / canZoom,
          ...commonParams
        });
        break;
      case EPencilType.polygon:
        lineList.push({
          x: offsetX / canZoom,
          y: offsetY / canZoom
        });
        canvasObject = new fabric.Polygon(lineList, {
          ...commonParams
        });
        break;
      default:
        break;
    }
    if (canvasObject) {
      currCanvasObject = canvasObject;
      selectObj = currCanvasObject;
      fabricCanvas.add(currCanvasObject);
    }
  };
  // 选择对象
  const onSelectObject = () => {
    fabricCanvas.on('selection:created', (options: any) => {
      if (options.target) {
        selectObj = options.target;
        ifSelectObj = true;
        resetCanvasOption();
      }
    });
  };
  // 获取批注数据
  const getAnnotate = () => {
    const note = localStorage.getItem('markData');
    if (note) {
      // 写入 Canvas
      fabricCanvas.loadFromJSON(JSON.parse(note), () => {
        fabricCanvas.renderAll();
      });
    }
  };
  // 添加批注
  const addAnnotate = () => {
    currCanvasObject.id = new Date().valueOf();
    fabricCanvas.renderAll();
    localStorage.setItem('markData', JSON.stringify(fabricCanvas.toJSON(['id'])));
    setAnnotationView(false);
    resetCanvasOption();
  };
  return (
    <Row onKeyUp={listenDelete}>
      <div className="current-pencil">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>画笔：</div>
          <div style={{ width: 50 }}>{selectPencilHtml()}</div>
        </div>
      </div>
      <div id="openSeaDragon" style={{ width: '100%', height: 'calc(100vh - 60px)' }} />
      <div className="toolbar" style={{ top: 'calc(100vh / 2 - 120px)' }}>
        <EditOutlined className="toolbar-one" title="批注" onClick={showToolBarBox} />
      </div>
      <PencilSetting
        handleSelectPencil={handleSelectPencil}
        selectPencil={selectPencil}
        setPencilColor={setPencilColor}
        setPencilWidth={setPencilWidth}
        pencilColor={pencilColor}
        pencilWidth={pencilWidth}
        toolBarBoxShow={toolBarBoxShow}
      />
      <div className="scale-bar" style={{ top: 'calc(100vh / 2 - 120px)' }}>
        <PlusCircleOutlined id="zoom-in" className="toolbar-one" onClick={scaleView} />
        <div className="scale-number">{zoomNum} X</div>
        <MinusCircleOutlined id="zoom-out" className="toolbar-one" onClick={scaleView} />
        {multipleList.map((item: number) => <div key={item} className="scale-multiple" onClick={() => toMultiple(item)}>{item} X</div>)}
      </div>
      <Modal title="添加批注" visible={annotationView} onCancel={cancelAddAnnotate} footer={false}>
        <Button onClick={addAnnotate}>确认</Button>
      </Modal>
    </Row>
  );
};
export default ImageMark;