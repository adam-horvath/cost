import React, { FC } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import './Dialog.scss';

export interface DialogProps {
  shown: boolean;
  onClose: () => void;
  title: string;
  className?: string;
}

export const Dialog: FC<DialogProps> = ({
  shown,
  onClose,
  title,
  children,
  className,
}) => {
  const { t } = useTranslation();
  return (
    <Modal className={`ok-modal ${className}`} show={shown} onClose={onClose}>
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{children}</Modal.Body>

      <Modal.Footer>
        <Button variant="primary" type="submit" onClick={onClose}>
          {t('COMMON.OK')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
