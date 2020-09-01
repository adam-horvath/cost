import React, { Component } from "react";
import "./ToggleButton.scss";
import PropTypes from "prop-types";

class ToggleButton extends Component {
  switchActive = () => this.props.switchActive();

  emptyText = () => {
    return (
      "" +
      (!this.props.leftText.length
        ? "left"
        : !this.props.rightText.length
          ? "right"
          : "")
    );
  };

  render() {
    return (
      <div className="toggle-button-container">
        <div
          className={`button-container left
            ${this.props.active === "left" ? "active" : ""}
            ${this.emptyText() === "left" ? "empty" : ""}
            ${this.emptyText() === "right" ? "empty-other" : ""}
          `}
          onClick={this.switchActive}
        >
          <div
            className={`button left ${
              this.props.active === "left" ? "active" : ""
            }`}
          />
          <div className="button-text left">{this.props.leftText}</div>
        </div>
        <div
          className={`button-container right
            ${this.props.active === "left" ? "" : "active"}
            ${this.emptyText() === "right" ? "empty" : ""}
            ${this.emptyText() === "left" ? "empty-other" : ""}
          `}
          onClick={this.switchActive}
        >
          <div
            className={`button right ${
              this.props.active === "left" ? "" : "active"
            }`}
          />
          <div className="button-text right">{this.props.rightText}</div>
        </div>
      </div>
    );
  }
}

ToggleButton.propTypes = {
  active: PropTypes.string.isRequired,
  switchActive: PropTypes.func.isRequired,
  leftText: PropTypes.string.isRequired,
  rightText: PropTypes.string.isRequired
};

export default ToggleButton;
