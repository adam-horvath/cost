import React, { Component } from 'react';
import { Button, DropdownButton } from 'react-bootstrap';
import { connect, ConnectedProps } from 'react-redux';
import { compose } from 'redux';
import { withTranslation, WithTranslation } from 'react-i18next';
import classNames from 'classnames';

import { ToggleButton } from 'components/togglebutton/ToggleButton';
import Checkbox from 'components/checkbox/Checkbox';
import { BarChartModal } from './BarChartModal';
import { LineChartModal } from './LineChartModal';
import { CategoryCheckboxes, Months } from 'common/Constants';
import { ChartParamsModel } from 'models/chart.model';
import { ToggleState } from 'models/query.model';
import { getMonths, getYearItems } from 'components/dropdown/DropDownItems';
import { getChartData } from 'store/chart';
import './Charts.scss';

export interface ChartProps
  extends WithTranslation,
    ConnectedProps<typeof connector> {}

export interface ChartState {
  intervalType: IntervalType;
  selectedYear: number;
  selectedMonthIndex: number;
  activeChartTypeToggle: ToggleState;
  categories: Array<boolean>;
  sumChecked: boolean;
  isButtonDisabled: boolean;
  isBarChartShown: boolean;
  isLineChartShown: boolean;
}

export enum IntervalType {
  Month = 'month',
  Year = 'year',
  Full = 'full',
}

class Charts extends Component<ChartProps, ChartState> {
  state = {
    intervalType: IntervalType.Month,
    selectedYear: new Date().getFullYear(),
    selectedMonthIndex: new Date().getMonth(),
    activeChartTypeToggle: ToggleState.Left,
    categories: new Array(CategoryCheckboxes.length).fill(false),
    sumChecked: false,
    isButtonDisabled: true,
    isBarChartShown: false,
    isLineChartShown: false,
  };

  getParams = () => {
    const params: ChartParamsModel = {};
    const { selectedMonthIndex, selectedYear } = this.state;
    switch (this.state.intervalType) {
      case IntervalType.Month:
        params.min_month = selectedMonthIndex;
        params.max_month = selectedMonthIndex;
        params.min_year = selectedYear;
        params.max_year = selectedYear;
        break;
      case IntervalType.Year:
        params.min_year = selectedYear;
        params.max_year = selectedYear;
        break;
      default:
        break;
    }
    params.category_types = this.getCategoryTypesParam();
    params.categories = this.getCategoriesParam();
    return params;
  };

  getCategoriesParam = () => {
    const { t } = this.props;
    const { categories } = this.state;
    return CategoryCheckboxes.slice(3)
      .reduce(
        (prev, next) =>
          (prev === CategoryCheckboxes[3]
            ? categories[3]
              ? t(`COMMON.ENGLISH_CATEGORIES.${prev}`) + ','
              : ''
            : prev) +
          (categories[CategoryCheckboxes.indexOf(next)]
            ? t(`COMMON.ENGLISH_CATEGORIES.${next}`) + ','
            : ''),
      )
      .slice(0, -1);
  };

  getCategoryTypesParam = () => {
    const { t } = this.props;
    let categoryTypes = '';
    for (let i = 0; i < 3; i++) {
      if (this.state.categories[i]) {
        categoryTypes +=
          t(`COMMON.ENGLISH_CATEGORIES.${CategoryCheckboxes[i]}`) + ',';
      }
    }
    return categoryTypes.slice(0, -1);
  };

  isButtonDisabled = () => {
    const checked = this.getNumberOfCheckedCategories();
    return (
      checked === 0 ||
      (this.state.activeChartTypeToggle === ToggleState.Right && checked > 8)
    );
  };

  getNumberOfCheckedCategories = () =>
    this.state.categories.reduce((prev, next) => +prev + +next);

  setChecked = (index?: number) => {
    if (!!index || index === 0) {
      const categories = this.state.categories;
      categories[index] = !categories[index];
      this.setState({
        categories: categories,
        isButtonDisabled: this.isButtonDisabled(),
      });
    }
  };

  setSumChecked = () => {
    this.setState({ sumChecked: !this.state.sumChecked });
  };

