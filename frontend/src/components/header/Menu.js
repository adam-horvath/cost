import React, { Component } from "react";
import "./Menu.scss";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";

class Menu extends Component {
  render() {
    return (
      <div className="menu row">
        <div className="entry-container col-sm-3">
          <Link to="/" className="menu-entry">
            Főoldal
          </Link>
        </div>
        <div className="entry-container col-sm-3">
          <Link to="/stats" className="menu-entry">
            Statisztikák
          </Link>
        </div>
        <div className="entry-container col-sm-3">
          <Link to="/query" className="menu-entry">
            Lekérdezések
          </Link>
        </div>
        <div className="entry-container col-sm-3">
          <Link to="/chart" className="menu-entry">
            Diagramok
          </Link>
        </div>
      </div>
    );
  }
}

Menu.propTypes = {
  offline: PropTypes.shape({
    isOffline: PropTypes.bool
  })
};

const mapStateToProps = state => {
  const { offline } = state;
  return { offline };
};

export default connect(mapStateToProps)(Menu);
