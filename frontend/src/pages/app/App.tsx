import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router';

import Header from 'components/header/Header';
import Login from 'pages/login/Login';
import Dashboard from 'pages/dashboard/Dashboard';
import Stats from 'pages/stats/Stats';
import Query from 'pages/query/Query';
import Charts from 'pages/chart/Charts';
import Notification from 'components/notification/Notification';
import { compose } from 'utils/compose';
import './App.scss';

interface AppProps extends ConnectedProps<typeof connector> {}

class App extends Component<AppProps> {
  render() {
    const { token, notification } = this.props;
    return (
      <div className="cost">
        <>
          <Header authenticated={!!token} />
          {!!token ? (
            <Switch>
              <Route exact path={'/'} component={Dashboard} />
              <Route exact path={'/stats'} component={Stats} />
              <Route exact path={'/query'} component={Query} />
              <Route exact path="/chart" component={Charts} />
              <Redirect to={'/'} />
            </Switch>
          ) : (
            <Login />
          )}
          {!!notification ? <Notification /> : null}
        </>
      </div>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return {
    token: state.auth.token,
    notification: state.common.notification,
  };
};

const connector = connect(mapStateToProps, {});

export default compose(connector)(App);
