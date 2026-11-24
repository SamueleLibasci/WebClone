Lo schema di funzionamento generale è:

CLIENT → GATEWAY → SERVICE / AUTH-SERVICE

## Ruolo del Gateway (porta 4000)

- Routing delle richieste
- Endpoint hiding: il client conosce solo il gateway, non le porte interne
- API versioning: tutte le risorse esposte sotto /api/v1/
- Punto di ingresso unico per scalabilità futura (rate limiting, caching, TLS, load balancing)

## Ruolo dell'Auth-Service (porta 3001)

- Gestisce il flusso OAuth 2.0 con Google tramite Passport.js
- Avvia il redirect verso Google (/google)
- Riceve il callback di Google (/google/callback) e costruisce il payload utente
- Reindirizza al gateway con il payload utente codificato in base64 (?session=<base64>)

## Ruolo del Service (porta 3000)

- Serve le pagine HTML statiche del frontend
- Gestisce la sessione utente (express-session)
- Verifica i token Google Identity Services (GSI one-tap) tramite google-auth-library
- Espone gli endpoint: /auth/google (POST), /auth/me (GET), /auth/logout (POST), /api/config (GET)

## Routing Gateway

| Prefisso Gateway     | Microservizio     | Porta |
|----------------------|-------------------|-------|
| /api/v1/auth/*       | auth-service      | 3001  |
| /api/v1/*            | service           | 3000  |
