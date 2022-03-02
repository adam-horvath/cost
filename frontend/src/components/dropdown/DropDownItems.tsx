import React, { ReactNode } from 'react';
import { Dropdown } from 'react-bootstrap';

import { Months, StartDate } from 'common/Constants';

export const getYearItems = (
  onSelectYear: (year: number) => void,
): ReactNode[] => {
  const years = [];
  for (let i = new Date().getFullYear(); i >= StartDate.getFullYear(); i--) {
    years.push(i);
  }
  return years.map((year: number, i: number) => (
    <Dropdown.Item
      eventKey={`${i}`}
      key={i}
      onSelect={() => onSelectYear(year)}
    >
      {year}
    </Dropdown.Item>
  ));
};

export const getMonths = (
  onSelectMonth: (month: number) => void,
  selectedYear: number,
): ReactNode[] => {
  return Months.map((month, i) => {
    const now = new Date();
    if (
      (selectedYear === now.getFullYear() && i > now.getMonth()) ||
      (selectedYear === 2015 && i < 8)
    )
      return null;
    return (
      <Dropdown.Item
        eventKey={`${i}`}
        key={i}
        onSelect={() => onSelectMonth(i)}
      >
        {month}
      </Dropdown.Item>
    );
  });
};
