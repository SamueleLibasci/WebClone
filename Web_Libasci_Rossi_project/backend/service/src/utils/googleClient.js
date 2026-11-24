const { OAuth2Client } = require("google-auth-library"); // Importa il client di Google per verificare i token.
const { GOOGLE_CLIENT_ID } = require("./constants");     // Importa il Client ID dal file constants.js.

const client = new OAuth2Client(GOOGLE_CLIENT_ID);       // Crea il client con il nostro Client ID.

async function verifyGoogleToken(idToken) {    // Controlla che il token arrivi davvero da Google per Stasera.
    const ticket = await client.verifyIdToken({ // Chiede a Google di verificare il token.
        idToken: idToken,                      // Token ricevuto dal browser.
        audience: GOOGLE_CLIENT_ID             // Il token deve essere stato emesso per il nostro Client ID.
    });                                        // Chiude la richiesta di verifica.
    const payload = ticket.getPayload();       // Legge i dati contenuti nel token.
    return {                                   // Restituisce i dati dell'utente.
        googleId: payload.sub,                 // Id univoco dell'utente su Google.
        email: payload.email,                  // Email dell'utente.
        name: payload.name,                    // Nome dell'utente.
        picture: payload.picture               // Foto profilo dell'utente.
    };                                         // Chiude l'oggetto.
}                                              // Chiude la funzione.

module.exports = { verifyGoogleToken };        // Esporta la funzione.