  getCheckboxes = () => {
    const { categories, activeChartTypeToggle, sumChecked } = this.state;
    return CategoryCheckboxes.map((text: string) => {
      return (
        <div
          className="checkbox-parent col-xl-2 col-lg-3 col-md-4 col-sm-4 col-xs-6"
          key={CategoryCheckboxes.indexOf(text)}
        >
          <Checkbox
            index={CategoryCheckboxes.indexOf(text)}
            className="checkbox"
            isChecked={categories[CategoryCheckboxes.indexOf(text)]}
            setChecked={this.setChecked}
            text={text}
          />
          {text === 'Egyenleg' &&
          activeChartTypeToggle === ToggleState.Right ? (
            <div className="sumbox-container">
              <span>(&Sigma;</span>
              <Checkbox
                index={-1}
                text=""
                isChecked={sumChecked}
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

  onRadioButtonClick = (active: IntervalType) => {
    this.setState({ intervalType: active });
  };

  onSelectYear = async (year: number) => {
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

  onSelectMonth = async (index: number) => {
    await this.setState({ selectedMonthIndex: index });
  };

  switchChartType = () => {
    this.setState({
      activeChartTypeToggle:
        this.state.activeChartTypeToggle === ToggleState.Left
          ? ToggleState.Right
          : ToggleState.Left,
    });
  };

  getChartData = async () => {
    await this.props.getChartData(this.getParams());
    if (
      this.state.intervalType !== IntervalType.Month &&
      this.state.activeChartTypeToggle === ToggleState.Right
    ) {
      this.setState({ isLineChartShown: true });
    } else {
      this.setState({ isBarChartShown: true });
    }
  };

  hideBarChartModal = () => {
    this.setState({ isBarChartShown: false });
  };

  hideLineChartModal = () => {
    this.setState({ isLineChartShown: false });
  };

  render() {
    const { t } = this.props;
    const {
      intervalType,
      selectedYear,
      selectedMonthIndex,
      activeChartTypeToggle,
      sumChecked,
      isBarChartShown,
      isButtonDisabled,
      isLineChartShown,
    } = this.state;
    return (
      <div className="chart-container">
        <div className="cost-label">{t('CHART.INTERVAL_TYPE')}</div>
        <div className="button-group">
          <Button
            className={classNames('button-group-item month col-xs-4', {
              active: intervalType === IntervalType.Month,
            })}
            onClick={() => this.onRadioButtonClick(IntervalType.Month)}
          >
            {t('CHART.MONTHLY')}
          </Button>
          <Button
            className={classNames('button-group-item year col-xs-4', {
              active: intervalType === IntervalType.Year,
            })}
            onClick={() => this.onRadioButtonClick(IntervalType.Year)}
          >
            {t('CHART.YEARLY')}
          </Button>
          <Button
            className={classNames('button-group-item full col-xs-4', {
              active: intervalType === IntervalType.Full,
            })}
            onClick={() => this.onRadioButtonClick(IntervalType.Full)}
          >
            {t('CHART.FULL')}
          </Button>
        </div>
        <div
          className={classNames('interval-container', {
            row: intervalType === IntervalType.Month,
          })}
        >
          {intervalType !== IntervalType.Full && (
            <div
              className={classNames('dropdown-container year', {
                'col-xs-12 col-sm-6 w_50': intervalType === IntervalType.Month,
              })}
            >
              <div className="year">
                <div className="cost-label">{t('CHART.YEAR')}</div>
                <DropdownButton title={selectedYear} id="year-dropdown">
                  {getYearItems(this.onSelectYear)}
                </DropdownButton>
              </div>
            </div>
          )}
          {intervalType === IntervalType.Month && (
            <div className={'dropdown-container month col-xs-12 col-sm-6'}>
              <div className="month">
                <div className="cost-label">{t('CHART.MONTH')}</div>
                <DropdownButton
                  title={Months[selectedMonthIndex]}
                  id="month-dropdown"
                >
                  {getMonths(this.onSelectMonth, selectedYear)}
                </DropdownButton>
              </div>
            </div>
          )}
          {intervalType !== IntervalType.Month && (
            <div
              className={`dropdown-container type ${
                intervalType === 'year' ? 'col-xs-6' : 'col-xs-12 full-sized'
              }`}
            >
              <div className="chart-type">
                <div className="cost-label">{t('CHART.CHART_TYPE')}</div>
                <ToggleButton
                  active={activeChartTypeToggle}
                  onClick={this.switchChartType}
                  leftText={t('CHART.AMOUNT')}
                  rightText={t('CHART.TREND')}
                />
              </div>
            </div>
          )}
          <div style={{ clear: 'both' }} />
        </div>
        <div className="category-container">
          <div className="cost-label">{t('CHART.CATEGORIES')}</div>
          <div className="checkbox-container row no-gutters">
            {this.getCheckboxes()}
          </div>
          <div style={{ clear: 'both' }} />
        </div>
        <div className="button-container">
          <Button
            className="btn"
            onClick={this.getChartData}
            disabled={isButtonDisabled}
          >
            {t('COMMON.OK')}
          </Button>
        </div>
        <BarChartModal
          shown={isBarChartShown}
          title={t('CHART.BAR_CHART_SUM_BY_CATEGORIES')}
          onClose={this.hideBarChartModal}
          numberOfBars={this.getNumberOfCheckedCategories()}
        />
        <LineChartModal
          shown={isLineChartShown}
          title={t('CHART.LINE_CHART_SUM_BY_CATEGORIES')}
          onClose={this.hideLineChartModal}
          isSum={sumChecked}
        />
      </div>
    );
  }
}

const mapDispatchToProps = {
  getChartData,
};

const connector = connect(null, mapDispatchToProps);

export default compose(connector)(withTranslation()(Charts));
