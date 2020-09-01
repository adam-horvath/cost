export const login = loginResponse => {
  return {
    type: "LOGIN",
    token: loginResponse.token,
    id: loginResponse.id
  };
};

export const logout = () => {
  return {
    type: "LOGOUT"
  }
};
