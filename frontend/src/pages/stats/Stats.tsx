import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';
import classNames from 'classnames';

import { Months } from 'common/Constants';
import { compose } from 'utils/compose';
import { getMoneyString, monthPagingAvailable } from 'utils/util';
import { getStatsData } from 'store/stats';
import './Stats.scss';

export interface StatsPageProps
  extends WithTranslation,
    ConnectedProps<typeof connector> {
  balance: number;
  total_income: number;
  total_cost: number;
  balance_in_month: number;
  daily_average: number;
  daily_average_without_house: number;
  expected_cost: number;
  expected_balance_in_month: number;
  expected_balance: number;
}

export interface StatsPageState {
  date: Date;
  isPagingAvailable: {
    left: boolean;
    right: boolean;
  };
}

class Stats extends Component<StatsPageProps, StatsPageState> {
  readonly state = {
    date: new Date(),
    isPagingAvailable: {
      left: true,
      right: false,
    },
  };

  getData = async () => {
    const { getStatsData } = this.props;
    await getStatsData(this.state.date.toISOString());
  };

  changeMonthWith = async (value: number) => {
    const { date } = this.state;
    const d = date;
    d.setMonth(date.getMonth() + value);
    d.setDate(this.isThisMonth(d) ? new Date().getDate() : 28);
    await this.setState({ date: d });
    this.setPagingAvailable();
    await this.getData();
  };

  isThisMonth = (date: Date) =>
    date.getFullYear() === new Date().getFullYear() &&
    date.getMonth() === new Date().getMonth();

  setPagingAvailable = () => {
    this.setState({
      isPagingAvailable: monthPagingAvailable(this.state.date),
    });
  };

  async componentDidMount() {
    await this.getData();
  }

  render() {
    if (!this.props.stats) return null;
    const {
      stats: {
        balance,
        total_income,
        total_cost,
        balance_in_month,
        daily_average,
        daily_average_without_house,
        expected_cost,
        expected_balance_in_month,
        expected_balance,
      },
      t,
    } = this.props;
    const { date, isPagingAvailable } = this.state;
    return (
      <div className="stats-container">
        {[
          balance,
          total_income,
          total_cost,
          balance_in_month,
          daily_average,
          daily_average_without_house,
          expected_cost,
          expected_balance_in_month,
          expected_balance,
        ].map((amount, i) => (
          <div
            className={classNames({
              'green-item': i === 1,
              'red-item': i === 2,
            })}
          >
            <div className="stats-label">{t(`STATS.LABELS.${i}`)}</div>
            <div className="amount">{getMoneyString(amount)}</div>
          </div>
        ))}

        <div className="month-pager-container date-picker-container">
          <div
            className={classNames('paginate left', {
              visible: isPagingAvailable.left,
            })}
            onClick={() => isPagingAvailable.left && this.changeMonthWith(-1)}
          />
          <div className="month-pager">
            {`${date.getFullYear()}. ${Months[date.getMonth()]}`}
          </div>
          <div
            className={classNames('paginate right', {
              visible: isPagingAvailable.right,
            })}
            onClick={() => isPagingAvailable.right && this.changeMonthWith(1)}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return {
    stats: state.stats.data,
  };
};

const mapDispatchToProps = {
  getStatsData,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default compose(connector)(withTranslation()(Stats));
