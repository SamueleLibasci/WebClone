const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");

// Caricamento variabili d'ambiente (.env nel backend/service) con validazione obbligatoria all'avvio.
require("../config/env");

const { SESSION_SECRET, PORT } = require("./utils/constants"); // Importa le costanti già validate.
const port = PORT || 3000;

const app = express();

// Middleware di parsing: elabora richieste JSON e form URL-encoded (POST da form HTML)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware di sessione: il server si ricorda chi è collegato tra una richiesta e l'altra.
app.use(session({
    secret: SESSION_SECRET,        // Chiave con cui viene firmato il cookie di sessione.
    resave: false,                 // Non risalva la sessione se non è cambiata.
    saveUninitialized: false       // Non crea sessioni vuote.
}));

// Registrazione router applicativi
const pageRoutes = require("./route/pageroutes"); // Pagine HTML statiche (GET /, /login)
const authRoutes = require("./route/auth");       // Autenticazione Google (POST/GET /auth/*)
const configRoutes = require("./route/config");   // Impostazioni pubbliche (GET /api/config)
const mapsRoutes = require("./route/maps");       // Endpoint Google Maps ed eventi geolocalizzati

app.use("/", pageRoutes);    // Pagine HTML statiche.
app.use("/", authRoutes);    // Autenticazione Google OAuth.
app.use("/", configRoutes);  // Impostazioni pubbliche per il frontend.
app.use("/", mapsRoutes);    // Google Maps API ed eventi.

// Servizio file statici (HTML, CSS, JS, immagini da frontend/public)
app.use(express.static(path.join(__dirname, "../../../frontend/public")));

// Avvio del server HTTP
app.listen(port, () => {
    console.log("Server in ascolto alla porta " + port);
    console.log("Accedi all'indirizzo http://localhost:" + port);
});
