const chart = (
  state = {
    chartData: null
  },
  action
) => {
  switch (action.type) {
    case "CHART_DATA":
      for (let key in action.chartData) {
        if (action.chartData.hasOwnProperty(key) && key !== 'PREV_BALANCE') {
          action.chartData[key].forEach(item => {
            for (let date in item) {
              if (item.hasOwnProperty(date)) {
                item["year"] = Number(date.split("_")[0]);
                item["month"] = Number(date.split("_")[1]);
                item["amount"] = item[date];
                delete item[date];
              }
            }
          });
          action.chartData[key].sort(
            (a, b) =>
              a.year < b.year
                ? -1
                : a.year > b.year
                ? 1
                : a.month < b.month
                  ? -1
                  : 1
          );
        }
      }
      if (action.chartData.hasOwnProperty("BALANCE")) {
        let sumAmount = action.chartData["PREV_BALANCE"];
        action.chartData["BALANCE"].forEach(item => {
          sumAmount += item.amount;
          item["sumAmount"] = sumAmount;
        });
      }
      return action.chartData;
    default:
      return state;
  }
};

export default chart;
