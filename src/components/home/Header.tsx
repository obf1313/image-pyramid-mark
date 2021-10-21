/**
 * @description: Header
 * @author: cnn
 * @createTime: 2020/7/21 9:39
 **/
import React from 'react';
import { Row } from 'antd';
import { projectName } from '@utils/CommonVars';
import logo from '@static/images/logo.png';
import './index.less';

const Header = () => {
  return (
    <Row className="header" justify="space-between" align="middle">
      <Row align="middle" justify="center" className="header-title-icon">
        <img src={logo} alt="logo" height={28} />
        <div className="header-title">{projectName}</div>
      </Row>
    </Row>
  );
};
export default Header;
