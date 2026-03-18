const User = require('../models/user');
const Item = require('../models/item');
const Balance = require('../models/balance');
const auth = require('../auth/auth');

const getMainDashboard = async (req, res) => {
  const { user, group } = await auth.getUserAndGroup(auth.getToken(req.headers));
  const date = req.body.date ? new Date(req.body.date) : new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const [itemsOfDay, itemsOfMonth] = await Promise.all([
    Item.find({ group_id: group.id, year, month, day }),
    Item.find({ group_id: group.id, year, month }),
  ]);
  let totalCost = 0;
  let totalIncome = 0;
  for (const item of itemsOfMonth) {
    if (item.category_type === 'INCOME') totalIncome += item.amount;
    else totalCost += item.amount;
  }
  const { year: prevYear, month: prevMonth } = getPreviousMonth(year, month);
  const previousBalance = await Balance.findOne({
    group_id: group.id,
    year: prevYear,
    month: prevMonth,
  });
  const balance = ((previousBalance && previousBalance.amount) || 0) + totalIncome - totalCost;
  const isAdmin = group.admin && group.admin.toString() === user.id;
  if (!isAdmin) {
    return res.status(200).send({ items: itemsOfDay, balance });
  }
  // N+1 fix: single query for all pending users
  const pendingUsers = await User.find({
    _id: { $in: group.pending_requests },
  });
  return res.status(200).send({
    items: itemsOfDay,
    pending_requests: pendingUsers.map((u) => u.email),
    balance,
  });
};

// Pure computation — extracted so it can be unit-tested without a database.
const computeStats = ({ itemsOfMonth, itemsOfPreviousMonth, previousBalance, year, month, day }) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const onceInMonthCategories = new Set(['HOUSE', 'INVESTMENT', 'PHONE']);
  let totalCost = 0,
    generalCost = 0,
    costOnceOfThisMonth = 0,
    totalIncome = 0;

  for (const item of itemsOfMonth) {
    if (item.category_type === 'INCOME') {
      totalIncome += item.amount;
    } else {
      totalCost += item.amount;
      if (onceInMonthCategories.has(item.category)) {
        costOnceOfThisMonth += item.amount;
      } else {
        generalCost += item.amount;
      }
    }
  }
  let costOnceOfPreviousMonth = 0;
  for (const item of itemsOfPreviousMonth) {
    if (onceInMonthCategories.has(item.category)) costOnceOfPreviousMonth += item.amount;
  }
  const previousAmount = (previousBalance && previousBalance.amount) || 0;
  const balance = previousAmount + totalIncome - totalCost;
  const balanceInMonth = totalIncome - totalCost;
  const endInstantOfMonth = new Date(year, month + 1, 0);
  const quotient = new Date() < endInstantOfMonth ? day : daysInMonth;
  const dailyAverage = totalCost / quotient;
  const dailyAverageOfGeneralCost = generalCost / quotient;
  const costOnce = Math.max(costOnceOfPreviousMonth, costOnceOfThisMonth);
  const expectedCost = isThisMonth(year, month) ? dailyAverageOfGeneralCost * daysInMonth + costOnce : totalCost;
  const expectedBalance = previousAmount + totalIncome - expectedCost;
  const expectedBalanceInMonth = totalIncome - expectedCost;
  return {
    balance,
    total_income: totalIncome,
    total_cost: totalCost,
    daily_average: dailyAverage,
    daily_average_without_house: dailyAverageOfGeneralCost,
    balance_in_month: balanceInMonth,
    expected_cost: expectedCost,
    expected_balance_in_month: expectedBalanceInMonth,
    expected_balance: expectedBalance,
  };
};

const getStats = async (req, res) => {
  const { group } = await auth.getUserAndGroup(auth.getToken(req.headers));
  const date = req.body.date ? new Date(req.body.date) : new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const { year: prevYear, month: prevMonth } = getPreviousMonth(year, month);
  const [itemsOfMonth, itemsOfPreviousMonth, previousBalance] = await Promise.all([
    Item.find({ group_id: group.id, year, month }),
    Item.find({ group_id: group.id, category_type: 'COST', year: prevYear, month: prevMonth }),
    Balance.findOne({ group_id: group.id, year: prevYear, month: prevMonth }),
  ]);
  return res.status(200).send(computeStats({ itemsOfMonth, itemsOfPreviousMonth, previousBalance, year, month, day }));
};

