const offline = (
  state = {
    isOffline: false
  },
  action
) => {
  switch (action.type) {
    case "OFFLINE":
      return {
        isOffline: action.isOffline
      };
    default:
      return state;
  }
};

export default offline;
