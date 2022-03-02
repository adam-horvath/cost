import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { withTranslation, WithTranslation } from 'react-i18next';
import { registerLocale } from 'react-datepicker';
import moment from 'moment';
import hu from 'date-fns/locale/hu';

import { compose } from 'utils/compose';
import { getMoneyString } from 'utils/util';
import { DatePickerWrapper } from 'components/datepicker/DatePickerWrapper';
import { ToggleButton } from 'components/togglebutton/ToggleButton';
import { getYearItems, getMonths } from 'components/dropdown/DropDownItems';
import { QuerySumDialog } from './QuerySumDialog';
import { QueryListDialog } from './QueryListDialog';
import { getQueryData, getQueryList } from 'store/query';
import {
  CostCategories,
  CostCategoriesWithEmpty,
  IncomeCategories,
  IncomeCategoriesWithEmpty,
  Months,
} from 'common/Constants';
import {
  CategoryType,
  Collection,
  CostCategory,
  IncomeCategory,
} from 'models/common.model';
import { QueryParamsModel, ToggleState } from 'models/query.model';
import 'styles/dropdown.scss';
import './Query.scss';

export interface QueryPageProps
  extends WithTranslation,
    RouteComponentProps,
    ConnectedProps<typeof connector> {}

export interface QueryPageState {
  activeCollectionToggle: ToggleState;
  activeCategoryTypeToggle: ToggleState;
  activeExclusionToggle: ToggleState;
  selectedCategoryIndex: number;
  description: string;
  activeFullMatchToggle: ToggleState;
  minAmount: string;
  maxAmount: string;
  minDate: Date | null;
  maxDate: Date | null;
  selectedYear: number;
  selectedMonthIndex: number;
  sumModalShown: boolean;
  listModalShown: boolean;
}

class Query extends Component<QueryPageProps, QueryPageState> {
  state = {
    activeCollectionToggle: ToggleState.Left,
    activeCategoryTypeToggle: ToggleState.Left,
    activeExclusionToggle: ToggleState.Left,
    selectedCategoryIndex: 0,
    description: '',
    activeFullMatchToggle: ToggleState.Right,
    minAmount: '',
    maxAmount: '',
    minDate: null,
    maxDate: null,
    selectedYear: new Date().getFullYear(),
    selectedMonthIndex: new Date().getMonth(),
    sumModalShown: false,
    listModalShown: false,
  };

  getParams = () => {
    const { t } = this.props;
    const {
      activeCollectionToggle,
      activeCategoryTypeToggle,
      selectedCategoryIndex,
      activeExclusionToggle,
      description,
      activeFullMatchToggle,
      minAmount,
      maxAmount,
      minDate,
      maxDate,
      selectedYear,
      selectedMonthIndex,
    } = this.state;

    let params: QueryParamsModel = {
      collection:
        activeCollectionToggle === ToggleState.Left
          ? Collection.Item
          : Collection.Balance,
      category_type:
        activeCategoryTypeToggle === ToggleState.Left
          ? CategoryType.Cost
          : CategoryType.Income,
    };

    if (params.collection === Collection.Item) {
      if (selectedCategoryIndex) {
        params.category = t(
          `COMMON.ENGLISH_CATEGORIES.${
            activeCategoryTypeToggle === ToggleState.Left
              ? CostCategoriesWithEmpty[selectedCategoryIndex]
              : IncomeCategoriesWithEmpty[selectedCategoryIndex]
          }`,
        );
        if (activeExclusionToggle === ToggleState.Right) {
          params.exclude_category = true;
        }
      }
      if (description) {
        params.description = description;
        params.description_like = activeFullMatchToggle === ToggleState.Left;
      }
      if (minAmount) {
        params.min_amount = +minAmount;
      }
      if (maxAmount) {
        params.max_amount = +maxAmount;
      }
      if (minDate) {
        const min: Date = minDate || new Date();
        min.setHours(2);
        params.min_date = min;
      }
      if (maxDate) {
        const max: Date = maxDate || new Date();
        max.setHours(25);
        max.setMinutes(59);
        params.max_date = max;
      }
    } else {
      params.year = selectedYear;
      params.month = selectedMonthIndex;
    }
    return params;
  };

  switchActiveCollectionToggle = async () => {
    const { activeCollectionToggle } = this.state;
    this.setState(
      {
        activeCollectionToggle:
          activeCollectionToggle === ToggleState.Left
            ? ToggleState.Right
            : ToggleState.Left,
      },
      () => activeCollectionToggle === ToggleState.Right && this.getSum(),
    );
  };

