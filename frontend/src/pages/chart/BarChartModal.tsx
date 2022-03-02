import React, { FC, useEffect, useState } from 'react';
import classNames from 'classnames';

import BarChart from './BarChart';
import { Dialog, DialogProps } from 'components/dialog/Dialog';

export interface BarChartModalProps extends DialogProps {
  numberOfBars: number;
}

export const BarChartModal: FC<BarChartModalProps> = ({
  numberOfBars,
  shown,
  title,
  onClose,
}) => {
  const [isLarge, setLarge] = useState<boolean>(
    window.innerWidth >= 992 && numberOfBars > 3,
  );

  const handleResize = () => {
    setLarge(window.innerWidth >= 992 && numberOfBars > 3);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    handleResize();
  }, [numberOfBars]);

  return (
    <Dialog
      shown={shown}
      title={title}
      className={classNames('bar-chart-modal', { small: !isLarge })}
      onClose={onClose}
    >
      <BarChart isLarge={isLarge} setSize={handleResize} />
    </Dialog>
  );
};
