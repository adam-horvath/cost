import React, { FC } from 'react';
import classNames from 'classnames';

import { ToggleState } from 'models/query.model';
import './ToggleButton.scss';

interface ToggleButtonProps {
  active: ToggleState;
  onClick: () => void;
  leftText?: string;
  rightText?: string;
}

enum Empty {
  Left = 'left',
  Right = 'right',
  None = 'none',
}

export const ToggleButton: FC<ToggleButtonProps> = ({
  active,
  onClick,
  leftText,
  rightText,
}) => {
  const emptyText = (): string =>
    !leftText ? Empty.Left : !rightText ? Empty.Right : Empty.None;

  return (
    <div className="toggle-button-container">
      <div
        className={classNames('button-container left', {
          active: active === ToggleState.Left,
          empty: emptyText() === Empty.Left,
          'empty-other': emptyText() === Empty.Right,
        })}
        onClick={onClick}
      >
        <div
          className={classNames('button left', {
            active: active === ToggleState.Left,
          })}
        />
        <div className="button-text left">{leftText}</div>
      </div>
      <div
        className={classNames('button-container right', {
          active: active === ToggleState.Right,
          empty: emptyText() === Empty.Right,
          'empty-other': emptyText() === Empty.Left,
        })}
        onClick={onClick}
      >
        <div
          className={classNames('button right', {
            active: active === ToggleState.Right,
          })}
        />
        <div className="button-text right">{rightText}</div>
      </div>
    </div>
  );
};
