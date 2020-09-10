import React from "react";
import DatePicker from "react-datepicker";

export const DatePickerWrapper = ({
    date,
    onChange,
    minDate = new Date("2015-09-30"),
    maxDate = new Date()
}) => (
    <DatePicker
        selected={date}
        onChange={onChange}
        locale="hu"
        dropdownMode={"select"}
        todayButton={"Mai nap"}
        isClearable={false}
        minDate={minDate}
        maxDate={maxDate}
        dateFormatCalendar="yyyy. MMMM"
        popperPlacement={"center"}
        dateFormat={"yyyy. MM. dd."}
    />
);
