const Item = require('../models/item');
const Balance = require('../models/balance');
const auth = require('../auth/auth');

const getChartData = async (req, res) => {
  if (!req.body.category_types && !req.body.categories) {
    return res.status(400).send({ success: false, msg: 'Missing parameters.' });
  }
  const { group } = await auth.getUserAndGroup(auth.getToken(req.headers));
  const categoryTypes = req.body.category_types ? req.body.category_types.split(',') : [];
  const categories = req.body.categories ? req.body.categories.split(',') : [];
  const minMonth = req.body.min_month || 0;
  const maxMonth = req.body.max_month || 11;
  let minDate = { year: req.body.min_year, month: minMonth };
  if (!minDate.year || minDate.year < 2015 || (minDate.year === 2015 && minDate.month < 9)) {
    minDate = { year: 2015, month: 9 };
  }
  let maxDate = { year: req.body.max_year, month: maxMonth };
  const now = new Date();
  if (
    !maxDate.year ||
    maxDate.year > now.getFullYear() ||
    (maxDate.year === now.getFullYear() && maxDate.month > now.getMonth())
  ) {
    maxDate = { year: now.getFullYear(), month: now.getMonth() };
  }
  const months = [];
  let i = { ...minDate };
  while (i.year < maxDate.year || (i.year === maxDate.year && i.month <= maxDate.month)) {
    months.push(i);
    i = getNextMonth(i.year, i.month);
  }
  const result = {};
  await Promise.all([
    // Per-category COST aggregation across months
    ...categories.map(async (category) => {
      result[category] = await Promise.all(
        months.map(async (monthObj) => {
          const items = await Item.find({
            group_id: group.id,
            year: monthObj.year,
            month: monthObj.month,
            category,
            category_type: 'COST',
          });
          const sum = items.reduce((acc, item) => acc + item.amount, 0);
          return { [`${monthObj.year}_${monthObj.month}`]: sum };
        })
      );
    }),
    // Per-categoryType aggregation across months
    ...categoryTypes.map(async (categoryType) => {
      if (categoryType === 'BALANCE') {
        const prev = getPreviousMonth(months[0].year, months[0].month);
        const prevBalance = await Balance.findOne({
          group_id: group.id,
          year: prev.year,
          month: prev.month,
        });
        result['PREV_BALANCE'] = prevBalance?.amount ?? 0;
        result[categoryType] = await Promise.all(
          months.map(async (monthObj) => {
            const [costItems, incomeItems] = await Promise.all([
              Item.find({
                group_id: group.id,
                year: monthObj.year,
                month: monthObj.month,
                category_type: 'COST',
              }),
              Item.find({
                group_id: group.id,
                year: monthObj.year,
                month: monthObj.month,
                category_type: 'INCOME',
              }),
            ]);
            const sumCost = costItems.reduce((acc, item) => acc + item.amount, 0);
            const sumIncome = incomeItems.reduce((acc, item) => acc + item.amount, 0);
            return {
              [`${monthObj.year}_${monthObj.month}`]: sumIncome - sumCost,
            };
          })
        );
      } else {
        result[categoryType] = await Promise.all(
          months.map(async (monthObj) => {
            const items = await Item.find({
              group_id: group.id,
              year: monthObj.year,
              month: monthObj.month,
              category_type: categoryType,
            });
            const sum = items.reduce((acc, item) => acc + item.amount, 0);
            return { [`${monthObj.year}_${monthObj.month}`]: sum };
          })
        );
      }
    }),
  ]);
  return res.status(200).send({ success: true, result });
};

const getNextMonth = (year, month) => {
  if (month === 11) return { year: year + 1, month: 0 };
  return { year, month: month + 1 };
};

const getPreviousMonth = (year, month) => {
  if (month === 0) return { year: year - 1, month: 11 };
  return { year, month: month - 1 };
};

module.exports = { getChartData };
