import React, { FC } from 'react';
import DatePicker from 'react-datepicker';

export interface DatePickerWrapperProps {
  date: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date | null;
  maxDate?: Date | null;
}

export const DatePickerWrapper: FC<DatePickerWrapperProps> = ({
  date,
  onChange,
  minDate = new Date('2015-09-30'),
  maxDate = new Date(),
}) => (
  <DatePicker
    selected={date}
    onChange={onChange}
    locale="hu"
    dropdownMode={'select'}
    todayButton={'Mai nap'}
    isClearable={false}
    minDate={minDate}
    maxDate={maxDate}
    dateFormatCalendar="yyyy. MMMM"
    popperPlacement={'center'}
    dateFormat={'yyyy. MM. dd.'}
  />
);
