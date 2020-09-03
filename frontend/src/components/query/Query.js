import React, { Component } from "react";
import "./Query.scss";
import { connect } from "react-redux";
import request from "../../lib/request";
import { bubble, query, queryList, offline, logout } from "../../redux/actions";
import PropTypes from "prop-types";
import Constants from "../../common/Constants";
import ToggleButton from "../../common/ToggleButton";
import { DropdownButton, Dropdown, Button } from "react-bootstrap";
import "../../styles/Dropdown.scss";
import DatePicker from "react-datepicker";
import moment from "moment-timezone";
import "../../styles/DatePicker.scss";
import Util from "../../common/Util";
import QuerySumModal from "./QuerySumModal";
import QueryListModal from "./QueryListModal";

class Query extends Component {
  state = {
    activeCollectionToggle: "left",
    activeCategoryTypeToggle: "left",
    activeExclusionToggle: "left",
    selectedCategoryIndex: 0,
    description: "",
    activeFullMatchToggle: "right",
    minAmount: "",
    maxAmount: "",
    minDate: null,
    maxDate: null,
    selectedYear: new Date().getFullYear(),
    selectedMonthIndex: new Date().getMonth(),
    sumModalShown: false,
    listModalShown: false
  };

  getParams = () => {
    let params = {
      collection:
        this.state.activeCollectionToggle === "left" ? "item" : "balance",
      category_type:
        this.state.activeCategoryTypeToggle === "left" ? "COST" : "INCOME"
    };
    if (params.collection === "item") {
      if (this.state.selectedCategoryIndex) {
        params["category"] = Util.getEnglishCategory(
          this.state.activeCategoryTypeToggle === "left"
            ? Constants.COST_CATEGORIES_WITH_EMPTY[
                this.state.selectedCategoryIndex
              ]
            : Constants.INCOME_CATEGORIES_WITH_EMPTY[
                this.state.selectedCategoryIndex
              ]
        );
        if (this.state.activeExclusionToggle === "right") {
          params["exclude_category"] = true;
        }
      }
      if (this.state.description) {
        params["description"] = this.state.description;
        params["description_like"] = (
          this.state.activeFullMatchToggle === "left"
        ).toString();
      }
      if (this.state.minAmount) {
        params["min_amount"] = this.state.minAmount;
      }
      if (this.state.maxAmount) {
        params["max_amount"] = this.state.maxAmount;
      }
      if (this.state.minDate) {
        const minDate = this.state.minDate;
        minDate.setHours(2);
        params["min_date"] = minDate;
      }
      if (this.state.maxDate) {
        const maxDate = this.state.maxDate;
        maxDate.setHours(25);
        maxDate.setMinutes(59);
        params["max_date"] = maxDate;
      }
    } else {
      params["year"] = this.state.selectedYear;
      params["month"] = this.state.selectedMonthIndex;
    }
    return params;
  };

  switchActiveCollectionToggle = async () => {
    await this.setState({
      activeCollectionToggle:
        this.state.activeCollectionToggle === "left" ? "right" : "left"
    });
    this.state.activeCollectionToggle === "right" && this.getSum();
  };

  switchActiveCategoryTypeToggle = () => {
    this.setState({
      activeCategoryTypeToggle:
        this.state.activeCategoryTypeToggle === "left" ? "right" : "left"
    });
  };

  switchActiveExclusionToggle = () => {
    this.setState({
      activeExclusionToggle:
        this.state.activeExclusionToggle === "left" ? "right" : "left"
    });
  };

  getMenuItems = array => {
    return array.map((category, i) => (
      <Dropdown.Item eventKey={i} key={i} onSelect={() => this.onSelectCategory(i)}>
        {category}
      </Dropdown.Item>
    ));
  };

  onSelectCategory = index => {
    this.setState({ selectedCategoryIndex: index });
  };

  onSelectYear = async year => {
    let month = this.state.selectedMonthIndex;
    const now = new Date();
    if (
      year === now.getFullYear() &&
      this.state.selectedMonthIndex > now.getMonth()
    ) {
      month = now.getMonth();
    }
    if (year === 2015 && this.state.selectedMonthIndex < 8) {
      month = 8;
    }
    await this.setState({ selectedYear: year, selectedMonthIndex: month });
    this.getSum();
  };

  onSelectMonth = async index => {
    await this.setState({ selectedMonthIndex: index });
    this.getSum();
  };

  onDescriptionChange = description => {
    this.setState({ description });
  };

  switchActiveFullMatchToggle = () => {
    this.setState({
      activeFullMatchToggle:
        this.state.activeFullMatchToggle === "left" ? "right" : "left"
    });
  };

