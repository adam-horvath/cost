import React, { Component } from "react";
import "./Stats.scss";
import request from "../../lib/request";
import Util from "../../common/Util";
import Constants from "../../common/Constants";
import { bubble, offline, logout } from "../../redux/actions";
import { connect } from "react-redux";
import PropTypes from "prop-types";

class Stats extends Component {
  state = {
    date: new Date(),
    isPagingAvailable: {
      left: true,
      right: false
    },
    stats: {
      balance: "",
      total_income: "",
      total_cost: "",
      balance_in_month: "",
      daily_average: "",
      daily_average_without_house: "",
      expected_cost: "",
      expected_balance_in_month: "",
      expected_balance: ""
    }
  };

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    const { dispatch } = this.props;
    const response = await request({
      url: Util.getEndpoint("v1/stats"),
      data: { date: this.state.date.toISOString() }
    });
    if (!response || response.error) {
      if (response && response.error) {
        dispatch(
          bubble({
            shown: true,
            text: response.status + " " + response.message,
            isError: true
          })
        );
        dispatch(logout());
      } else {
        dispatch(
          bubble({ shown: true, text: Constants.NO_CONNECTION, isError: true })
        );
        dispatch(offline(true));
      }
    } else {
      dispatch(offline(false));
      this.setState({ stats: response });
    }
  };

  changeMonthWith = async value => {
    const date = this.state.date;
    date.setMonth(this.state.date.getMonth() + value);
    date.setDate(this.isThisMonth(date) ? new Date().getDate() : 28);
    await this.setState({ date: date });
    this.setPagingAvailable();
    this.getData();
  };

  isThisMonth = date =>
    date.getFullYear() === new Date().getFullYear() &&
    date.getMonth() === new Date().getMonth();

  setPagingAvailable = () => {
    this.setState({
      isPagingAvailable: Util.monthPagingAvailable(this.state.date)
    });
  };

  render() {
    return (
      <div className="stats-container">
        <div className="plain-item">
          <div className="stats-label">Egyenleg</div>
          <div className="amount">
            {Util.getMoneyString(this.state.stats.balance)}
          </div>
        </div>
        <div className="green-item">
          <div className="stats-label">Havi bevétel</div>
          <div className="amount">
            {Util.getMoneyString(this.state.stats.total_income)}
          </div>
        </div>
        <div className="red-item">
          <div className="stats-label">Havi kiadás</div>
          <div className="amount">
            {Util.getMoneyString(this.state.stats.total_cost)}
          </div>
        </div>
        <div className="plain-item">
          <div className="stats-label">Havi egyenleg</div>
          <div className="amount">
            {Util.getMoneyString(this.state.stats.balance_in_month)}
          </div>
        </div>
        <div className="red-item">
          <div className="stats-label">Napi átlag kiadás</div>
          <div className="amount">
            {Util.getMoneyString(this.state.stats.daily_average)}
          </div>
        </div>
        <div className="red-item">
          <div className="stats-label">Változó kiadások napi átlaga</div>
          <div className="amount">
            {Util.getMoneyString(this.state.stats.daily_average_without_house)}
          </div>
        </div>
        <div className="plain-item">
          <div className="stats-label">Várható kiadás</div>
          <div className="amount">
            {Util.getMoneyString(this.state.stats.expected_cost)}
          </div>
        </div>
        <div className="plain-item">
          <div className="stats-label">Várható havi egyenleg</div>
          <div className="amount">
            {Util.getMoneyString(this.state.stats.expected_balance_in_month)}
          </div>
        </div>
        <div className="plain-item">
          <div className="stats-label">Várható hó végi egyenleg</div>
          <div className="amount">
            {Util.getMoneyString(this.state.stats.expected_balance)}
          </div>
        </div>
        <div className="month-pager-container">
          {this.state.isPagingAvailable.left ? (
            <div
              className="paginate visible left"
              onClick={() => this.changeMonthWith(-1)}
            />
          ) : (
            <div className="paginate left" />
          )}
          <div className="month-pager">
            {this.state.date.getFullYear()}.{" "}
            {Constants.MONTHS[this.state.date.getMonth()]}
          </div>
          {this.state.isPagingAvailable.right ? (
            <div
              className="paginate visible right"
              onClick={() => this.changeMonthWith(1)}
            />
          ) : (
            <div className="paginate right" />
          )}
        </div>
      </div>
    );
  }
}

Stats.propTypes = {
  bubble: PropTypes.shape({
    shown: PropTypes.bool,
    text: PropTypes.string,
    isError: PropTypes.bool
  })
};

const mapStateToProps = state => {
  const { bubble } = state;
  return { bubble };
};

export default connect(mapStateToProps)(Stats);
