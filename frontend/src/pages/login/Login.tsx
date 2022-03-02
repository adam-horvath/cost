import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Field, Form, Formik } from 'formik';

import { login } from 'store/auth';
import { compose } from 'utils/compose';
import { CredentialsModel } from 'models/auth.model';
import Yup from 'utils/yup';
import './Login.scss';

interface LoginPageProps
  extends ConnectedProps<typeof connector>,
    WithTranslation {}

class Login extends Component<LoginPageProps> {
  onSubmit = async (credentials: CredentialsModel) => {
    const { login } = this.props;
    await login(credentials);
  };

  render() {
    const { t } = this.props;
    return (
      <div className="login">
        <Formik
          initialValues={{ email: '', password: '' } as CredentialsModel}
          validateOnChange={false}
          onSubmit={this.onSubmit}
          validationSchema={() =>
            Yup.object().shape({
              email: Yup.string()
                .email(t('ERRORS.EMAIL_INVALID'))
                .required(t('ERRORS.FIELD_REQUIRED')),
              password: Yup.string().required(t('ERRORS.FIELD_REQUIRED')),
            })
          }
        >
          <Form noValidate className="input-box">
            <label htmlFor={'email'} className="email-label">
              {t('LOGIN.EMAIL')}
            </label>
            <Field
              label={t('LOGIN.EMAIL')}
              placeholder={t('LOGIN.EMAIL')}
              name={'email'}
              type={'email'}
            />
            <label htmlFor={'password'} className="password-label">
              {t('LOGIN.PASSWORD')}
            </label>
            <Field
              label={t('LOGIN.PASSWORD')}
              placeholder={t('LOGIN.PASSWORD')}
              name={'password'}
              type={'password'}
            />
            <button type="submit">{t('LOGIN.LOGIN')}</button>
          </Form>
        </Formik>
      </div>
    );
  }
}

const mapDispatchToProps = {
  login,
};

const connector = connect(null, mapDispatchToProps);

export default compose(connector)(withTranslation()(Login));
