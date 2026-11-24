/**
 * Valida il token Google credential inviato dal browser.
 * Accetta solo stringhe non vuote.
 * @param {string} credential - Token JWT di Google Identity
 * @returns {boolean} - true se il token è valido in forma, false altrimenti
 */
function validateToken(credential) {
    return (
        typeof credential === "string" &&
        credential.trim().length > 0
    );
}

module.exports = { validateToken };
