const bubble = (
  state = {
    text: "",
    isError: false,
    shown: false
  },
  action
) => {
  switch (action.type) {
    case "BUBBLE":
      return action.bubbleParams;
    default:
      return state;
  }
};

export default bubble;


