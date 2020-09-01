import React, { Component } from "react";
import "./ChartConfig.scss";
import { connect } from "react-redux";
import request from "../../lib/request";
import PropTypes from "prop-types";
import Constants from "../../common/Constants";
import { DropdownButton, Button } from "react-bootstrap";
import "../../styles/Dropdown.scss";
import Util from "../../common/Util";
import ToggleButton from "../../common/ToggleButton";
import Checkbox from "../../common/Checkbox";
import { bubble, chartData, logout, offline } from "../../redux/actions";
import BarChartModal from "./BarChartModal";
import LineChartModal from "./LineChartModal";

class ChartConfig extends Component {
  state = {
    intervalType: "month",
    selectedYear: new Date().getFullYear(),
    selectedMonthIndex: new Date().getMonth(),
    activeChartTypeToggle: "left",
    categories: Util.getInitialCheckboxStates(),
    sumChecked: false,
    isButtonDisabled: true,
    isBarChartShown: false,
    isLineChartShown: false
  };

  getParams = () => {
    const params = {};
    switch (this.state.intervalType) {
      case "month":
        params["min_month"] = this.state.selectedMonthIndex;
        params["max_month"] = this.state.selectedMonthIndex;
        params["min_year"] = this.state.selectedYear;
        params["max_year"] = this.state.selectedYear;
        break;
      case "year":
        params["min_year"] = this.state.selectedYear;
        params["max_year"] = this.state.selectedYear;
        break;
      default:
        break;
    }
    params["category_types"] = this.getCategoryTypesParam();
    params["categories"] = this.getCategoriesParam();
    return params;
  };

  getCategoriesParam = () =>
    Constants.CATEGORY_CHECKBOXES.slice(3)
      .reduce(
        (prev, next) =>
          (prev === Constants.CATEGORY_CHECKBOXES[3]
            ? this.state.categories[3]
              ? Util.getEnglishCategory(prev) + ","
              : ""
            : prev) +
          (this.state.categories[Constants.CATEGORY_CHECKBOXES.indexOf(next)]
            ? Util.getEnglishCategory(next) + ","
            : "")
      )
      .slice(0, -1);

  getCategoryTypesParam = () => {
    let categoryTypes = "";
    for (let i = 0; i < 3; i++) {
      if (this.state.categories[i]) {
        categoryTypes +=
          Util.getEnglishCategory(Constants.CATEGORY_CHECKBOXES[i]) + ",";
      }
    }
    return categoryTypes.slice(0, -1);
  };

  isButtonDisabled = () => {
    const checked = this.getNumberOfCheckedCategories();
    return (
      checked === 0 ||
      (this.state.activeChartTypeToggle === "right" && checked > 8)
    );
  };

  getNumberOfCheckedCategories = () =>
    this.state.categories.reduce((prev, next) => +prev + +next);

  setChecked = index => {
    const categories = this.state.categories;
    categories[index] = !categories[index];
    this.setState({
      categories: categories,
      isButtonDisabled: this.isButtonDisabled()
    });
  };

  setSumChecked = () => {
    this.setState({ sumChecked: !this.state.sumChecked });
  };

  getCheckboxes = () => {
    return Constants.CATEGORY_CHECKBOXES.map(text => {
      return (
        <div
          className="checkbox-parent col-lg-2 col-md-3 col-sm-4 col-xs-6"
          key={Constants.CATEGORY_CHECKBOXES.indexOf(text)}
        >
          <Checkbox
            index={Constants.CATEGORY_CHECKBOXES.indexOf(text)}
            className="checkbox"
            isChecked={
              this.state.categories[Constants.CATEGORY_CHECKBOXES.indexOf(text)]
            }
            setChecked={this.setChecked}
            text={text}
          />
          {text === "Egyenleg" &&
          this.state.activeChartTypeToggle === "right" ? (
            <div className="sumbox-container">
              <span>(&Sigma;</span>
              <Checkbox
                index={-1}
                text=""
                isChecked={this.state.sumChecked}
                className="checkbox sumbox"
                setChecked={this.setSumChecked}
              />
              <span>)</span>
            </div>
          ) : null}
        </div>
      );
    });
  };

