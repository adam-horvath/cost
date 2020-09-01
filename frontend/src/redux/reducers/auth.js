const auth = (
  state = {
    id: localStorage.getItem("cost_id"),
    token: localStorage.getItem("cost_token")
  },
  action
) => {
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem("cost_id", action.id);
      localStorage.setItem("cost_token", action.token);
      return {
        id: action.id,
        token: action.token
      };
    case "LOGOUT":
      localStorage.removeItem("cost_id");
      localStorage.removeItem("cost_token");
      return {
        id: null,
        token: null
      };
    default:
      return state;
  }
};

export default auth;
