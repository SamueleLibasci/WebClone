const path = require("path");

// Carica le variabili dal file .env nella radice del service
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config();

/**
 * Validazione delle variabili d'ambiente obbligatorie all'avvio.
 * Se una variabile manca, il processo termina immediatamente con codice di errore 1.
 */
const requiredEnvVars = [
    "GOOGLE_CLIENT_ID",
    "SESSION_SECRET",
    "MAPS_API_KEY",
    "PORT"
];

requiredEnvVars.forEach(key => {
    if (!process.env[key]) {
        console.error(`Errore critico: la variabile d'ambiente ${key} non è definita.`);
        process.exit(1);
    }
});

module.exports = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID, // Client ID di Google (usato per verifica token GSI).
    SESSION_SECRET: process.env.SESSION_SECRET,     // Chiave segreta delle sessioni.
    MAPS_API_KEY: process.env.MAPS_API_KEY,         // Chiave di Google Maps.
    PORT: process.env.PORT,                         // Porta su cui ascolta il server.
    GATEWAY_URL: process.env.GATEWAY_URL || "http://localhost:4000" // URL del gateway (per redirect auth).
};
