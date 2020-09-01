import React, { Component } from "react";
import "./Checkbox.scss";
import PropTypes from "prop-types";

class Checkbox extends Component {
  setChecked = e => {
    e.preventDefault();
    this.props.setChecked(this.props.index);
  };

  render() {
    return (
      <div
        className={this.props.className}
        onClick={this.setChecked}
      >
        <label>
          <input type="checkbox" />
          <div className={`tick ${this.props.isChecked ? "checked" : ""}`}/>
          {this.props.text}
        </label>
      </div>
    );
  }
}

Checkbox.propTypes = {
  index: PropTypes.number.isRequired,
  className: PropTypes.string,
  isChecked: PropTypes.bool.isRequired,
  setChecked: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

export default Checkbox;
