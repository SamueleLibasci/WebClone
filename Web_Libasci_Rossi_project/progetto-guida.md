# Guida completa al progetto `Web_Libasci_Rossi` — Architettura e divisione delle responsabilità

Questo documento descrive l'intero progetto, illustrando l'architettura a livelli, la divisione delle responsabilità e il ruolo di ciascun file e cartella nel rispetto della struttura di riferimento derivata da `esercizioNode`.

---

## 1. Cos'è questo progetto

È un'**applicazione web full-stack** ("Stasera") dedicata alla scoperta di eventi, locali e serate nella propria zona, con le seguenti caratteristiche:

- Pagine HTML semantiche e moderne (Home, Mappa, About, Contact, Login, Signup);
- Stili CSS responsive e modulari;
- Componenti riutilizzabili caricati asincronamente (Navbar e Footer);
- Autenticazione sicura tramite **Google Identity Services (OAuth 2.0)** e flusso OAuth redirect tramite **Passport.js**;
- Gestione delle sessioni tramite `express-session`;
- Integrazione con l'SDK di **Google Maps** per la geolocalizzazione e la visualizzazione interattiva degli eventi;
- Backend strutturato in **tre microservizi Node.js + Express** con netta separazione delle responsabilità: gateway, auth-service, service.

---

## 2. Tecnologie e librerie usate

### Lato backend (Node.js)

| Tecnologia / Libreria | Versione | A cosa serve |
|---|---|---|
| **Node.js** | 20+ | Ambiente di esecuzione JavaScript lato server. |
| **Express** | 4.x/5.x | Framework per la gestione del server HTTP, routing e middleware. |
| **http-proxy-middleware** | 4.x | Reverse proxy per il gateway. |
| **body-parser** | 2.x | Middleware per il parsing delle richieste HTTP in formato JSON e URL-encoded. |
| **express-session** | 1.x | Middleware per la gestione delle sessioni utente su cookie crittografati. |
| **passport** | 0.7.x | Middleware di autenticazione per Node.js. |
| **passport-google-oauth20** | 2.x | Strategia OAuth 2.0 Google per Passport (flusso redirect). |
| **google-auth-library** | 11.x | Libreria ufficiale di Google per la verifica asincrona dei token JWT OAuth (GSI one-tap). |
| **dotenv** | 16.x/18.x | Caricamento delle variabili d'ambiente dal file `.env`. |

### Lato frontend

| Tecnologia | A cosa serve |
|---|---|
| **HTML5** | Struttura semantica delle pagine (`index`, `map`, `about`, `contact`, `login`, `signup`). |
| **CSS3** | Layout con Flexbox, gradienti, animazioni di comparsa, media queries per dispositivi mobili. |
| **JavaScript (ES6+)** | Chiamate asincrone (`fetch`), manipolazione del DOM, gestione autenticazione e mappe. |
| **Google Identity Services** | Script ufficiale di Google per il login rapido via browser (one-tap). |
| **Google Maps JavaScript API** | Rendering dinamico delle mappe geografiche con marcatori e controlli di zoom. |

---

## 3. Struttura del progetto e divisione delle responsabilità

La struttura del progetto ricalca fedelmente quella di `esercizioNode`, adattando ogni componente al dominio applicativo di "Stasera":

