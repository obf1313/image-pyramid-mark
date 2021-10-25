/**
 * @description: 公共函数
 * @author: cnn
 * @createTime: 2020/7/22 9:35
 **/
import dayJs, { Dayjs } from 'dayjs';

/**
 * 时间转为时间字符串
 * **/
export const dateTimeToDateTimeString = (dateTime: Dayjs) => {
  return dayJs(dateTime).format('YYYY-MM-DD HH:mm:ss');
};
