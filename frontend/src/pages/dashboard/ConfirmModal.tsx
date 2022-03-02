import React, { FC, MouseEvent } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import 'components/dialog/Dialog.scss';

export interface ConfirmModalProps {
  shown: boolean;
  onCancel: (event: MouseEvent) => void;
  onConfirm: (event: MouseEvent) => void;
}

export const ConfirmModal: FC<ConfirmModalProps> = ({
  shown,
  onCancel,
  onConfirm,
}) => {
  const { t } = useTranslation();
  return <Modal className="confirm-modal" show={shown} onHide={onCancel}>
      <Modal.Header>
        <Modal.Title>{t('DASHBOARD.DELETE.TITLE')}</Modal.Title>
        <div className="delete-icon" />
      </Modal.Header>

      <Modal.Body>{t('DASHBOARD.DELETE.ARE_YOU_SURE')}</Modal.Body>

      <Modal.Footer>
        <Button onClick={onCancel} variant={'secondary'}>
          {t('COMMON.CANCEL')}
        </Button>
        <Button variant={'primary'} onClick={onConfirm}>
          {t('COMMON.OK')}
        </Button>
      </Modal.Footer>
    </Modal>;
};