  onRadioButtonClick = active => {
    this.setState({ intervalType: active });
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
  };

  onSelectMonth = async index => {
    await this.setState({ selectedMonthIndex: index });
  };

  switchChartType = () => {
    this.setState({
      activeChartTypeToggle:
        this.state.activeChartTypeToggle === "left" ? "right" : "left"
    });
  };

  getChartData = async () => {
    const { dispatch } = this.props;
    const response = await request({
      url: Util.getEndpoint("v1/chart"),
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
      await dispatch(chartData(response.result));
      if (
        this.state.intervalType !== "month" &&
        this.state.activeChartTypeToggle === "right"
      ) {
        this.setState({ isLineChartShown: true });
      } else {
        this.setState({ isBarChartShown: true });
      }
    }
  };

  hideBarChartModal = () => {
    this.setState({ isBarChartShown: false });
  };

  hideLineChartModal = () => {
    this.setState({ isLineChartShown: false });
  };

  render() {
    return (
      <div className="chart-container">
        <div className="cost-label">Intervallum típusa</div>
        <div className="button-group">
          <Button
            className={`button-group-item month col-xs-4 ${
              this.state.intervalType === "month" ? "active" : ""
            }`}
            onClick={() => this.onRadioButtonClick("month")}
          >
            Havi
          </Button>
          <Button
            className={`button-group-item year col-xs-4 ${
              this.state.intervalType === "year" ? "active" : ""
            }`}
            onClick={() => this.onRadioButtonClick("year")}
          >
            Éves
          </Button>
          <Button
            className={`button-group-item full col-xs-4 ${
              this.state.intervalType === "full" ? "active" : ""
            }`}
            onClick={() => this.onRadioButtonClick("full")}
          >
            Teljes
          </Button>
        </div>
        <div className="interval-container">
          {this.state.intervalType !== "full" && (
            <div className="dropdown-container year col-xs-6">
              <div className="year">
                <div className="cost-label">Év</div>
                <DropdownButton
                  title={this.state.selectedYear}
                  id="year-dropdown"
                >
                  {Util.getYears(this.onSelectYear)}
                </DropdownButton>
              </div>
            </div>
          )}
          {this.state.intervalType === "month" && (
            <div className="dropdown-container month col-xs-6">
              <div className="month">
                <div className="cost-label">Hónap</div>
                <DropdownButton
                  title={Constants.MONTHS[this.state.selectedMonthIndex]}
                  id="month-dropdown"
                >
                  {Util.getMonths(this.onSelectMonth, this.state.selectedYear)}
                </DropdownButton>
              </div>
            </div>
          )}
          {this.state.intervalType !== "month" && (
            <div
              className={`dropdown-container type ${
                this.state.intervalType === "year"
                  ? "col-xs-6"
                  : "col-xs-12 full-sized"
              }`}
            >
              <div className="chart-type">
                <div className="cost-label">Diagram-típus</div>
                <ToggleButton
                  active={this.state.activeChartTypeToggle}
                  switchActive={this.switchChartType}
                  leftText="Összeg"
                  rightText="Trend"
                />
              </div>
            </div>
          )}
          <div style={{ clear: "both" }} />
        </div>
        <div className="category-container">
          <div className="cost-label">Kategóriák</div>
          <div className="checkbox-container">{this.getCheckboxes()}</div>
          <div style={{ clear: "both" }} />
        </div>
        <div className="button-container">
          <Button
            className="btn"
            onClick={this.getChartData}
            disabled={this.state.isButtonDisabled}
          >
            OK
          </Button>
        </div>
        {this.state.isBarChartShown && (
          <BarChartModal
            shown={this.state.isBarChartShown}
            hide={this.hideBarChartModal}
            numberOfBars={this.getNumberOfCheckedCategories()}
          />
        )}
        {this.state.isLineChartShown && (
          <LineChartModal
            shown={this.state.isLineChartShown}
            hide={this.hideLineChartModal}
            isSum={this.state.sumChecked}
          />
        )}
      </div>
    );
  }
}

ChartConfig.propTypes = {
  chartData: PropTypes.object,
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

export default connect(mapStateToProps)(ChartConfig);
