const { MAPS_API_KEY } = require("../utils/constants"); // Importa la chiave di Google Maps.

exports.getConfig = (req, res) => {            // Controller che dà al browser le impostazioni pubbliche.
    res.json({ ok: true, mapsApiKey: MAPS_API_KEY }); // Risponde con la chiave di Google Maps.
};                                             // Chiude il controller.
