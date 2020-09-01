import React, { Component } from "react";
import { connect } from "react-redux";
import "./Login.scss";
import Constants from "../../common/Constants";
import request from "../../lib/request";
import Util from "../../common/Util";
import {bubble, login, logout, offline} from "../../redux/actions";

class Login extends Component {
  login = async e => {
    const { dispatch } = this.props;
    e.preventDefault();
    const response = await request({
      url: Util.getEndpoint("login"),
      data: {
        email: this.email,
        password: this.password
      }
    });
    if (!response || response.error) {
      if (response && response.error) {
        dispatch(
          bubble({
            shown: true,
            text: response.status + " " + response.message,
            isError: true
          })
        );
        dispatch(logout());
      } else {
        dispatch(
          bubble({ shown: true, text: Constants.NO_CONNECTION, isError: true })
        );
        dispatch(offline(true));
      }
    } else {
      dispatch(offline(false));
      dispatch(login(response));
    }
  };

  render() {
    return (
      <div className="login">
        <form onSubmit={this.login} className="login-container">
          <div className="input-box">
            <div>Email</div>
            <label htmlFor={"email"} className="email-label">
              <input
                onChange={e => (this.email = e.target.value)}
                id={"email"}
                name={"email"}
                spellCheck={false}
                autoFocus={true}
                value={this.email}
                placeholder={Constants.PLACEHOLDER_EMAIL}
                type={"email"}
              />
            </label>
            <div>Jelszó</div>
            <label htmlFor={"password"} className="password-label">
              <input
                onChange={e => (this.password = e.target.value)}
                id={"password"}
                name={"password"}
                spellCheck={false}
                value={this.password}
                placeholder={Constants.PLACEHOLDER_PASSWORD}
                type={"password"}
              />
            </label>
            <button type="submit">Bejelentkezés</button>
          </div>
        </form>
      </div>
    );
  }
}

export default connect()(Login);
