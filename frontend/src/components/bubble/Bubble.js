import React, { Component } from "react";
import "./Bubble.scss";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bubble } from "../../redux/actions";

class Bubble extends Component {
  componentDidMount() {
    setTimeout(this.hide, 2000);
  }

  hide = () => {
    const { dispatch } = this.props;
    dispatch(bubble({ shown: false }));
  };

  render() {
    return (
      <div className={`bubble ${this.props.bubble.isError ? "error" : ""}`} onClick={this.hide}>
        <div className={`inner ${this.props.bubble.isError ? "error" : ""}`}>
          {this.props.bubble.text}
        </div>
      </div>
    );
  }
}

Bubble.propTypes = {
  bubble: PropTypes.shape({
    shown: PropTypes.bool,
    text: PropTypes.string,
    isError: PropTypes.bool
  })
};

const mapStateToProps = state => {
  const { bubble } = state;
  return { bubble };
};

export default connect(mapStateToProps)(Bubble);
