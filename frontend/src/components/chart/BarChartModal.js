import React, { Component } from "react";
import "../../styles/Modal.scss";
import PropTypes from "prop-types";
import { Button, Modal } from "react-bootstrap";
import BarChart from "../chart/BarChart";

class BarChartModal extends Component {
  state = {
    isLarge: false
  };

  componentDidMount() {
    this.setSize();
  }

  isLarge = () =>
    window.innerWidth >= 992 && this.props.numberOfBars > 3
  ;

  setSize = () => {
    this.setState({ isLarge: this.isLarge() });
  };

  render() {
    return (
      <Modal
        className={`ok-modal bar-chart-modal ${this.state.isLarge ? "" : "small"}`}
        show={this.props.shown}
        onHide={this.props.hide}
      >
        <Modal.Header>
          <Modal.Title>Kategóriák szerinti összesítés</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <BarChart isLarge={this.state.isLarge} setSize={this.setSize} />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" type="submit" onClick={this.props.hide}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

BarChartModal.propTypes = {
  numberOfBars: PropTypes.number,
  chartData: PropTypes.object
};

export default BarChartModal;
