const express = require("express");
const { getConfig } = require("../controllers/configController"); // Importa il controller delle impostazioni.

const router = express.Router();

/**
 * Route GET per restituire le impostazioni pubbliche al browser.
 * Usata dal frontend per ottenere la chiave di Google Maps senza esporla nel codice client.
 */
router.get("/api/config", getConfig);

module.exports = router;
