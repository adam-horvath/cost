import React, { FC } from 'react';

import { ItemModel } from 'models/dashboard.model';
import { ModalType } from './Dashboard';
import { getMoneyString } from 'utils/util';
import { CategoryType } from 'models/common.model';
import 'styles/item-list.scss';

export interface ItemListProps {
  items: ItemModel[];
  showItemModal: (
    isCost: boolean,
    modalType: ModalType,
    currentItemId?: string,
  ) => void;
}

export const ItemList: FC<ItemListProps> = ({ items, showItemModal }) => {
  return (
    <div className="item-list">
      {items.map(item => (
        <div
          className="item"
          key={items.indexOf(item)}
          onClick={() =>
            showItemModal(
              item.category_type === CategoryType.Cost,
              ModalType.UPDATE,
              item._id,
            )
          }
        >
          <div className={`arrow-icon ${item.category_type.toLowerCase()}`} />
          <div className="item-texts">
            <div className="amount">{getMoneyString(item.amount)}</div>
            <div className="description">{item.description}</div>
          </div>
          <div className={`category-icon ${item.category.toLowerCase()}`} />
        </div>
      ))}
    </div>
  );
};
