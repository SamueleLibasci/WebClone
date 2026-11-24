/**
 * Estrae e normalizza i campi essenziali dal profilo Google grezzo.
 * Filtra i dati restituiti da verifyGoogleToken, restituendo un oggetto
 * snello e coerente con il modello utente dell'applicazione.
 * @param {object} profile - Profilo grezzo restituito da googleClient.verifyGoogleToken
 * @returns {object} - Oggetto utente pronto per la sessione e il frontend
 */
function normalizeUser(profile) {
    return {
        googleId: profile.googleId, // Id univoco dell'utente su Google.
        email: profile.email,       // Email dell'utente.
        name: profile.name,         // Nome completo dell'utente.
        picture: profile.picture    // URL della foto profilo.
    };
}

module.exports = { normalizeUser };
