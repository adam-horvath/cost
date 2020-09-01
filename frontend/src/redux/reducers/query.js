const query = (
  state = {
    value: null,
    items: []
  },
  action
) => {
  switch (action.type) {
    case "QUERY":
      return action.query;
    case "QUERY_LIST":
      return action.queryList;
    default:
      return state;
  }
};

export default query;

