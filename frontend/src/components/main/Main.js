import React, { Component } from "react";
import "./Main.scss";
import Header from "../header/Header";
import Login from "../login/Login";
import { connect } from "react-redux";
import { Route, Switch, withRouter } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import Stats from "../stats/Stats";
import PropTypes from "prop-types";
import Query from "../query/Query";
import ChartConfig from "../chart/ChartConfig";
import NotFound from "../notfound/NotFound";
import Bubble from "../bubble/Bubble";

class Main extends Component {
  render() {
    return (
      <div className="cost">
        {!this.props.auth.token ? (
          <React.Fragment>
            <Header authenticated={false} />
            {this.props.offline.isOffline ? null : <Login />}
            {this.props.bubble.shown ? <Bubble /> : null}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Header authenticated={true} />
            {this.props.offline.isOffline ? null : (
              <Switch>
                <Route path="/~horvath/cost" component={Dashboard} />
                <Route path="/~horvath/stats" component={Stats} />
                <Route path="/~horvath/query" component={Query} />
                <Route path="/~horvath/chart" component={ChartConfig} />
                <Route component={Dashboard} />
              </Switch>
            )}
            {this.props.bubble.shown ? <Bubble /> : null}
          </React.Fragment>
        )}
      </div>
    );
  }
}

Main.propTypes = {
  auth: PropTypes.shape({
    token: PropTypes.string,
    id: PropTypes.string
  }),
  bubble: PropTypes.shape({
    shown: PropTypes.bool,
    text: PropTypes.string,
    isError: PropTypes.bool
  }),
  offline: PropTypes.shape({
    isOffline: PropTypes.bool
  })
};

const mapStateToProps = state => {
  const { auth, bubble, offline } = state;
  return { auth, bubble, offline };
};

export default withRouter(connect(mapStateToProps)(Main));
