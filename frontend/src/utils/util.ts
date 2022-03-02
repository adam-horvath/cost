import moment from 'moment';

import { Months } from 'common/Constants';

export const getMoneyString = (number: number): string =>
  Math.round(number)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export const dayPagingAvailable = (date: Date) => ({
  left: !moment(date).isSame(moment('2015-09-30'), 'day'),
  right: !moment(date).isSame(moment(), 'day'),
});

export const monthPagingAvailable = (date: Date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  const now = new Date();
  return {
    left: !moment(d).isSame(moment('2015-09-01'), 'day'),
    right: !(
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    ),
  };
};

export const getFormattedDate = (date: Date) =>
  date.getFullYear() +
  '. ' +
  Months[date.getMonth()] +
  ' ' +
  date.getDate() +
  '.';

const canvas = document.createElement('canvas');

export const getTextWidth = (text: string, font: string) => {
  const context = canvas.getContext('2d');
  if (context) {
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }
  return 0;
};

export const getMaxTextWidth = (stringArray: string[], font: string) =>
  Math.max(...stringArray.map((text) => getTextWidth(text, font)));

export const getMonthLabel = (year: number, month: number) =>
  `${year}. ${Months[month]}`;
