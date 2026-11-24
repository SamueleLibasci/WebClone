const { verifyGoogleToken } = require("../utils/googleClient"); // Wrapper per la verifica token con Google.
const { normalizeUser } = require("../utils/normalizeUser");    // Normalizza il profilo grezzo di Google.
const { validateToken } = require("../utils/validateToken");    // Valida il token in ingresso.
const { findOrCreateUser } = require("../utils/usersStore");    // Registro utenti in memoria.
const { logError } = require("../utils/logger");                // Log centralizzato degli errori.

/**
 * Controller per il login con Google OAuth.
 * 1. Valida la presenza e il formato del token credential
 * 2. Verifica il token con l'API Google tramite googleClient
 * 3. Normalizza il profilo grezzo tramite normalizeUser
 * 4. Trova o crea l'utente nello store tramite usersStore
 * 5. Salva l'utente nella sessione e risponde al browser
 */
exports.googleLogin = async (req, res) => {
    const credential = req.body.credential;    // Token JWT inviato dal browser dopo il login Google.

    if (!validateToken(credential)) {          // Valida il formato del token prima di qualsiasi chiamata esterna.
        return res.status(400).json({ ok: false, message: "Token mancante." }); // Token assente o malformato.
    }

    try {
        const rawProfile = await verifyGoogleToken(credential); // Verifica il token con Google e ottiene il profilo grezzo.
        const profile = normalizeUser(rawProfile);              // Normalizza il profilo nei campi utili all'applicazione.
        const user = findOrCreateUser(profile);                 // Trova l'utente esistente o lo registra nello store.
        req.session.user = user;               // Salva l'utente nella sessione: da ora il server sa chi è collegato.
        return res.json({ ok: true, user: user }); // Risponde con i dati dell'utente.
    } catch (error) {
        logError("Login Google fallito: " + error.message); // Registra l'errore nel log centralizzato.
        return res.status(401).json({ ok: false, message: "Accesso con Google non riuscito." }); // Risponde con errore di autenticazione.
    }
};

/**
 * Controller che restituisce l'utente attualmente collegato dalla sessione.
 */
exports.me = (req, res) => {
    if (req.session.user) {                    // Se nella sessione c'è un utente...
        return res.json({ ok: true, user: req.session.user }); // ...lo restituisce.
    }
    return res.json({ ok: false });            // Altrimenti indica che nessun utente è collegato.
};

/**
 * Controller per il logout: distrugge la sessione corrente.
 */
exports.logout = (req, res) => {
    req.session.destroy(() => {                // Cancella la sessione lato server.
        res.json({ ok: true });                // Conferma al browser che il logout è avvenuto.
    });
};