```text
Web_Libasci_Rossi_project/
├── .gitignore                      # File e cartelle esclusi dal controllo di versione
├── brain_temp_index.txt            # Template/indice di riferimento rapido
├── install_module.bat              # Script per l'installazione automatica delle dipendenze (tutti e 3 i servizi)
├── progetto-guida.md               # Questa documentazione architetturale
├── run.bat                         # Script per l'avvio di tutti i servizi in ambiente Windows
├── uninstall_module.bat            # Script per la pulizia della cartella node_modules (tutti e 3 i servizi)
├── backend/
│   ├── readme.md                   # Panoramica del backend e ruoli dei servizi
│   ├── gateway/                    # API Gateway — punto di ingresso unico (porta 4000)
│   │   ├── .env                    # Variabili d'ambiente (porte e URL dei microservizi)
│   │   ├── package.json            # Dipendenze: express, http-proxy-middleware, dotenv
│   │   ├── config/
│   │   │   └── env.js              # Lettura centralizzata delle variabili d'ambiente del gateway
│   │   ├── proxies/
│   │   │   ├── authProxy.js        # Stub configurazione proxy Auth-Service
│   │   │   └── serviceProxy.js     # Stub configurazione proxy Main Service
│   │   └── src/
│   │       └── gateway.js          # Entry point del gateway: routing /api/v1/auth → auth-service, /api/v1 → service
│   ├── auth-service/               # Auth Service — flusso OAuth Google con Passport (porta 3001)
│   │   ├── .env                    # Variabili d'ambiente (CLIENT_ID, CLIENT_SECRET, CALLBACK_URL, GATEWAY_URL)
│   │   ├── package.json            # Dipendenze: express, passport, passport-google-oauth20, express-session, dotenv
│   │   ├── config/
│   │   │   ├── env.js              # Lettura centralizzata delle variabili d'ambiente dell'auth-service
│   │   │   └── passport.js         # Configurazione strategia Google OAuth 2.0 con Passport
│   │   └── src/
│   │       ├── authserver.js       # Entry point: sessione, Passport, mount routes
│   │       └── routes/
│   │           └── auth_routes.js  # GET /google (avvio OAuth), GET /google/callback (ricezione profilo)
│   └── service/                    # Main Service — pagine, sessione, GSI one-tap (porta 3000)
│       ├── .env                    # Variabili d'ambiente private (chiavi Google, segreti, porta)
│       ├── package.json            # Metadati del package e script di avvio
│       ├── config/
│       │   ├── env.js              # Validazione all'avvio e lettura controllata del .env
│       │   └── paths.js            # Mappatura centralizzata dei percorsi assoluti del filesystem
│       └── src/
│           ├── server.js           # Entry point del server Express, middleware e ascolto porta
│           ├── controllers/
│           │   ├── authController.js   # Logica applicativa di login (GSI), logout e profilo sessione
│           │   ├── configController.js # Fornisce le impostazioni pubbliche (es. Google Maps Key)
│           │   └── mapsController.js   # Gestione della mappa Google Maps, API key ed eventi geolocalizzati
│           ├── route/
│           │   ├── auth.js         # Routing degli endpoint di autenticazione (/auth/google, /auth/me, /auth/logout)
│           │   ├── config.js       # Routing degli endpoint di configurazione (/api/config)
│           │   ├── maps.js         # Routing degli endpoint mappe ed eventi (/api/maps/config, /api/maps/events, /maps)
│           │   └── pageroutes.js   # Routing per servire le pagine HTML (/ , /login, /signup, /about, /contact, /map)
│           └── utils/
│               ├── constants.js    # Costanti esportate (ri-esporta valori validati da config/env.js)
│               ├── eventsStore.js  # Registro in memoria degli eventi geolocalizzati per la mappa
│               ├── googleClient.js # Comunicazione e verifica crittografica con le API di Google OAuth (GSI)
│               ├── logger.js       # Utility per log standardizzati a console ([INFO], [ERROR])
│               ├── normalizeEvent.js# Normalizzazione e validazione dei dati degli eventi per la mappa
│               ├── normalizeUser.js# Normalizzazione del payload grezzo di Google nel formato utente dell'app
│               ├── usersStore.js   # Registro in memoria degli utenti autenticati
│               └── validateToken.js# Validatore dell'input in ingresso prima di chiamate esterne
└── frontend/
    └── public/
        ├── about.html              # Pagina descrittiva dell'applicazione
        ├── contact.html            # Pagina contatti e assistenza
        ├── index.html              # Home page con elenco eventi e anteprima
        ├── login.html              # Pagina di accesso con Google Identity
        ├── map.html                # Pagina mappa interattiva (equivalente di weather.html)
        ├── signup.html             # Pagina di registrazione con Google Identity
        ├── components/
        │   ├── footer.html         # Piè di pagina condiviso
        │   └── navbar.html         # Barra di navigazione condivisa
        ├── css/
        │   ├── about.css           # Stili per la pagina About
        │   ├── contact.css         # Stili per la pagina Contatti
        │   ├── footer.css          # Stili per il componente Footer
        │   ├── index.css           # Stili per la Home page e le schede eventi
        │   ├── login.css           # Stili per la card di Login
        │   ├── map.css             # Stili per la pagina Mappa
        │   ├── navbar.css          # Stili per la Navbar sticky responsive
        │   └── signup.css          # Stili per la card di Registrazione
        └── js/
            ├── index.js            # Script principale della Home page
            ├── login.js            # Gestore delle risposte credential di Google
            ├── maps.js             # Gestore dell'SDK Google Maps (equivalente di weather.js)
            └── navbar.js           # Gestione caricamento navbar e stato autenticazione
```

---

## 4. Dettaglio delle responsabilità per layer

### Layer `gateway/`
Il gateway è il **punto di ingresso unico** per il client. Espone tutto sotto `/api/v1/` e smista le richieste ai microservizi interni:
- **`/api/v1/auth/*`** → `auth-service` (porta 3001)
- **`/api/v1/*`** → `service` (porta 3000)

Il pathRewrite rimuove il prefisso `/api/v1` prima di passare la richiesta al servizio di destinazione.

