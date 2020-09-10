import React, { Component } from "react";
import "./Dashboard.scss";
import "../../styles/ItemList.scss";
import { connect } from "react-redux";
import request from "../../lib/request";
import Util from "../../common/Util";
import Constants from "../../common/Constants";
import { dailyData, bubble, offline, logout } from "../../redux/actions";
import PropTypes from "prop-types";
import { registerLocale } from "react-datepicker";
import "../../styles/DatePicker.scss";
import "react-datepicker/dist/react-datepicker.css";
import "moment/locale/hu";
import ItemModal from "./ItemModal";
import hu from "date-fns/locale/hu";
import { withRouter } from "react-router";
import { DatePickerWrapper } from "../../common/DatePickerWrapper";

class Dashboard extends Component {
    state = {
        itemModalShown: false,
        confirmModalShown: false,
        date: new Date(),
        isPagingAvailable: {
            left: true,
            right: false
        },
        modalType: "ADD",
        currentItem: {
            id: "",
            isCost: true,
            amount: "",
            selectedMenuItem: 0,
            description: ""
        }
    };



    getData = async () => {
        const { dispatch } = this.props;
        const response = await request({
            url: Util.getEndpoint("v1/main"),
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
                    bubble({
                        shown: true,
                        text: Constants.NO_CONNECTION,
                        isError: true
                    })
                );
                dispatch(offline(true));
            }
        } else {
            dispatch(offline(false));
            dispatch(
                dailyData({
                    balance: response.balance,
                    items: response.items,
                    pendingRequests: response.pending_requests
                })
            );
        }
    };
    onDateChange = async momentDate => {
        const date = new Date(momentDate);
        date.setHours(6);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        await this.setState({ date });
        this.handleDateChange();
    };
    changeDateWith = async value => {
        const date = this.state.date;
        date.setDate(this.state.date.getDate() + value);
        await this.setState({ date: date });
        this.handleDateChange();
    };
    handleDateChange = () => {
        this.setPagingAvailable();
        this.getData();
    };
    showItemModal = (currentItem, modalType) => {
        this.setState({
            itemModalShown: true,
            currentItem: { ...this.state.currentItem, ...currentItem },
            modalType
        });
    };
    setConfirmModalShown = isShown => {
        this.setState({ confirmModalShown: isShown });
    };
    hideItemModal = () => {
        this.setState({
            itemModalShown: false,
            currentItem: {
                id: "",
                isCost: true,
                amount: "",
                selectedMenuItem: 0,
                description: ""
            }
        });
        this.getData();
    };
    setCurrentItem = currentItem => {
        this.setState(prevState => ({
            currentItem: { ...prevState.currentItem, ...currentItem }
        }));
    };
    setPagingAvailable = () => {
        this.setState({
            isPagingAvailable: Util.dayPagingAvailable(this.state.date)
        });
    };

    componentDidMount() {
        this.getData();
        registerLocale("hu", hu);
    }

    render() {
        return this.props.dashboard.items ? (
            <div className="dashboard">
                <div className="balance">
                    Egyenleg:{" "}
                    {Util.getMoneyString(this.props.dashboard.balance)}
                </div>
                <div className="add-item-container">
                    <div
                        className="add-container add-cost-container"
                        onClick={() =>
                            this.showItemModal({ isCost: true }, "ADD")
                        }
                    >
                        <div className="add-icon add-cost-icon" />
                        <div className="add-label add-cost-label">Kiadás</div>
                    </div>
                    <div
                        className="add-container add-income-container"
                        onClick={() =>
                            this.showItemModal({ isCost: false }, "ADD")
                        }
                    >
                        <div className="add-label add-income-label">
                            Bevétel
                        </div>
                        <div className="add-icon add-income-icon" />
                    </div>
                </div>
                <div className="date-picker-container">
                    {this.state.isPagingAvailable.left ? (
                        <div
                            className="paginate visible left"
                            onClick={() => this.changeDateWith(-1)}
                        />
                    ) : (
                        <div className="paginate left" />
                    )}
                    <DatePickerWrapper
                        date={this.state.date}
                        onChange={this.onDateChange}
                    />
                    {this.state.isPagingAvailable.right ? (
                        <div
                            className="paginate visible right"
                            onClick={() => this.changeDateWith(1)}
                        />
                    ) : (
                        <div className="paginate right" />
                    )}
                </div>
                <div className="item-list">
                    {this.props.dashboard.items.map(item => (
                        <div
                            className="item"
                            key={this.props.dashboard.items.indexOf(item)}
                            onClick={() =>
                                this.showItemModal(
                                    {
                                        id: item._id,
                                        isCost:
                                            item.category_type.toLowerCase() ===
                                            "cost",
                                        amount: item.amount,
                                        selectedMenuItem:
                                            item.category_type.toLowerCase() ===
                                            "cost"
                                                ? Constants.COST_CATEGORIES.indexOf(
                                                      Util.getHungarianCategory(
                                                          item.category
                                                      )
                                                  )
                                                : Constants.INCOME_CATEGORIES.indexOf(
                                                      Util.getHungarianCategory(
                                                          item.category
                                                      )
                                                  ),
                                        description: item.description
                                    },
                                    "UPDATE"
                                )
                            }
                        >
                            <div
                                className={`arrow-icon ${item.category_type.toLowerCase()}`}
                            />
                            <div className="item-texts">
                                <div className="amount">
                                    {Util.getMoneyString(item.amount)}
                                </div>
                                <div className="description">
                                    {item.description}
                                </div>
                            </div>
                            <div
                                className={`category-icon ${item.category.toLowerCase()}`}
                            />
                        </div>
                    ))}
                </div>
                {this.state.itemModalShown && (
                    <ItemModal
                        shown={this.state.itemModalShown}
                        confirmModalShown={this.state.confirmModalShown}
                        setConfirmModalShown={this.setConfirmModalShown}
                        hide={this.hideItemModal}
                        currentItem={this.state.currentItem}
                        date={this.state.date}
                        type={this.state.modalType}
                        setCurrentItem={this.setCurrentItem}
                        onDateChange={this.onDateChange}
                    />
                )}
            </div>
        ) : null;
    }
}

Dashboard.propTypes = {
    dashboard: PropTypes.shape({
        balance: PropTypes.number,
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
        pendingRequests: PropTypes.arrayOf(PropTypes.string)
    }),
    bubble: PropTypes.shape({
        shown: PropTypes.bool,
        text: PropTypes.string,
        isError: PropTypes.bool
    })
};

const mapStateToProps = state => {
    const { dashboard, bubble } = state;
    return { dashboard, bubble };
};

export default connect(mapStateToProps)(withRouter(Dashboard));
