import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { ModalType } from './Dashboard';
import './AddItemContainer.scss';

export interface AddItemContainerProps {
  showItemModal: (
    isCost: boolean,
    modalType: ModalType,
    currentItemId?: string,
  ) => void;
}

export const AddItemContainer: FC<AddItemContainerProps> = ({
  showItemModal,
}) => {
  const { t } = useTranslation();
  return (
    <div className="add-item-container">
      <div
        className="add-container add-cost-container"
        onClick={() => showItemModal(true, ModalType.ADD)}
      >
        <div className="add-icon add-cost-icon" />
        <div className="add-label add-cost-label">{t('DASHBOARD.COST')}</div>
      </div>
      <div
        className="add-container add-income-container"
        onClick={() => showItemModal(false, ModalType.ADD)}
      >
        <div className="add-label add-income-label">
          {t('DASHBOARD.INCOME')}
        </div>
        <div className="add-icon add-income-icon" />
      </div>
    </div>
  );
};
