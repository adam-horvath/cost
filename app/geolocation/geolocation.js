let nearbyCities = require("nearby-cities");

let getCity = async (req, res) => {
  const input = req.query;
  if (!input || !input.lat || !input.lng) {
    console.log(5177, "No location data provided.");
    return res.json({ success: false, msg: "No location data provided." });
  }
  const { lat, lng } = req.query;
  try {
    const cities = await nearbyCities({ latitude: lat, longitude: lng });
    return res.status(200).send({
      cities,
      msg:
        cities && cities.length
          ? `A visszaadott városok száma: ${cities.length}`
          : "Nincs találat."
    });
  } catch (err) {
    console.log(5178, err.message);
    return res.status(403).send({ success: false, msg: err.message });
  }
};

module.exports = {
  getCity
};
