import React, { FC } from 'react';

import './TextStripMenu.scss';

export interface TextStripMenuProps {
  logout: () => void;
}

export const TextStripMenu: FC<TextStripMenuProps> = ({ logout }) => {
  return (
    <div className="text-strip-menu">
      <span className="menu-item" onClick={logout}>
        <div className={'logout-icon'} />
      </span>
    </div>
  );
};