  switchActiveCategoryTypeToggle = () => {
    this.setState({
      activeCategoryTypeToggle:
        this.state.activeCategoryTypeToggle === ToggleState.Left
          ? ToggleState.Right
          : ToggleState.Left,
    });
  };
  switchActiveExclusionToggle = () => {
    this.setState({
      activeExclusionToggle:
        this.state.activeExclusionToggle === ToggleState.Left
          ? ToggleState.Right
          : ToggleState.Left,
    });
  };

  getMenuItems = (array: (CostCategory | IncomeCategory | '')[]) =>
    array.map((category, i) => (
      <Dropdown.Item
        eventKey={`${i}`}
        key={i}
        onSelect={() => this.onSelectCategory(i)}
      >
        {category}
      </Dropdown.Item>
    ));

  onSelectCategory = (index: number) => {
    this.setState({ selectedCategoryIndex: index });
  };

  onSelectYear = async (year: number) => {
    const { selectedMonthIndex } = this.state;
    let month = selectedMonthIndex;
    const now = new Date();
    if (year === now.getFullYear() && selectedMonthIndex > now.getMonth()) {
      month = now.getMonth();
    }
    if (year === 2015 && selectedMonthIndex < 8) {
      month = 8;
    }
    this.setState({ selectedYear: year, selectedMonthIndex: month }, () =>
      this.getSum(),
    );
  };

  onSelectMonth = async (index: number) => {
    this.setState({ selectedMonthIndex: index }, () => this.getSum);
  };

  onDescriptionChange = (description: string) => {
    this.setState({ description });
  };

  switchActiveFullMatchToggle = () => {
    this.setState({
      activeFullMatchToggle:
        this.state.activeFullMatchToggle === ToggleState.Left
          ? ToggleState.Right
          : ToggleState.Left,
    });
  };

  onMinAmountChange = (amount: string) => {
    this.setState({ minAmount: amount });
  };

  onMaxAmountChange = (amount: string) => {
    this.setState({ maxAmount: amount });
  };

  onMinDateChange = (date: Date | null) => {
    if (date && moment(date).isAfter(moment(this.state.maxDate), 'day')) {
      this.setState({ maxDate: null });
    }
    date
      ? this.setState({ minDate: new Date(date) })
      : this.setState({ minDate: null });
  };

  onMaxDateChange = (date: Date | null) => {
    if (date && moment(date).isBefore(moment(this.state.minDate), 'day')) {
      this.setState({ minDate: null });
    }
    date
      ? this.setState({ maxDate: new Date(date) })
      : this.setState({ maxDate: null });
  };

  isInvalidInput = () =>
    (this.state.minAmount.trim() &&
      this.state.minAmount.trim().toString().replace(/\d/g, '').length) ||
    (this.state.maxAmount.trim() &&
      this.state.maxAmount.trim().toString().replace(/\d/g, '').length);

  getSum = async () => {
    const { getQueryData } = this.props;
    await getQueryData(this.getParams());
    this.state.activeCollectionToggle === ToggleState.Left &&
      this.setState({ sumModalShown: true });
  };

  getList = async () => {
    await this.props.getQueryList(this.getParams());
    this.state.activeCollectionToggle === ToggleState.Left &&
      this.setState({ listModalShown: true });
  };

  hideSumModal = () => {
    this.setState({ sumModalShown: false });
  };

  hideListModal = () => {
    this.setState({ listModalShown: false });
  };

  componentDidMount() {
    registerLocale('hu', hu);
  }