### Layer `auth-service/`
- **`config/passport.js`**: Configura la strategia Google OAuth 2.0. All'autenticazione riuscita costruisce un oggetto utente (`googleId`, `displayName`, `email`, `picture`).
- **`config/env.js`**: Legge `AUTH_PORT`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `GATEWAY_URL`.
- **`src/authserver.js`**: Avvia il server, configura la sessione e Passport, monta le routes.
- **`src/routes/auth_routes.js`**: Espone `GET /google` (avvio OAuth) e `GET /google/callback` (ricezione profilo e redirect al gateway con payload base64).

### Layer `service/config/`
- **`env.js`**: È il primo file caricato da `server.js`. Esegue `dotenv` e valida la presenza di tutte le variabili obbligatorie (`GOOGLE_CLIENT_ID`, `SESSION_SECRET`, `MAPS_API_KEY`, `PORT`). Se una manca, termina il processo immediatamente (`process.exit(1)`).
- **`paths.js`**: Centralizza la risoluzione dei percorsi assoluti (`ROOT`, `PUBLIC`, `ROUTES`, `CONTROLLERS`, `UTILS`), prevenendo percorsi relativi fragili come `../../`.

### Layer `service/src/route/`
I router contengono unicamente la definizione degli endpoint HTTP (verbo e path) e collegano la richiesta al controller corrispondente, senza implementare logica di business:
- **`pageroutes.js`**: Invia i file statici HTML presenti in `frontend/public/`.
- **`auth.js`**: Espone `/auth/google` (POST), `/auth/me` (GET), `/auth/logout` (POST).
- **`config.js`**: Espone `/api/config` (GET) per trasmettere in sicurezza la chiave pubblica di Google Maps.

### Layer `service/src/controllers/`
I controller orchestrano le richieste:
1. Ricevono i parametri dalla richiesta (`req.body`, `req.session`).
2. Convalidano i dati tramite le funzioni del layer `utils/` (es. `validateToken`).
3. Richiamano i client di servizio (es. `verifyGoogleToken`).
4. Trasformano i dati con i normalizzatori (es. `normalizeUser`).
5. Salvano lo stato nella sessione (`req.session.user`).
6. Inviano la risposta JSON al client.

### Layer `service/src/utils/`
Funzioni pure, modulari e prive di effetti collaterali non controllati:
- **`validateToken.js`**: Valida che il token ricevuto sia una stringa non vuota (equivalente concettuale di `validateCity.js`).
- **`normalizeUser.js`**: Isola i campi strettamente necessari (`googleId`, `email`, `name`, `picture`) scartando campi non utilizzati del token JWT (equivalente concettuale di `normalizeWeather.js`).
- **`googleClient.js`**: Wrapper che incapsula `OAuth2Client` di Google e gestisce la verifica asincrona dei token GSI one-tap.
- **`usersStore.js`**: Gestisce l'anagrafica utenti in memoria.
- **`logger.js`**: Centralizza i formati di log a terminale con timestamp ISO.

---

## 5. Flusso di autenticazione

```
Browser → GET /api/v1/auth/google         → Gateway → auth-service /google
        ← 302 redirect Google OAuth
Browser → GET /api/v1/auth/google/callback → Gateway → auth-service /google/callback
        ← 302 redirect /api/v1/?session=<base64>
Browser → GET /api/v1/?session=<base64>   → Gateway → service /
        (il frontend legge il query param e chiama POST /auth/google con il token GSI)
```

---

## 6. Istruzioni per l'avvio

1. **Installazione dipendenze**:
   Doppio click su `install_module.bat` oppure da terminale per ogni servizio:
   ```cmd
   cd backend\gateway      && npm install
   cd backend\auth-service && npm install
   cd backend\service      && npm install
   ```
2. **Configurazione .env**:
   - `backend/service/.env`: inserire `GOOGLE_CLIENT_ID`, `SESSION_SECRET`, `MAPS_API_KEY`, `PORT=3000`
   - `backend/auth-service/.env`: inserire `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `SESSION_SECRET`, `AUTH_PORT=3001`
   - `backend/gateway/.env`: inserire `GATEWAY_PORT=4000`, `SERVICE_URL`, `AUTH_SERVICE_URL`
3. **Avvio di tutti i servizi**:
   Doppio click su `run.bat` oppure:
   ```cmd
   cd backend\gateway      && node src\gateway.js
   cd backend\auth-service && node src\authserver.js
   cd backend\service      && node src\server.js
   ```
4. **Accesso all'applicazione**:
   Aprire il browser all'indirizzo [http://localhost:4000/api/v1](http://localhost:4000/api/v1).

---

Fine della guida.
