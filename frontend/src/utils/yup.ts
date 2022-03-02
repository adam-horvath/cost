import * as Yup from 'yup';
import i18n from 'i18n';

Yup.setLocale({
  mixed: {
    required: () => i18n.t('ERRORS.FIELD_REQUIRED'),
  },
  string: {
    email: () => i18n.t('ERRORS.EMAIL_INVALID'),
  },
});

export default Yup;

