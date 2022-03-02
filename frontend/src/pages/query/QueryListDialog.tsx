import React, { FC } from 'react';

import { ListItemModel } from 'models/query.model';
import { Dialog, DialogProps } from 'components/dialog/Dialog';
import { getFormattedDate, getMoneyString } from 'utils/util';

export interface QueryListDialogProps extends DialogProps {
  items: ListItemModel[];
}

export const QueryListDialog: FC<QueryListDialogProps> = ({
  title,
  shown,
  onClose,
  items,
}) => {
  return (
    <Dialog
      className="item-list-modal"
      shown={shown}
      title={title}
      onClose={onClose}
    >
      <div className="item-list">
        {items.map((item) =>
          item.type === 'header' ? (
            <div className="cost-label" key={items.indexOf(item)}>
              {getFormattedDate(new Date(item.date))}
            </div>
          ) : (
            <div className="item" key={items.indexOf(item)}>
              <div
                className={`arrow-icon ${item.category_type.toLowerCase()}`}
              />
              <div className="item-texts">
                <div className="amount">{getMoneyString(item.amount)}</div>
                <div className="description">{item.description}</div>
              </div>
              <div className={`category-icon ${item.category.toLowerCase()}`} />
            </div>
          ),
        )}
      </div>
    </Dialog>
  );
};
