import React, { FC, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import classNames from 'classnames';

import { NotificationType } from 'models/common.model';
import { hideNotification } from 'store/common';
import { compose } from "utils/compose";
import './Notification.scss';

interface NotificationProps extends ConnectedProps<typeof connector> {}

export const Notification: FC<NotificationProps> = (props) => {
  useEffect(() => {
    setTimeout(hideNotification, 2000);
  }, []);

  const {notification, hideNotification} = props;

  return (
    <div
      className={classNames('bubble', {
        error: notification?.type === NotificationType.Error
      })}
      onClick={hideNotification}
    >
      <div
        className={classNames('inner', {
          error: notification?.type === NotificationType.Error,
        })}
      >
        {notification?.text}
      </div>
    </div>
  );
};

const mapStateToProps = (state: ApplicationState) => {
  return {
    notification: state.common.notification,
  };
};

const mapDispatchToProps = {
  hideNotification,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default compose(connector)(Notification);
