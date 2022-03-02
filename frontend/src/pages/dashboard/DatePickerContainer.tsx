import React, { FC } from 'react';

import { DatePickerWrapper } from 'components/datepicker/DatePickerWrapper';
import { PagingAvailable } from './Dashboard';
import './DatePickerContainer.scss';

interface DatePickerContainerProps {
  isPagingAvailable: PagingAvailable;
  changeDateWith: (withDay: number) => void;
  onDateChange: (date: Date) => void;
  date: Date;
}

export const DatePickerContainer: FC<DatePickerContainerProps> = ({
  isPagingAvailable,
  changeDateWith,
  onDateChange,
  date,
}) => {
  return (
    <div className="date-picker-container">
      {isPagingAvailable.left ? (
        <div
          className="paginate visible left"
          onClick={() => changeDateWith(-1)}
        />
      ) : (
        <div className="paginate left" />
      )}
      <DatePickerWrapper date={date} onChange={onDateChange} />
      {isPagingAvailable.right ? (
        <div
          className="paginate visible right"
          onClick={() => changeDateWith(1)}
        />
      ) : (
        <div className="paginate right" />
      )}
    </div>
  );
};
