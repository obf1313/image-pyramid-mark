/**
 * @description: 主页
 * @author: cnn
 * @createTime: 2020/7/16 17:03
 **/
import React, { useState } from 'react';
import { Row, Layout } from 'antd';
import { Header } from '@components/index';
import { useHistory } from 'react-router';
import './index.less';
import { PageSessionList } from '@utils/CommonVars';

const { Content } = Layout;

interface IProps {
  children?: any
}

const Home = (props: IProps) => {
  const { children } = props;
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(false);
  // 如果跳转路由了，则清除 current
  history.listen((location, action) => {
    if (action === 'PUSH') {
      sessionStorage.removeItem('current');
      PageSessionList.forEach(item => {
        sessionStorage.removeItem(item);
      });
    }
  });
  return (
    <Row style={{ width: '100%' }}>
      <Header />
      <Content className="content" id="content">
        {!loading && children}
      </Content>
    </Row>
  );
};

export default Home;
