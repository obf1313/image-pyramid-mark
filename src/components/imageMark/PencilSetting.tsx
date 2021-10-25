/**
 * @description: 画笔设置
 * @author: cnn
 * @createTime: 2021/10/25 9:39
 **/
import React, { useState } from 'react';
import { Tabs, Slider } from 'antd';
import { CompactPicker } from 'react-color';
import { BorderOutlined, StarOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

export enum EPencilType {
  circle = 'circle',
  rectangle = 'rectangle',
  polygon = 'polygon'
}

interface IProps {
  toolBarBoxShow: boolean,
  selectPencil: EPencilType,
  pencilColor: string,
  pencilWidth: number,
  handleSelectPencil: (e: MouseEvent, selectPencil: EPencilType) => void,
  setPencilColor: (color: string) => void,
  setPencilWidth: (width: number) => void
}

export const usePencilSetting = () => {
  const [toolBarBoxShow, setToolBarBoxShow] = useState<boolean>(false);
  const [selectPencil, setSelectPencil] = useState<EPencilType>(EPencilType.polygon);
  const [pencilColor, setPencilColor] = useState<string>('#F44E3B');
  const [pencilWidth, setPencilWidth] = useState<number>(5);
  // 获取选择了什么画笔
  const selectPencilHtml = () => {
    switch (selectPencil) {
      case EPencilType.circle:
        return '○';
      case EPencilType.rectangle:
        return <BorderOutlined />;
      case EPencilType.polygon:
        return <StarOutlined />;
      default:
        return '未选择';
    }
  };
  return {
    toolBarBoxShow, setToolBarBoxShow, setPencilWidth, pencilColor, setPencilColor,
    pencilWidth, selectPencil, setSelectPencil, selectPencilHtml
  };
};

const PencilSetting = (props: IProps) => {
  const {
    toolBarBoxShow, selectPencil, pencilColor, pencilWidth, handleSelectPencil,
    setPencilColor, setPencilWidth
  } = props;
  return (
    <div style={{ position: 'absolute', right: 0, display: toolBarBoxShow ? 'block' : 'none' }}>
      <Tabs type="card" style={{ minWidth: 300, backgroundColor: '#333' }}>
        <TabPane tab="画笔" key="1">
          <div className="toolbar-container">
            <BorderOutlined
              className={selectPencil === 'rectangle' ? 'toolbar-one-right-bottom-active' : 'toolbar-one-right-bottom'}
              title="矩形"
              onClick={(e: any) => handleSelectPencil(e, EPencilType.rectangle)}
            />
            <StarOutlined
              className={selectPencil === EPencilType.polygon ? 'toolbar-one-right-bottom-active' : 'toolbar-one-right-bottom'}
              title="多边形"
              onClick={(e: any) => handleSelectPencil(e, EPencilType.polygon)}
            />
            <div
              className={selectPencil === EPencilType.circle ? 'toolbar-one-right-bottom-active' : 'toolbar-one-right-bottom'}
              title="圆形"
              onClick={(e: any) => handleSelectPencil(e, EPencilType.circle)}
            >
              ○
            </div>
          </div>
        </TabPane>
        <TabPane tab="颜色" key="2">
          <div className="toolbar-container">
            <CompactPicker
              color={pencilColor}
              onChangeComplete={(color: any) => setPencilColor(color.hex)}
            />
          </div>
        </TabPane>
        <TabPane tab="粗细" key="3">
          <div className="toolbar-container">
            <Slider
              step={2}
              min={2}
              max={40}
              value={pencilWidth}
              style={{ width: '100%' }}
              onChange={(pencilWidth: number) => setPencilWidth(pencilWidth)}
            />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};
export default PencilSetting;