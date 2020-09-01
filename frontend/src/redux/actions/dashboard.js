export const dailyData = ({ balance, items, pendingRequests }) => ({
  type: "DAILY_DATA",
  balance,
  items,
  pendingRequests
});