const deleteItem = async (req, res) => {
  const itemId = req.params.id;
  if (!itemId) {
    return res.status(400).send({ success: false, msg: 'No item provided.' });
  }
  const { group } = await auth.getUserAndGroup(auth.getToken(req.headers));
  const item = await Item.findById(itemId);
  if (!item) {
    return res.status(404).send({
      success: false,
      msg: 'A törölni kívánt tétel nem található.',
    });
  }
  if (item.group_id.toString() !== group.id) {
    return res.status(403).send({
      success: false,
      msg: 'Authorization failed (delete item from another group).',
    });
  }
  await Item.findByIdAndDelete(item.id);
  const balances = await Balance.find({
    group_id: group.id,
    date: { $gte: new Date(item.year, item.month, 1, 0) },
  });
  const factor = item.category_type === 'INCOME' ? 1 : -1;
  const change = item.amount * factor;
  await Promise.all(
    balances.map(async (balance) => {
      balance.amount -= change;
      await balance.save();
    })
  );
  return res.status(200).send({ success: true, msg: 'Tétel törölve.' });
};

const updateItem = async (req, res) => {
  const newItem = req.body;
  if (!newItem || !newItem.id || !newItem.amount || !newItem.category || !newItem.category_type || !newItem.date) {
    return res.status(400).send({ success: false, msg: 'No item provided.' });
  }
  const { group } = await auth.getUserAndGroup(auth.getToken(req.headers));
  const item = await Item.findById(newItem.id);
  if (!item) return res.status(404).send({ success: false, msg: 'Item not found.' });
  if (item.group_id.toString() !== group.id) {
    return res.status(403).send({
      success: false,
      msg: 'Authorization failed (update item from another group).',
    });
  }
  const newDate = new Date(newItem.date);
  if (newDate.getFullYear() !== item.year || newDate.getMonth() !== item.month) {
    return res.status(400).send({
      success: false,
      msg: 'Do not modify the month, use delete and create instead!',
    });
  }
  const isModifiedAmount = item.amount !== newItem.amount;
  const oldAmount = item.amount;
  item.amount = newItem.amount;
  item.category = newItem.category;
  item.category_type = newItem.category_type;
  if (newItem.description) item.description = newItem.description;
  item.date = newDate;
  item.day = newDate.getDate();
  await item.save();
  if (isModifiedAmount) {
    const balances = await Balance.find({
      group_id: group.id,
      date: { $gte: new Date(item.year, item.month, 1, 0) },
    });
    const factor = item.category_type === 'INCOME' ? 1 : -1;
    const change = (newItem.amount - oldAmount) * factor;
    await Promise.all(
      balances.map(async (balance) => {
        balance.amount += change;
        await balance.save();
      })
    );
    return res.status(200).send({ success: true, msg: 'Sikeres mentés új összeggel.' });
  }
  return res.status(200).send({
    success: true,
    msg: 'Sikeres mentés az összeg módosítása nélkül.',
  });
};

const addItem = async (req, res) => {
  const input = req.body;
  if (!input || !input.amount || !input.category || !input.category_type || !input.date) {
    return res.status(400).send({ success: false, msg: 'No item provided.' });
  }
  const { group } = await auth.getUserAndGroup(auth.getToken(req.headers));
  const date = new Date(input.date);
  const item = new Item({
    group_id: group.id,
    amount: input.amount,
    category: input.category,
    category_type: input.category_type,
    date,
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
    ...(input.description && { description: input.description }),
  });
  await item.save();
  const factor = item.category_type === 'INCOME' ? 1 : -1;
  const change = item.amount * factor;
  const balances = await getBalancesFromMonth({ year: item.year, month: item.month }, group.id);
  await Promise.all(
    balances.map(async (balance) => {
      balance.amount += change;
      await balance.save();
    })
  );
  return res.status(200).send({ success: true, msg: 'Sikeres mentés!' });
};

// Finds or creates Balance records from the given month through the current month.
const getBalancesFromMonth = async (startMonthObj, groupId) => {
  const today = new Date();
  const results = [];
  let current = { ...startMonthObj };
  while (
    current.year < today.getFullYear() ||
    (current.year === today.getFullYear() && current.month <= today.getMonth())
  ) {
    let balance = await Balance.findOne({
      group_id: groupId,
      year: current.year,
      month: current.month,
    });
    if (!balance) {
      const prev = getPreviousMonth(current.year, current.month);
      const prevBalance = await Balance.findOne({
        group_id: groupId,
        year: prev.year,
        month: prev.month,
      });
      balance = new Balance({
        group_id: groupId,
        date: new Date(current.year, current.month, 1, 2),
        year: current.year,
        month: current.month,
        amount: prevBalance ? prevBalance.amount : 0,
      });
    }
    results.push(balance);
    current = getNextMonth(current.year, current.month);
  }
  return results;
};

const isThisMonth = (year, month) => {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month;
};

const getNextMonth = (year, month) => {
  if (month === 11) return { year: year + 1, month: 0 };
  return { year, month: month + 1 };
};

const getPreviousMonth = (year, month) => {
  if (month === 0) return { year: year - 1, month: 11 };
  return { year, month: month - 1 };
};

module.exports = {
  getMainDashboard,
  addItem,
  deleteItem,
  updateItem,
  getStats,
  computeStats, // exported for unit tests
};
