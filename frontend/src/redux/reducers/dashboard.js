const dashboard = (
  state = {
    balance: 0,
    items: null,
    pendingRequests: null
  },
  action
) => {
  switch (action.type) {
    case "DAILY_DATA":
      return {
        balance: action.balance,
        items: action.items,
        pendingRequests: action.pendingRequests
      };
    default:
      return state;
  }
};

export default dashboard;
