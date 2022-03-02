import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, DialogProps } from 'components/dialog/Dialog';
import { getMoneyString } from 'utils/util';

export interface QuerySumDialogProps extends DialogProps {
  value: number;
}

export const QuerySumDialog: FC<QuerySumDialogProps> = ({
  value,
  onClose,
  shown,
  title,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog shown={shown} onClose={onClose} title={title}>
      {`${t('QUERY.AMOUNT')}: ${getMoneyString(value)}`}
    </Dialog>
  );
};
