import React, { Component } from "react";
import "../../styles/Modal.scss";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Button, Modal, DropdownButton, Dropdown } from "react-bootstrap";
import Constants from "../../common/Constants";
import request from "../../lib/request";
import Util from "../../common/Util";
import ConfirmDeleteItemModal from "./ConfirmDeleteItemModal";
import moment from "moment-timezone";
import DatePicker from "react-datepicker";
import "../../styles/DatePicker.scss";
import "../../styles/Dropdown.scss";
import {bubble, logout, offline} from "../../redux/actions";

class ItemModal extends Component {
  getMenuItems = array => {
    return array.map((category, i) => (
      <Dropdown.Item eventKey={i} key={i} onSelect={() => this.onSelectMenuItem(i)}>
        {category}
      </Dropdown.Item>
    ));
  };

  onSelectMenuItem = index => {
    this.props.setCurrentItem({ selectedMenuItem: index });
  };

  onAmountChange = e => {
    this.props.setCurrentItem({ amount: e.target.value });
  };

  onDescriptionChange = e => {
    this.props.setCurrentItem({ description: e.target.value });
  };

  isInvalidInput = () =>
    this.props.currentItem.amount
      .toString()
      .trim()
      .replace(/\d/g, "").length ||
    !this.props.currentItem.amount.toString().trim().length;

  saveItem = async () => {
    const { dispatch } = this.props;
    const data = {
      category_type: this.props.currentItem.isCost ? "COST" : "INCOME",
      date: this.props.date.toISOString(),
      category: Util.getEnglishCategory(
        this.props.currentItem.isCost
          ? Constants.COST_CATEGORIES[this.props.currentItem.selectedMenuItem]
          : Constants.INCOME_CATEGORIES[this.props.currentItem.selectedMenuItem]
      ),
      amount: this.props.currentItem.amount,
      description: this.props.currentItem.description
    };
    if (this.props.currentItem.id) {
      data["id"] = this.props.currentItem.id;
    }
    const response = await request({
      url: Util.getEndpoint("v1/item"),
      method: this.props.type === "ADD" ? "POST" : "PUT",
      data
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
      dispatch(bubble({ shown: true, text: response.msg }));
      this.props.hide();
    }
  };

  deleteItem = () => {
    this.props.setConfirmModalShown(true);
  };

  onCancel = () => {
    this.props.setConfirmModalShown(false);
  };

  onConfirm = async () => {
    const { dispatch } = this.props;
    this.props.setConfirmModalShown(false);
    const response = await request({
      url: Util.getEndpoint("v1/item/" + this.props.currentItem.id),
      method: "DELETE"
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
      dispatch(bubble({ shown: true, text: response.msg }));
      this.props.hide();
    }
  };

  render() {
    return (
      <React.Fragment>
        <Modal
          show={this.props.shown && !this.props.confirmModalShown}
          onHide={this.props.hide}
        >
          <Modal.Header>
            <Modal.Title>
              {this.props.type === "UPDATE"
                ? "Tétel frissítése"
                : this.props.currentItem.isCost
                  ? "Költség felvétele"
                  : "Bevétel felvétele"}
            </Modal.Title>
            {this.props.type === "UPDATE" ? (
              <div className="delete-icon" onClick={this.deleteItem} />
            ) : null}
          </Modal.Header>

          <Modal.Body>
            <form onSubmit={this.saveItem}>
              <div className="label amount-label">
                <span style={{ marginRight: "6px" }}>Ö</span>sszeg
              </div>
              <input
                className="amount"
                type="number"
                value={this.props.currentItem.amount}
                onChange={e => this.onAmountChange(e)}
              />
              <div className="label category-label">Kategória</div>
              <DropdownButton
                title={
                  this.props.currentItem.isCost
                    ? Constants.COST_CATEGORIES[
                        this.props.currentItem.selectedMenuItem
                      ]
                    : Constants.INCOME_CATEGORIES[
                        this.props.currentItem.selectedMenuItem
                      ]
                }
                id="dropdown"
              >
                {this.getMenuItems(
                  this.props.currentItem.isCost
                    ? Constants.COST_CATEGORIES
                    : Constants.INCOME_CATEGORIES
                )}
              </DropdownButton>
              <div className="label description-label">Leírás</div>
              <input
                className="description"
                value={this.props.currentItem.description}
                onChange={e => this.onDescriptionChange(e)}
              />
              <div className="label date-label">Dátum</div>
              <div className="date-picker-container date-picker-in-modal">
                <DatePicker
                  selected={moment.tz(this.props.date, Constants.TIME_ZONE)}
                  onChange={this.props.onDateChange}
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
              </div>
            </form>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.props.hide}>Mégse</Button>
            <Button
              bsStyle="primary"
              type="submit"
              onClick={this.saveItem}
              disabled={!!this.isInvalidInput()}
            >
              OK
            </Button>
          </Modal.Footer>
        </Modal>

        {this.props.confirmModalShown && (
          <ConfirmDeleteItemModal
            shown={this.props.confirmModalShown}
            onCancel={this.onCancel}
            onConfirm={this.onConfirm}
          />
        )}
      </React.Fragment>
    );
  }
}

ItemModal.propTypes = {
  shown: PropTypes.bool,
  confirmModalShown: PropTypes.bool,
  setConfirmModalShown: PropTypes.func,
  currentItem: PropTypes.shape({
    id: PropTypes.string,
    isCost: PropTypes.bool,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    selectedMenuItem: PropTypes.number,
    description: PropTypes.string
  }),
  hide: PropTypes.func,
  save: PropTypes.func,
  date: PropTypes.object,
  type: PropTypes.oneOf(["ADD", "UPDATE"]),
  onDateChange: PropTypes.func
};

export default connect()(ItemModal);
