import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { TextStripMenu } from './TextStripMenu';
import { Hamburger } from './Hamburger';
import { Menu } from './Menu';
import { logout } from 'store/auth';
import { compose } from 'utils/compose';
import logo from 'logo.svg';
import './Header.scss';

export interface HeaderProps
  extends WithTranslation,
    ConnectedProps<typeof connector> {}

interface HeaderState {
  openMenu: boolean;
}

class Header extends Component<HeaderProps, HeaderState> {
  state = {
    openMenu: false,
  };

  switchMenuState = () => {
    this.setState({ openMenu: !this.state.openMenu });
  };

  logout = () => {
    this.setState({ openMenu: false });
    this.props.logout();
  };

  render() {
    const { t, token } = this.props;
    return (
      <header>
        <div className={'header-top'}>
          <Link to="/cost">
            <img src={logo} className="logo" alt="logo" />
          </Link>
          <Link to="/cost">
            <h1 className="title">{t('COMMON.APP_NAME')}</h1>
          </Link>
          {token ? (
            <React.Fragment>
              <TextStripMenu logout={this.logout} />
              <Hamburger
                openMenu={this.state.openMenu}
                switchMenuState={this.switchMenuState}
                logout={this.logout}
              />
            </React.Fragment>
          ) : null}
        </div>
        {token ? <Menu /> : null}
      </header>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return {
    token: state.auth.token,
  };
};

const mapDispatchToProps = {
  logout,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default compose(connector)(withTranslation()(Header));
