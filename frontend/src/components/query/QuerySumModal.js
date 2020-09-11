import React, { Component } from "react";
import "../../styles/Modal.scss";
import PropTypes from "prop-types";
import { Button, Modal } from "react-bootstrap";
import Util from "../../common/Util";

class QuerySumModal extends Component {
  render() {
    return (
      <Modal className="ok-modal" show={this.props.shown} onHide={this.props.hide}>
        <Modal.Header>
          <Modal.Title>A lekérdezés eredménye</Modal.Title>
        </Modal.Header>

        <Modal.Body>Összeg: {Util.getMoneyString(this.props.value)}</Modal.Body>

        <Modal.Footer>
          <Button variant="primary" type="submit" onClick={this.props.hide}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

QuerySumModal.propTypes = {
  value: PropTypes.number,
  shown: PropTypes.bool,
  hide: PropTypes.func
};

export default QuerySumModal;
