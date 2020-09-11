import React, { Component } from "react";
import "../../styles/Modal.scss";
import PropTypes from "prop-types";
import { Button, Modal } from "react-bootstrap";

class ConfirmDeleteItemModal extends Component {
  render() {
    return (
      <Modal
        className="confirm-modal"
        show={this.props.shown}
        onHide={this.props.hide}
      >
        <Modal.Header>
          <Modal.Title>Tétel törlése</Modal.Title>
          <div className="delete-icon" />
        </Modal.Header>

        <Modal.Body>Biztosan törölni szeretnéd?</Modal.Body>

        <Modal.Footer>
          <Button onClick={this.props.onCancel}>Mégse</Button>
          <Button variant="primary" onClick={this.props.onConfirm}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

ConfirmDeleteItemModal.propTypes = {
  shown: PropTypes.bool,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func
};

export default ConfirmDeleteItemModal;
