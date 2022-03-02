import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';
import { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'moment/locale/hu';
import hu from 'date-fns/locale/hu';

import { ItemModal } from './ItemModal';
import { compose } from 'utils/compose';
import {
  createItem,
  deleteItem,
  getDashboardData,
  updateItem,
} from 'store/dashboard';
import { dayPagingAvailable, getMoneyString } from 'utils/util';
import { AddItemContainer } from './AddItemContainer';
import { DatePickerContainer } from './DatePickerContainer';
import { ItemList } from './ItemList';
import { CostCategories, IncomeCategories } from 'common/Constants';
import { CostCategory, IncomeCategory } from 'models/common.model';
import './Dashboard.scss';
import 'components/datepicker/DatePicker.scss';
import { setDescriptionMapping } from 'store/common';

export interface DashboardPageProps
  extends WithTranslation,
    ConnectedProps<typeof connector> {}

interface DashboardPageState {
  itemModalShown: boolean;
  confirmModalShown: boolean;
  date: Date;
  isPagingAvailable: PagingAvailable;
  modalType: ModalType;
  currentItemId: string;
  isCost: boolean;
}

export enum ModalType {
  ADD = 'ADD',
  UPDATE = 'UPDATE',
}

export interface PagingAvailable {
  left: boolean;
  right: boolean;
}

class Dashboard extends Component<DashboardPageProps, DashboardPageState> {
  readonly state = {
    itemModalShown: false,
    confirmModalShown: false,
    date: new Date(),
    isPagingAvailable: {
      left: true,
      right: false,
    },
    modalType: ModalType.ADD,
    currentItemId: '',
    isCost: false,
  };

  getData = async () => {
    const { getDashboardData } = this.props;
    await getDashboardData({ date: this.state.date.toISOString() });
  };

  onDateChange = async (date: Date) => {
    date.setHours(6);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    await this.setState({ date });
    this.handleDateChange();
  };

  changeDateWith = async (value: number) => {
    const date = this.state.date;
    date.setDate(this.state.date.getDate() + value);
    await this.setState({ date });
    this.handleDateChange();
  };

  handleDateChange = async () => {
    this.setPagingAvailable();
    await this.getData();
  };

  showItemModal = (
    isCost: boolean,
    modalType: ModalType,
    currentItemId?: string,
  ) => {
    const newState: DashboardPageState = {
      ...this.state,
      itemModalShown: true,
      modalType,
      isCost,
    };
    if (currentItemId) {
      newState.currentItemId = currentItemId;
    }
    this.setState(newState);
  };

  hideItemModal = () => {
    this.setState(
      {
        itemModalShown: false,
        currentItemId: '',
        isCost: false,
      },
      async () => await this.getData(),
    );
  };

  setPagingAvailable = () => {
    this.setState({
      isPagingAvailable: dayPagingAvailable(this.state.date),
    });
  };

  async componentDidMount() {
    await this.getData();
    registerLocale('hu', hu);
  }

  render() {
    const {
      t,
      balance,
      items,
      createItem,
      updateItem,
      deleteItem,
      setDescriptionMapping,
      descriptionMapping,
    } = this.props;
    const {
      date,
      isPagingAvailable,
      itemModalShown,
      modalType,
      currentItemId,
      isCost,
    } = this.state;
    if (!items) {
      return null;
    }
    const currentItem = items.find((item) => item._id === currentItemId);
    return (
      <div className="dashboard">
        <div className="balance">
          {t('DASHBOARD.BALANCE', { balance: getMoneyString(balance) })}
        </div>
        <AddItemContainer showItemModal={this.showItemModal} />
        <DatePickerContainer
          date={date}
          onDateChange={this.onDateChange}
          changeDateWith={this.changeDateWith}
          isPagingAvailable={isPagingAvailable}
        />
        <ItemList showItemModal={this.showItemModal} items={items} />
        <ItemModal
          shown={itemModalShown}
          id={currentItemId}
          hide={this.hideItemModal}
          category={
            currentItem
              ? t(
                  `COMMON.CATEGORIES.${
                    currentItem.category as CostCategory | IncomeCategory
                  }`,
                )
              : isCost
              ? (CostCategories[0] as CostCategory)
              : (IncomeCategories[0] as IncomeCategory)
          }
          amount={currentItem?.amount}
          description={currentItem?.description}
          date={date}
          type={modalType}
          createItem={createItem}
          updateItem={updateItem}
          deleteItem={deleteItem}
          isCost={isCost}
          setDescriptionMapping={setDescriptionMapping}
          descriptionMapping={descriptionMapping}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return {
    balance: state.dashboard.balance,
    items: state.dashboard.items,
    notification: state.common.notification,
    descriptionMapping: state.common.descriptionMapping,
  };
};

const mapDispatchToProps = {
  getDashboardData,
  createItem,
  updateItem,
  deleteItem,
  setDescriptionMapping,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default compose(connector)(withTranslation()(Dashboard));