  onMinAmountChange = amount => {
    this.setState({ minAmount: amount });
  };

  onMaxAmountChange = amount => {
    this.setState({ maxAmount: amount });
  };

  onMinDateChange = momentDate => {
    if (
      momentDate &&
      momentDate.isAfter(moment.tz(this.state.maxDate, Constants.TIME_ZONE))
    ) {
      this.setState({ maxDate: null });
    }
    momentDate
      ? this.setState({ minDate: new Date(momentDate) })
      : this.setState({ minDate: null });
  };

  onMaxDateChange = momentDate => {
    if (
      momentDate &&
      momentDate.isBefore(moment.tz(this.state.minDate, Constants.TIME_ZONE))
    ) {
      this.setState({ minDate: null });
    }
    momentDate
      ? this.setState({ maxDate: new Date(momentDate) })
      : this.setState({ maxDate: null });
  };

  isInvalidInput = () =>
    (this.state.minAmount.trim() &&
      this.state.minAmount
        .trim()
        .toString()
        .replace(/\d/g, "").length) ||
    (this.state.maxAmount.trim() &&
      this.state.maxAmount
        .trim()
        .toString()
        .replace(/\d/g, "").length);

  getSum = async () => {
    const { dispatch } = this.props;
    const response = await request({
      url: Util.getEndpoint("v1/query"),
      data: this.getParams()
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
      dispatch(
        query({
          value: response.value
        })
      );
      this.state.activeCollectionToggle === "left" &&
        this.setState({ sumModalShown: true });
    }
  };

  getList = async () => {
    const { dispatch } = this.props;
    const response = await request({
      url: Util.getEndpoint("v1/query-list"),
      data: this.getParams()
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
      const items = [];
      let date = null;
      response.items.forEach(item => {
        if (date == null || date !== item.date) {
          items.push({
            type: "header",
            date: item.date
          });
          date = item.date;
        }
        items.push(item);
      });
      dispatch(
        queryList({
          items: items
        })
      );
      this.state.activeCollectionToggle === "left" &&
        this.setState({ listModalShown: true });
    }
  };

  hideSumModal = () => {
    this.setState({ sumModalShown: false });
  };

  hideListModal = () => {
    this.setState({ listModalShown: false });
  };

  render() {
    return (
      <div className="query">
        <div className="collection">
          <div className="cost-label">Lekérdezés típusa</div>
          <ToggleButton
            active={this.state.activeCollectionToggle}
            switchActive={this.switchActiveCollectionToggle}
            leftText="Tétel"
            rightText="Egyenleg"
          />
        </div>
        {this.state.activeCollectionToggle === "left" ? (
          <div className="item">
            <div className="category-type">
              <div className="cost-label">Kategória típusa</div>
              <ToggleButton
                active={this.state.activeCategoryTypeToggle}
                switchActive={this.switchActiveCategoryTypeToggle}
                leftText="Kiadás"
                rightText="Bevétel"
              />
            </div>
            <div className="category">
              <div className="cost-label">Kategória</div>
              <div className="category-toggle-container">
                <div className="negate">
                  <ToggleButton
                    active={this.state.activeExclusionToggle}
                    switchActive={this.switchActiveExclusionToggle}
                    leftText=""
                    rightText="Nem"
                  />
                </div>
                <div className="category">
                  <DropdownButton
                    title={
                      this.state.activeCategoryTypeToggle === "left"
                        ? Constants.COST_CATEGORIES_WITH_EMPTY[
                            this.state.selectedCategoryIndex
                          ]
                        : Constants.INCOME_CATEGORIES_WITH_EMPTY[
                            this.state.selectedCategoryIndex
                          ]
                    }
                    id="dropdown"
                  >
                    {this.getMenuItems(
                      this.state.activeCategoryTypeToggle === "left"
                        ? Constants.COST_CATEGORIES_WITH_EMPTY
                        : Constants.INCOME_CATEGORIES_WITH_EMPTY
                    )}
                  </DropdownButton>
                </div>
              </div>
            </div>
            <div className="description-container-panel">
              <div className="description-container">
                <div className="cost-label">Leírás</div>
                <input
                  className="description"
                  value={this.state.description}
                  onChange={e => this.onDescriptionChange(e.target.value)}
                />
              </div>
              <div className="full-match-container">
                <div className="cost-label">Teljes egyezés</div>
                <ToggleButton
                  active={this.state.activeFullMatchToggle}
                  switchActive={this.switchActiveFullMatchToggle}
                  leftText="Nem"
                  rightText="Igen"
                />
              </div>
            </div>
            <div className="amount-container">
              <div className="minimal-amount-container">
                <div className="cost-label">Minimum összeg</div>
                <input
                  className="minimal-amount amount"
                  value={this.state.minAmount}
                  type="number"
                  onChange={e => this.onMinAmountChange(e.target.value)}
                />
              </div>
              <div className="maximal-amount-container">
                <div className="cost-label">Maximum összeg</div>
                <input
                  className="maximal-amount amount"
                  value={this.state.maxAmount}
                  type="number"
                  onChange={e => this.onMaxAmountChange(e.target.value)}
                />
              </div>
            </div>
            <div className="date-container">
              <div className="minimal-date-container">
                <div className="cost-label">Ettől</div>
                <div className="minimal-date date date-picker-container">
                  <DatePicker
                    selected={
                      this.state.minDate &&
                      moment.tz(this.state.minDate, Constants.TIME_ZONE)
                    }
                    onChange={this.onMinDateChange}
                    locale="hu"
                    dropdownMode={"select"}
                    todayButton={"Mai nap"}
                    isClearable={false}
                    minDate={moment.tz(
                      new Date("2015-09-30"),
                      Constants.TIME_ZONE
                    )}
                    maxDate={moment.tz(new Date(), Constants.TIME_ZONE)}
                    dateFormatCalendar="YYYY MMMM"
                  />
                  {this.state.minDate ? (
                    <div
                      className="close-icon"
                      onClick={() => this.onMinDateChange(null)}
                    />
                  ) : null}
                </div>
              </div>
              <div className="maximal-date-container">
                <div className="cost-label">Eddig</div>
                <div className="maximal-date date date-picker-container">
                  <DatePicker
                    selected={
                      this.state.maxDate &&
                      moment.tz(this.state.maxDate, Constants.TIME_ZONE)
                    }
                    onChange={this.onMaxDateChange}
                    locale="hu"
                    dropdownMode={"select"}
                    todayButton={"Mai nap"}
                    isClearable={false}
                    minDate={moment.tz(
                      new Date("2015-09-30"),
                      Constants.TIME_ZONE
                    )}
                    maxDate={moment.tz(new Date(), Constants.TIME_ZONE)}
                    dateFormatCalendar="YYYY MMMM"
                  />
                  {this.state.maxDate ? (
                    <div
                      className="close-icon"
                      onClick={() => this.onMaxDateChange(null)}
                    />
                  ) : null}
                </div>
              </div>
            </div>
            <div className="button-container">
              <Button
                className="query-sum"
                bsStyle="primary"
                type="submit"
                onClick={this.getSum}
                disabled={!!this.isInvalidInput()}
              >
                Összeg
              </Button>
              <Button
                className="query-list"
                bsStyle="primary"
                type="submit"
                onClick={this.getList}
                disabled={!!this.isInvalidInput()}
              >
                Lista
              </Button>
            </div>
          </div>
        ) : (
          <div className="balance">
            <div className="year">
              <div className="cost-label">Év</div>
              <DropdownButton
                title={this.state.selectedYear}
                id="year-dropdown"
              >
                {Util.getYears(this.onSelectYear)}
              </DropdownButton>
            </div>
            <div className="month">
              <div className="cost-label">Hónap</div>
              <DropdownButton
                title={Constants.MONTHS[this.state.selectedMonthIndex]}
                id="month-dropdown"
              >
                {Util.getMonths(this.onSelectMonth, this.state.selectedYear)}
              </DropdownButton>
            </div>
            <div className="result-container">
              <div className="cost-label">Egyenleg</div>
              <div className="result">
                {this.props.query
                  ? Util.getMoneyString(this.props.query.value)
                  : ""}
              </div>
            </div>
          </div>
        )}
        {this.state.sumModalShown && (
          <QuerySumModal
            shown={this.state.sumModalShown}
            hide={this.hideSumModal}
            value={this.props.query.value}
          />
        )}
        {this.state.listModalShown && (
          <QueryListModal
            shown={this.state.listModalShown}
            hide={this.hideListModal}
            items={this.props.query.items || []}
          />
        )}
      </div>
    );
  }
}

Query.propTypes = {
  value: PropTypes.number,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      group_id: PropTypes.string,
      amount: PropTypes.number,
      description: PropTypes.string,
      category: PropTypes.string,
      category_type: PropTypes.string,
      date: PropTypes.string,
      year: PropTypes.number,
      month: PropTypes.number,
      day: PropTypes.number,
      __v: PropTypes.number
    })
  ),
  bubble: PropTypes.shape({
    shown: PropTypes.bool,
    text: PropTypes.string,
    isError: PropTypes.bool
  })
};

const mapStateToProps = state => {
  const { query, bubble } = state;
  return { query, bubble };
};

export default connect(mapStateToProps)(Query);
