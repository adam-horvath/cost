import axios from "axios";

const requestCreator = axios.create({});

export default async ({ url, method = "POST", data } = {}) => {
  const headers = {};
  const token = localStorage.getItem("cost_token");

  if (token) {
    headers["Authorization"] = `${token}`;
  }

  try {
    const { data: response } = await requestCreator.request({
      method,
      url,
      data,
      headers
    });
    return response;
  } catch (err) {
    console.log(err.toString(), err.toString().indexOf("403"));
    if (err.toString().indexOf("403") > -1) {
      console.log("hey");
      return {
        error: true,
        status: 403,
        message: "Hitelesítési hiba!"
      };
    }
  }
};
