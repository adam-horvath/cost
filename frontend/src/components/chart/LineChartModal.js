import React, { Component } from "react";
import "../../styles/Modal.scss";
import PropTypes from "prop-types";
import { Button, Modal } from "react-bootstrap";
import LineChart from "../chart/LineChart";

class LineChartModal extends Component {
  state = {
    isLarge: false
  };

  componentDidMount() {
    this.setSize();
  }

  isLarge = () => window.innerWidth >= 992;
  setSize = () => {
    this.setState({ isLarge: this.isLarge() });
  };

  render() {
    return (
      <Modal
        className="ok-modal line-chart-modal"
        show={this.props.shown}
        onHide={this.props.hide}
      >
        <Modal.Header>
          <Modal.Title>Kategóriák trendje</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <LineChart
            isLarge={this.state.isLarge}
            setSize={this.setSize}
            isSum={this.props.isSum}
          />
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

LineChartModal.propTypes = {
  chartData: PropTypes.object,
  isSum: PropTypes.bool
};

export default LineChartModal;
