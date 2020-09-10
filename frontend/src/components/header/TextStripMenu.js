import React, { Component } from "react";
import "./TextStripMenu.scss";
import PropTypes from "prop-types";
import { connect } from "react-redux";

class TextStripMenu extends Component {
  render() {
    return (
      <div className="text-strip-menu">
        {this.props.offline.isOffline ? (
          <span className="menu-item">Offline vagy!</span>
        ) : (
          <React.Fragment>
            <span className="menu-item" onClick={this.props.logout}>
              <div className={"logout-icon"} />
            </span>
          </React.Fragment>
        )}
      </div>
    );
  }
}

TextStripMenu.propTypes = {
  logout: PropTypes.func.isRequired,
  offline: PropTypes.shape({
    isOffline: PropTypes.bool
  })
};

const mapStateToProps = state => {
  const { offline } = state;
  return { offline };
};

export default connect(mapStateToProps)(TextStripMenu);
