const path = require("path");                  // Importa il modulo per gestire i percorsi dei file.

// Directory ROOT del servizio
const ROOT = path.join(__dirname, "..");       // Cartella backend\service (una sopra config).
const FRONTEND_PUBLIC = path.join(ROOT, "..", "..", "frontend", "public"); // Cartella frontend\public.

// Percorsi principali
module.exports = {                             // Esporta i percorsi per usarli negli altri file.
    ROOT,                                      // Cartella del servizio.
    SRC: path.join(ROOT, "src"),               // Cartella src.
    PUBLIC: FRONTEND_PUBLIC,                   // Cartella dei file pubblici del frontend.
    ROUTES: path.join(ROOT, "src", "route"),   // Cartella delle route.
    CONTROLLERS: path.join(ROOT, "src", "controllers"), // Cartella dei controller.
    UTILS: path.join(ROOT, "src", "utils")     // Cartella delle utility.
};
