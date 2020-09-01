export const bubble = ({ text = "", isError = false, shown = false }) => ({
  type: "BUBBLE",
  bubbleParams: {
    text,
    isError,
    shown
  }
});
