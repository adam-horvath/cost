const { test } = require('node:test');
const assert = require('node:assert/strict');
const { computeStats } = require('../app/main/dashboard');

// Helpers to build fake items
const cost = (category, amount) => ({ category, category_type: 'COST', amount });
const income = (category, amount) => ({ category, category_type: 'INCOME', amount });

// Use a past month so "quotient" is always the full daysInMonth (no partial-month division)
const PAST = { year: 2025, month: 0, day: 31 }; // January 2025, full month

test('INVESTMENT cost does not affect daily_average_without_house', () => {
  const baseline = computeStats({
    itemsOfMonth: [cost('FOOD', 3000)],
    itemsOfPreviousMonth: [],
    previousBalance: null,
    ...PAST,
  });

  const withInvestment = computeStats({
    itemsOfMonth: [cost('FOOD', 3000), cost('INVESTMENT', 40000)],
    itemsOfPreviousMonth: [],
    previousBalance: null,
    ...PAST,
  });

  assert.equal(
    withInvestment.daily_average_without_house,
    baseline.daily_average_without_house,
    'Adding an INVESTMENT cost must not change daily_average_without_house'
  );
});

test('HOUSE cost does not affect daily_average_without_house', () => {
  const baseline = computeStats({
    itemsOfMonth: [cost('FOOD', 3000)],
    itemsOfPreviousMonth: [],
    previousBalance: null,
    ...PAST,
  });

  const withHouse = computeStats({
    itemsOfMonth: [cost('FOOD', 3000), cost('HOUSE', 100000)],
    itemsOfPreviousMonth: [],
    previousBalance: null,
    ...PAST,
  });

  assert.equal(
    withHouse.daily_average_without_house,
    baseline.daily_average_without_house,
    'Adding a HOUSE cost must not change daily_average_without_house'
  );
});

test('PHONE cost does not affect daily_average_without_house', () => {
  const baseline = computeStats({
    itemsOfMonth: [cost('FOOD', 3000)],
    itemsOfPreviousMonth: [],
    previousBalance: null,
    ...PAST,
  });

  const withPhone = computeStats({
    itemsOfMonth: [cost('FOOD', 3000), cost('PHONE', 5000)],
    itemsOfPreviousMonth: [],
    previousBalance: null,
    ...PAST,
  });

  assert.equal(
    withPhone.daily_average_without_house,
    baseline.daily_average_without_house,
    'Adding a PHONE cost must not change daily_average_without_house'
  );
});

test('regular cost categories DO increase daily_average_without_house', () => {
  const baseline = computeStats({
    itemsOfMonth: [cost('FOOD', 3000)],
    itemsOfPreviousMonth: [],
    previousBalance: null,
    ...PAST,
  });

  const withExtra = computeStats({
    itemsOfMonth: [cost('FOOD', 3000), cost('GROCERY', 5000)],
    itemsOfPreviousMonth: [],
    previousBalance: null,
    ...PAST,
  });

  assert.ok(
    withExtra.daily_average_without_house > baseline.daily_average_without_house,
    'Adding a GROCERY cost must increase daily_average_without_house'
  );
});

test('INVESTMENT increases total_cost but not daily_average_without_house', () => {
  const result = computeStats({
    itemsOfMonth: [cost('FOOD', 3100), cost('INVESTMENT', 40000)],
    itemsOfPreviousMonth: [],
    previousBalance: null,
    ...PAST,
  });

  const daysInJan = 31;
  assert.equal(result.total_cost, 43100);
  assert.equal(result.daily_average, 43100 / daysInJan);
  assert.equal(result.daily_average_without_house, 3100 / daysInJan);
});
