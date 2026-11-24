function logInfo(message) {                    // Funzione per scrivere un messaggio informativo.
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`); // Scrive in console data e messaggio.
}                                              // Chiude logInfo.

function logError(message) {                   // Funzione per scrivere un messaggio di errore.
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`); // Scrive in console l'errore con data e messaggio.
}                                              // Chiude logError.

module.exports = { logInfo, logError };        // Esporta le due funzioni per usarle negli altri file.