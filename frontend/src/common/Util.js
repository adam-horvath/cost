import Constants from "./Constants";
import moment from "moment-timezone";
import { MenuItem } from "react-bootstrap";
import React from "react";

class Util {
  static getEndpoint = path => Constants.BASE_URL + path;

  static getMoneyString = number =>
    number &&
    Math.round(number)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  static getHungarianCategory = receivedCategory => {
    switch (receivedCategory) {
      case "INCOME":
        return "Bevétel";
      case "COST":
        return "Kiadás";
      case "BALANCE":
        return "Egyenleg";
      case "SALARY":
        return "Fizetés";
      case "STATE":
        return "Állam";
      case "GIFT":
        return "Ajándék";
      case "LOAN":
        return "Kölcsön";
      case "OTHER":
        return "Egyéb";
      case "BANK":
        return "Bank";
      case "CAR":
        return "Autó";
      case "CLOTHES":
        return "Ruha";
      case "DRINK":
        return "Kocsma";
      case "FOOD":
        return "Kaja";
      case "GROCERY":
        return "Bevásárlás";
      case "HOUSE":
        return "Ház";
      case "INVESTMENT":
        return "Befektetés";
      case "LUXURY":
        return "Luxus";
      case "OVERHEAD":
        return "Rezsi";
      case "PHARMACY":
        return "Gyógyszertár";
      case "PHONE":
        return "Telefon";
      case "TRAVEL":
        return "Utazás";
      default:
        return null;
    }
  };

  static getEnglishCategory = receivedCategory => {
    switch (receivedCategory) {
      case "Egyenleg":
        return "BALANCE";
      case "Bevétel":
        return "INCOME";
      case "Kiadás":
        return "COST";
      case "Fizetés":
        return "SALARY";
      case "Állam":
        return "STATE";
      case "Ajándék":
        return "GIFT";
      case "Kölcsön":
        return "LOAN";
      case "Egyéb":
        return "OTHER";
      case "Bank":
        return "BANK";
      case "Autó":
        return "CAR";
      case "Ruha":
        return "CLOTHES";
      case "Kocsma":
        return "DRINK";
      case "Kaja":
        return "FOOD";
      case "Bevásárlás":
        return "GROCERY";
      case "Ház":
        return "HOUSE";
      case "Befektetés":
        return "INVESTMENT";
      case "Luxus":
        return "LUXURY";
      case "Rezsi":
        return "OVERHEAD";
      case "Gyógyszertár":
        return "PHARMACY";
      case "Telefon":
        return "PHONE";
      case "Utazás":
        return "TRAVEL";
      default:
        return null;
    }
  };

  static dayPagingAvailable = date => ({
    left: !moment
      .tz(date, Constants.TIME_ZONE)
      .endOf("day")
      .isSame(
        moment.tz(new Date("2015-09-30"), Constants.TIME_ZONE).endOf("day")
      ),
    right: !moment
      .tz(date, Constants.TIME_ZONE)
      .endOf("day")
      .isSame(moment.tz(new Date(), Constants.TIME_ZONE).endOf("day"))
  });

  static monthPagingAvailable = date => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    const now = new Date();
    return {
      left: !moment
        .tz(d, Constants.TIME_ZONE)
        .endOf("day")
        .isSame(
          moment.tz(new Date("2015-09-01"), Constants.TIME_ZONE).endOf("day")
        ),
      right: !(
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      )
    };
  };

  static getFormattedDate = date =>
    date.getFullYear() +
    ". " +
    Constants.MONTHS[date.getMonth()] +
    " " +
    date.getDate() +
    ".";

  static getYears = onSelectYear => {
    const years = [];
    for (let i = new Date().getFullYear(); i >= 2015; i--) {
      years.push(i);
    }
    return years.map((year, i) => (
      <MenuItem eventKey={i} key={i} onSelect={() => onSelectYear(year)}>
        {year}
      </MenuItem>
    ));
  };

  static getMonths = (onSelectMonth, selectedYear) => {
    return Constants.MONTHS.map((month, i) => {
      const now = new Date();
      if (
        (selectedYear === now.getFullYear() && i > now.getMonth()) ||
        (selectedYear === 2015 && i < 8)
      )
        return null;
      return (
        <MenuItem eventKey={i} key={i} onSelect={() => onSelectMonth(i)}>
          {month}
        </MenuItem>
      );
    });
  };

  static getInitialCheckboxStates = () => {
    const result = [];
    Constants.CATEGORY_CHECKBOXES.forEach(() => result.push(false));
    return result;
  };

  static canvas = document.createElement("canvas");

  static getTextWidth = (text, font) => {
    const context = Util.canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  };

  static getMaxTextWidth = (stringArray, font) =>
    Math.max(...stringArray.map(text => Util.getTextWidth(text, font)));

  static getMonthLabel = (year, month) => year + ". " + Constants.MONTHS[month];
}

export default Util;
