import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import './Menu.scss';

export const Menu: FC<{}> = () => {
  const { t } = useTranslation();
  return (
    <div className="menu row">
      <div className="entry-container col-sm-3">
        <Link to="/cost" className="menu-entry">
          {t('MENU.MAIN')}
        </Link>
      </div>
      <div className="entry-container col-sm-3">
        <Link to="/stats" className="menu-entry">
          {t('MENU.STATS')}
        </Link>
      </div>
      <div className="entry-container col-sm-3">
        <Link to="/query" className="menu-entry">
          {t('MENU.QUERIES')}
        </Link>
      </div>
      <div className="entry-container col-sm-3">
        <Link to="/chart" className="menu-entry">
          {t('MENU.CHARTS')}
        </Link>
      </div>
    </div>
  );
};
