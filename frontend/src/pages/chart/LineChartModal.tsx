import React, { FC, useEffect, useState } from 'react';
import classNames from 'classnames';

import LineChart from './LineChart';
import { Dialog, DialogProps } from 'components/dialog/Dialog';

export interface LineChartModalProps extends DialogProps {
  isSum: boolean;
}

export const LineChartModal: FC<LineChartModalProps> = ({
  isSum,
  shown,
  onClose,
  title,
}) => {
  const [isLarge, setLarge] = useState<boolean>(window.innerWidth >= 992);

  const handleResize = () => {
    setLarge(window.innerWidth >= 992);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Dialog
      shown={shown}
      title={title}
      className={classNames('line-chart-modal', { small: !isLarge })}
      onClose={onClose}
    >
      <LineChart isLarge={isLarge} setSize={handleResize} isSum={isSum} />
    </Dialog>
  );
};
