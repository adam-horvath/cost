const nearbyCities = require("nearby-cities");

const getCity = (res, req) => {
  const input = req.body;
  if (!input || !input.lat || !input.lng) {
    console.log(5177, "No location data provided.");
    return res.json({ success: false, msg: "No location data provided." });
  }
  const { lat, lng } = req.body;
  nearbyCities({ lat, lng })
    .then(result => {
      return res.status(200).send({
        result,
        msg:
          result && result.length
            ? `A visszaadott városok száma: ${result.length}`
            : "Nincs találat."
      });
    })
    .catch(err => {
      console.log(5178, err.message);
      return res.status(403).send({ success: false, msg: err.message });
    });
};

module.exports = {
  getCity
};
