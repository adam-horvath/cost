import React, { FC, useEffect } from 'react';
import { FieldProps } from 'formik';
import { Colors } from 'common/Constants';

export interface InputWrapperProps extends FieldProps {
  type: string;
  setFieldValue: (field: string, value: any) => void;
  onChange?: (value: any) => void;
  name: string;
  value?: string;
}

export const InputWrapper: FC<InputWrapperProps> = props => {
  const { form, type, field, setFieldValue, ...propsToPass } = props;
  useEffect(() => {
    form.validateForm();
  }, []);

  return (
    <>
      <input
        type={type}
        value={field.value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          console.log('onChange');
          if (setFieldValue) {
            console.log(event.target.value);
            setFieldValue(props.name, event.target.value);
          }
          if (props.onChange) {
            props.onChange(event);
          }
        }}
        {...propsToPass}
      />
      {form.errors[field.name] &&
        form.touched[field.name] && (
          <span style={{ color: Colors.costRed }}>
            {form.errors[field.name]}
          </span>
        )}
    </>
  );
};
