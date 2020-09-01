import React, { Component } from "react";
import "./Hamburger.scss";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {connect} from "react-redux";

class Hamburger extends Component {
  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside = e => {
    if (
      this.menuPanelRef &&
      !this.menuPanelRef.contains(e.target) &&
      this.hamburgerIconRef &&
      !this.hamburgerIconRef.contains(e.target) &&
      this.props.openMenu
    ) {
      this.props.setOpenMenu();
    }
  };

  onMenuClick = () => {
    this.props.setOpenMenu();
  };

  render() {
    return this.props.offline.isOffline ? <span className="offline">Offline vagy!</span> : (
      <React.Fragment>
        <div
          ref={r => (this.hamburgerIconRef = r)}
          className={`hamburger-icon ${this.props.openMenu ? "cross" : ""}`}
          onClick={this.onMenuClick}
        >
          <div />
          <div />
          <div />
        </div>
        <div
          ref={r => (this.menuPanelRef = r)}
          className={`hamburger-panel ${
            this.props.openMenu ? "open" : "closed"
          }`}
        >
          <div className="menu-item">
            <Link to="/~horvath/cost" onClick={this.onMenuClick}>Főoldal</Link>
          </div>
          <div className="menu-item">
            <Link to="/~horvath/stats" onClick={this.onMenuClick}>Statisztikák</Link>
          </div>
          <div className="menu-item">
            <Link to="/~horvath/query" onClick={this.onMenuClick}>Lekérdezések</Link>
          </div>
          <div className="menu-item">
            <Link to="/~horvath/chart" onClick={this.onMenuClick}>Diagramok</Link>
          </div>
          <div className="menu-item" onClick={this.props.logout}>
            Kijelentkezés
          </div>
        </div>
      </React.Fragment>
    );
  }
}

Hamburger.propTypes = {
  openMenu: PropTypes.bool,
  setOpenMenu: PropTypes.func,
  logout: PropTypes.func,
  offline: PropTypes.shape({
    isOffline: PropTypes.bool
  })
};

const mapStateToProps = state => {
  const { offline } = state;
  return { offline };
};

export default connect(mapStateToProps)(Hamburger);
