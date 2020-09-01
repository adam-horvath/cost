import React, { Component } from "react";
import "../../styles/Modal.scss";
import "../../styles/ItemList.scss";
import PropTypes from "prop-types";
import { Button, Modal } from "react-bootstrap";
import Util from "../../common/Util";

class QueryListModal extends Component {
  render() {
    return (
      <Modal
        className="ok-modal item-list-modal"
        show={this.props.shown}
        onHide={this.props.hide}
      >
        <Modal.Header>
          <Modal.Title>A lekérdezés eredménye</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="item-list">
            {this.props.items.map(
              item =>
                item.type === "header" ? (
                  <div
                    className="cost-label"
                    key={this.props.items.indexOf(item)}
                  >
                    {Util.getFormattedDate(new Date(item.date))}
                  </div>
                ) : (
                  <div className="item" key={this.props.items.indexOf(item)}>
                    <div
                      className={`arrow-icon ${item.category_type.toLowerCase()}`}
                    />
                    <div className="item-texts">
                      <div className="amount">
                        {Util.getMoneyString(item.amount)}
                      </div>
                      <div className="description">{item.description}</div>
                    </div>
                    <div
                      className={`category-icon ${item.category.toLowerCase()}`}
                    />
                  </div>
                )
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button bsStyle="primary" type="submit" onClick={this.props.hide}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

QueryListModal.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.oneOfType([
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
      }),
      PropTypes.shape({ type: PropTypes.string, date: PropTypes.string })
    ])
  ),
  shown: PropTypes.bool,
  hide: PropTypes.func
};

export default QueryListModal;
