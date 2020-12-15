const nearbyCities = require("nearby-cities");

const getCity = async (res, req) => {
  const input = req.body;
  if (!input || !input.lat || !input.lng) {
    console.log(5177, "No location data provided.");
    return res
      .status(400)
      .send({ success: false, msg: "No location data provided." });
  }
  const { lat, lng } = req.body;
  const cities = await nearbyCities({ lat, lng });
  return res
    .status(200)
    .send({
      cities,
      msg:
        cities && cities.length
          ? `A visszaadott városok száma: ${cities.length}`
          : "Nincs találat."
    });
};

module.exports = {
  getCity
};
