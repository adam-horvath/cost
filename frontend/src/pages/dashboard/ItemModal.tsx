import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import { registerLocale } from 'react-datepicker';
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import hu from 'date-fns/locale/hu';
import { Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';

import { CostCategories, IncomeCategories } from 'common/Constants';
import { ConfirmModal } from './ConfirmModal';
import { DatePickerWrapper } from 'components/datepicker/DatePickerWrapper';
import { InputWrapper } from 'components/input/InputWrapper';
import {
  CategoryType,
  CostCategory,
  IncomeCategory,
} from 'models/common.model';
import { ModalType } from './Dashboard';
import Yup from 'utils/yup';
import { ItemParamsModel } from 'models/dashboard.model';
import 'components/datepicker/DatePicker.scss';
import 'styles/dropdown.scss';
import 'components/dialog/Dialog.scss';
import { DescriptionMappingModel } from 'store/common';

export interface ItemModalProps {
  shown: boolean;
  createItem: (item: ItemParamsModel) => void;
  updateItem: (item: ItemParamsModel) => void;
  deleteItem: (id: string) => void;
  amount?: number;
  date: Date;
  category: CostCategory | IncomeCategory;
  description?: string;
  hide: () => void;
  type: ModalType;
  isCost: boolean;
  id?: string;
  setDescriptionMapping: (
    descriptionMapping: DescriptionMappingModel,
  ) => Promise<void>;
  descriptionMapping: DescriptionMappingModel;
}

export const ItemModal: FC<ItemModalProps> = ({
  shown,
  amount,
  date,
  category,
  description,
  id,
  hide,
  type,
  isCost,
  createItem,
  updateItem,
  deleteItem,
  setDescriptionMapping,
  descriptionMapping,
}) => {
  useEffect(() => {
    registerLocale('hu', hu);
  }, []);

  const { t } = useTranslation();

  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .required(t('ERRORS.FIELD_REQUIRED'))
      .test(
        'amount',
        t('ERRORS.AMOUNT_INVALID'),
        (value) =>
          !!value &&
          !!value
            .toString()
            .trim()
            .replace(/[^0-9]/g, '').length,
      ),
    category: Yup.string().required(t('ERRORS.FIELD_REQUIRED')),
    date: Yup.string().required(t('ERRORS.FIELD_REQUIRED')),
  });

  const [confirmModalShown, setConfirmModalShown] = useState(false);
  const [isValidForm, setValidForm] = useState(!!id);
  let validatedForm = !!id;

  const showConfirmModal = () => {
    setConfirmModalShown(true);
  };

  const hideConfirmModal = () => {
    setConfirmModalShown(false);
  };

  const confirmDelete = async () => {
    id && (await deleteItem(id));
    setConfirmModalShown(false);
    hide();
  };

  const onSubmitForm = async (item: Omit<ItemParamsModel, 'category_type'>) => {
    const { date, category, amount, description } = item;
    const data: ItemParamsModel = {
      category_type: isCost ? CategoryType.Cost : CategoryType.Income,
      date: date,
      category: t(`COMMON.ENGLISH_CATEGORIES.${category}`),
      amount: amount,
      description: description?.trim() || '',
    };
    if (id) {
      data.id = id;
    }
    if (
      description &&
      (!descriptionMapping[description.trim()] ||
        descriptionMapping[description.trim()] !==
          t(`COMMON.ENGLISH_CATEGORIES.${category}`))
    ) {
      setDescriptionMapping({
        [description.trim()]: t(`COMMON.ENGLISH_CATEGORIES.${category}`),
      });
    }
    if (type === ModalType.ADD) {
      await createItem(data);
    } else {
      await updateItem(data);
    }
    hide();
  };

  return (
    <React.Fragment>
      <Modal show={shown && !confirmModalShown} onHide={hide}>
        <Formik
          initialValues={{
            amount,
            category,
            description,
            date: date.toISOString(),
          }}
          validateOnChange={true}
          validateOnMount={true}
          onSubmit={onSubmitForm}
          validationSchema={validationSchema}
        >
          {({
            values,
            setFieldValue,
            isValid,
            validateForm,
            setFieldTouched,
          }) => {
            if (!validatedForm) {
              validateForm();
              validatedForm = true;
            }
            if (isValidForm !== isValid) {
              setValidForm(isValid);
            }
            const categories: (CostCategory | IncomeCategory)[] = isCost
              ? (CostCategories as CostCategory[])
              : (IncomeCategories as IncomeCategory[]);
            return (
              <Form noValidate className="input-box">
                <Modal.Header>
                  <Modal.Title>
                    {type === ModalType.UPDATE
                      ? t('DASHBOARD.ITEM_MODAL.UPDATE_AMOUNT')
                      : t('DASHBOARD.ITEM_MODAL.ADD_AMOUNT', {
                          itemType: isCost
                            ? t('COMMON.CATEGORIES.COST')
                            : t('COMMON.CATEGORIES.INCOME'),
                        })}
                  </Modal.Title>
                  {type === ModalType.UPDATE ? (
                    <div className="delete-icon" onClick={showConfirmModal} />
                  ) : null}
                </Modal.Header>

                <Modal.Body>
                  <label htmlFor={'amount'} className="label amount-label">
                    {t('DASHBOARD.ITEM_MODAL.AMOUNT')}
                  </label>
                  <Field
                    label={t('DASHBOARD.ITEM_MODAL.AMOUNT')}
                    className={'amount'}
                    name={'amount'}
                    type={'number'}
                    component={InputWrapper}
                    onBlur={() => {
                      setFieldTouched('amount', true);
                    }}
                    setFieldValue={setFieldValue}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setFieldValue('amount', event.target.value)
                    }
                  />
                  <label htmlFor={'category'} className="label category-label">
                    {t('DASHBOARD.ITEM_MODAL.CATEGORY')}
                  </label>
                  <DropdownButton title={values.category} id="dropdown">
                    {categories.map(
                      (category: CostCategory | IncomeCategory, i: number) => (
                        <Dropdown.Item
                          eventKey={`${i}`}
                          key={i}
                          onSelect={() => {
                            setFieldValue('category', categories[i]);
                            validateForm();
                          }}
                        >
                          {category}
                        </Dropdown.Item>
                      ),
                    )}
                  </DropdownButton>
                  <label
                    htmlFor={'description'}
                    className="label description-label"
                  >
                    {t('DASHBOARD.ITEM_MODAL.DESCRIPTION')}
                  </label>
                  <Field
                    label={t('DASHBOARD.ITEM_MODAL.DESCRIPTION')}
                    className={'description'}
                    name={'description'}
                    type={'text'}
                    component={InputWrapper}
                    autocomplete={'off'}
                    onBlur={() => {
                      setFieldTouched('description', true);
                    }}
                    setFieldValue={setFieldValue}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('description', event.target.value);
                      if (
                        event.target.value?.length > 1 &&
                        descriptionMapping[event.target.value]
                      ) {
                        setFieldValue(
                          'category',
                          t(
                            `COMMON.CATEGORIES.${
                              descriptionMapping[event.target.value]
                            }`,
                          ),
                        );
                      }
                    }}
                  />
                  <label htmlFor={'date'} className="label description-label">
                    {t('DASHBOARD.ITEM_MODAL.DATE')}
                  </label>
                  <div className="date-picker-container date-picker-in-modal">
                    <DatePickerWrapper
                      date={new Date(values.date)}
                      onChange={(date: Date) => setFieldValue('date', date)}
                    />
                  </div>
                </Modal.Body>

                <Modal.Footer className={'flex-nowrap'}>
                  <Button onClick={hide} variant="secondary">
                    {t('COMMON.CANCEL')}
                  </Button>
                  <Button
                    className="btn-primary"
                    type="submit"
                    disabled={!isValidForm}
                  >
                    {t('COMMON.OK')}
                  </Button>
                </Modal.Footer>
              </Form>
            );
          }}
        </Formik>
      </Modal>

      <ConfirmModal
        shown={confirmModalShown}
        onCancel={hideConfirmModal}
        onConfirm={confirmDelete}
      />
    </React.Fragment>
  );
};
