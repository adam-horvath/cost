import React, { MouseEvent, FC } from 'react';

import './Checkbox.scss';

export interface CheckboxProps {
  index: number;
  className?: string;
  isChecked: boolean;
  setChecked: (index?: number) => void;
  text: string;
}

const Checkbox: FC<CheckboxProps> = ({
  index,
  className,
  isChecked,
  setChecked,
  text,
}) => {
  return (
    <div
      className={className}
      onClick={(event: MouseEvent<HTMLElement>) => {
        event.preventDefault();
        setChecked(index);
      }}
    >
      <label>
        <input type="checkbox" />
        <div className={`tick ${isChecked ? 'checked' : ''}`} />
        {text}
      </label>
    </div>
  );
};

export default Checkbox;
