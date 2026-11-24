var users = [];                                // Lista degli utenti in memoria (si azzera al riavvio del server).

function findOrCreateUser(profile) {           // Cerca l'utente, se non esiste lo crea.
    var user = users.find(u => u.googleId === profile.googleId); // Cerca un utente con lo stesso id Google.
    if (!user) {                               // Se l'utente non esiste...
        user = profile;                        // ...usa i dati arrivati da Google...
        users.push(user);                      // ...e lo aggiunge alla lista.
    }                                          // Chiude l'if.
    return user;                               // Restituisce l'utente.
}                                              // Chiude la funzione.

module.exports = { findOrCreateUser };         // Esporta la funzione.