  render() {
    const { t, queryData, queryList } = this.props;
    const {
      activeCollectionToggle,
      activeCategoryTypeToggle,
      activeExclusionToggle,
      activeFullMatchToggle,
      selectedCategoryIndex,
      description,
      minAmount,
      maxAmount,
      minDate,
      maxDate,
      sumModalShown,
      listModalShown,
      selectedYear,
      selectedMonthIndex,
    } = this.state;
    return (
      <div className="query">
        <div className="collection">
          <div className="cost-label">{t('QUERY.LABELS.QUERY_TYPE')}</div>
          <ToggleButton
            active={activeCollectionToggle}
            onClick={this.switchActiveCollectionToggle}
            leftText={t('QUERY.ITEM')}
            rightText={t('QUERY.BALANCE')}
          />
        </div>
        {activeCollectionToggle === ToggleState.Left ? (
          <div className="item">
            <div className="category-type">
              <div className="cost-label">
                {t('QUERY.LABELS.CATEGORY_TYPE')}
              </div>
              <ToggleButton
                active={activeCategoryTypeToggle}
                onClick={this.switchActiveCategoryTypeToggle}
                leftText={t('QUERY.COST')}
                rightText={t('QUERY.INCOME')}
              />
            </div>
            <div className="category">
              <div className="cost-label">{t('QUERY.LABELS.CATEGORY')}</div>
              <div className="category-toggle-container">
                <div className="negate">
                  <ToggleButton
                    active={activeExclusionToggle}
                    onClick={this.switchActiveExclusionToggle}
                    leftText=""
                    rightText="Nem"
                  />
                </div>
                <div className="category">
                  <DropdownButton
                    title={
                      activeCategoryTypeToggle === ToggleState.Left
                        ? CostCategoriesWithEmpty[selectedCategoryIndex]
                        : IncomeCategoriesWithEmpty[selectedCategoryIndex]
                    }
                  >
                    {this.getMenuItems(
                      activeCategoryTypeToggle === ToggleState.Left
                        ? ['', ...(CostCategories as CostCategory[])]
                        : ['', ...(IncomeCategories as IncomeCategory[])],
                    )}
                  </DropdownButton>
                </div>
              </div>
            </div>
            <div className="description-container-panel">
              <div className="description-container">
                <div className="cost-label">
                  {t('QUERY.LABELS.DESCRIPTION')}
                </div>
                <input
                  className="description"
                  value={description}
                  onChange={(e) => this.onDescriptionChange(e.target.value)}
                />
              </div>
              <div className="full-match-container">
                <div className="cost-label">{t('QUERY.LABELS.FULL_MATCH')}</div>
                <ToggleButton
                  active={activeFullMatchToggle}
                  onClick={this.switchActiveFullMatchToggle}
                  leftText={t('QUERY.LABELS.NO')}
                  rightText={t('QUERY.LABELS.YES')}
                />
              </div>
            </div>
            <div className="amount-container">
              <div className="minimal-amount-container">
                <div className="cost-label">{t('QUERY.LABELS.MIN_AMOUNT')}</div>
                <input
                  className="minimal-amount amount"
                  value={minAmount}
                  type="number"
                  onChange={(e) => this.onMinAmountChange(e.target.value)}
                />
              </div>
              <div className="maximal-amount-container">
                <div className="cost-label">{t('QUERY.LABELS.MAX_AMOUNT')}</div>
                <input
                  className="maximal-amount amount"
                  value={maxAmount}
                  type="number"
                  onChange={(e) => this.onMaxAmountChange(e.target.value)}
                />
              </div>
            </div>
            <div className="date-container">
              <div className="minimal-date-container">
                <div className="cost-label">{t('QUERY.LABELS.FROM')}</div>
                <div className="minimal-date date date-picker-container">
                  <DatePickerWrapper
                    date={minDate || null}
                    onChange={this.onMinDateChange}
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
                <div className="cost-label">{t('QUERY.LABELS.TO')}</div>
                <div className="maximal-date date date-picker-container">
                  <DatePickerWrapper
                    date={maxDate || null}
                    onChange={this.onMaxDateChange}
                  />
                  {maxDate ? (
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
                type="submit"
                onClick={this.getSum}
                disabled={!!this.isInvalidInput()}
              >
                {t('QUERY.LABELS.SUM')}
              </Button>
              <Button
                className="query-list"
                type="submit"
                onClick={this.getList}
                disabled={!!this.isInvalidInput()}
              >
                {t('QUERY.LABELS.LIST')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="balance">
            <div className="year">
              <div className="cost-label">{t('QUERY.YEAR')}</div>
              <DropdownButton title={selectedYear} id="year-dropdown">
                {getYearItems(this.onSelectYear)}
              </DropdownButton>
            </div>
            <div className="month">
              <div className="cost-label">{t('QUERY.MONTH')}</div>
              <DropdownButton
                title={Months[selectedMonthIndex]}
                id="month-dropdown"
              >
                {getMonths(this.onSelectMonth, selectedYear)}
              </DropdownButton>
            </div>
            <div className="result-container">
              <div className="cost-label">{t('QUERY.BALANCE')}</div>
              <div className="result">
                {queryData ? getMoneyString(queryData.value) : ''}
              </div>
            </div>
          </div>
        )}
        <QuerySumDialog
          title={t('QUERY.MODAL_TITLE')}
          shown={sumModalShown}
          onClose={this.hideSumModal}
          value={queryData?.value || 0}
        />
        <QueryListDialog
          title={t('QUERY.MODAL_TITLE')}
          shown={listModalShown}
          onClose={this.hideListModal}
          items={queryList?.items || []}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return {
    queryData: state.query.queryData,
    queryList: state.query.queryList,
  };
};

const mapDispatchToProps = {
  getQueryData,
  getQueryList,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default compose(connector)(withRouter(withTranslation()(Query)));
