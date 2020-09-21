import React, { Component } from "react";
import "./Header.scss";
import TextStripMenu from "./TextStripMenu";
import logo from "../../logo.svg";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Hamburger from "./Hamburger";
import Menu from "./Menu";
import { logout } from "../../redux/actions";
import { connect } from "react-redux";

class Header extends Component {
  state = {
    openMenu: false
  };

  setOpenMenu = () => {
    this.setState({ openMenu: !this.state.openMenu });
  };

  logout = () => {
    const { dispatch } = this.props;
    this.setState({ openMenu: false });
    dispatch(logout());
  };

  render() {
    return (
      <header>
        <div
          className={`header-top ${
            this.props.offline.isOffline ? "always-shadow" : ""
          }`}
        >
          <Link to="/">
            <img src={logo} className="logo" alt="logo" />
          </Link>
          <Link to="/">
            <h1 className="title">Kassza</h1>
          </Link>
          {this.props.authenticated ? (
            <React.Fragment>
              <TextStripMenu logout={this.logout} />
              <Hamburger
                openMenu={this.state.openMenu}
                setOpenMenu={this.setOpenMenu}
                logout={this.logout}
              />
            </React.Fragment>
          ) : null}
        </div>
        {this.props.authenticated && !this.props.offline.isOffline ? <Menu /> : null}
      </header>
    );
  }
}

Header.propTypes = {
  authenticated: PropTypes.bool,
  offline: PropTypes.shape({
    isOffline: PropTypes.bool
  })
};

const mapStateToProps = state => {
  const { offline } = state;
  return { offline };
};

export default connect(mapStateToProps)(Header);
