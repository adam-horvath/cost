import React, { FC, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import './Hamburger.scss';

export interface HamburgerProps {
  openMenu: boolean;
  switchMenuState: () => void;
  logout: () => void;
}

export const Hamburger: FC<HamburgerProps> = ({
  openMenu,
  switchMenuState,
  logout,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenu]);

  const menuPanelRef = useRef<HTMLDivElement>(null);
  const hamburgerIconRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: Event) => {
    if (
      menuPanelRef &&
      !menuPanelRef.current?.contains(event.target as Node) &&
      hamburgerIconRef &&
      !hamburgerIconRef.current?.contains(event.target as Node) &&
      openMenu
    ) {
      switchMenuState();
    }
  };

  const onMenuClick = () => {
    switchMenuState();
  };

  return (
    <React.Fragment>
      <div
        ref={hamburgerIconRef}
        className={classNames('hamburger-icon', { cross: openMenu })}
        onClick={onMenuClick}
      >
        <div />
        <div />
        <div />
      </div>
      <div
        ref={menuPanelRef}
        className={`hamburger-panel ${openMenu ? 'open' : 'closed'}`}
      >
        <div className="menu-item">
          <Link to="/cost" onClick={onMenuClick}>
            {t('MENU.MAIN')}
          </Link>
        </div>
        <div className="menu-item">
          <Link to="/stats" onClick={onMenuClick}>
            {t('MENU.STATS')}
          </Link>
        </div>
        <div className="menu-item">
          <Link to="/query" onClick={onMenuClick}>
            {t('MENU.QUERIES')}
          </Link>
        </div>
        <div className="menu-item">
          <Link to="/chart" onClick={onMenuClick}>
            {t('MENU.CHARTS')}
          </Link>
        </div>
        <div className="menu-item" onClick={logout}>
          {t('MENU.LOGOUT')}
        </div>
      </div>
    </React.Fragment>
  );
};
