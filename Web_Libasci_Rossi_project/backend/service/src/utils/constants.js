/**
 * Costanti globali di configurazione.
 * Le variabili vengono lette e validate centralmente da config/env.js.
 * Questo modulo le ri-esporta per comodità degli altri file src/.
 */
const env = require("../../config/env");       // Importa le variabili già validate all'avvio.

module.exports = {
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,    // Client ID di Google.
    SESSION_SECRET: env.SESSION_SECRET,        // Chiave segreta delle sessioni.
    MAPS_API_KEY: env.MAPS_API_KEY,            // Chiave di Google Maps.
    PORT: env.PORT,                            // Porta su cui ascolta il server.
    GATEWAY_URL: env.GATEWAY_URL              // URL del gateway (per redirect auth).
};
