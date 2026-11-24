/**
 * mapsController.js
 * Controller per la gestione delle mappe Google e degli eventi geolocalizzati.
 */

const { MAPS_API_KEY } = require("../utils/constants");
const {
    getAllEvents,
    getEventsByCategory,
    findEventById,
    addEvent,
    filterAllEvents
} = require("../utils/eventsStore");
const { normalizeEvent } = require("../utils/normalizeEvent");
const { logInfo, logError } = require("../utils/logger");

/**
 * Controller per fornire la configurazione pubblica di Google Maps (API Key) al frontend.
 */
function getMapsConfig(req, res) {
    try {
        if (!MAPS_API_KEY) {
            logError("Tentativo di accesso a MAPS_API_KEY ma la chiave non è configurata.");
            return res.status(500).json({ ok: false, message: "Chiave Google Maps non configurata sul server." });
        }
        return res.json({
            ok: true,
            mapsApiKey: MAPS_API_KEY
        });
    } catch (err) {
        logError("Errore nel recupero della configurazione Maps: " + err.message);
        return res.status(500).json({ ok: false, message: "Errore interno del server." });
    }
}

/**
 * Controller GET per recuperare gli eventi da visualizzare.
 * Supporta filtri per data, zona, genere, tipo, ricerca testuale, città e categoria.
 */
function getEvents(req, res) {
    try {
        const filters = {
            dateFilter: req.query.dateFilter || req.query.date || "all",
            zone: req.query.zone || "all",
            genre: req.query.genre || "all",
            type: req.query.type || "all",
            query: req.query.query || req.query.q || req.query.search || "",
            city: req.query.city || "",
            category: req.query.category || "all"
        };

        logInfo(`Richiesta elenco eventi GET con filtri: ${JSON.stringify(filters)}`);

        const rawEvents = filterAllEvents(filters);
        const events = rawEvents.map(normalizeEvent);

        return res.json({
            ok: true,
            count: events.length,
            events: events
        });
    } catch (err) {
        logError("Errore nel recupero degli eventi: " + err.message);
        return res.status(500).json({ ok: false, message: "Impossibile recuperare gli eventi." });
    }
}

/**
 * Controller POST per filtrare o creare eventi (pattern POST analogo a weatherController).
 * Se il body contiene action: "create" o un payload di creazione, crea l'evento.
 * Altrimenti applica i filtri avanzati.
 */
function filterEvents(req, res) {
    try {
        const body = req.body || {};

        // Se è una richiesta di creazione inviata all'endpoint POST
        if (body.action === "create" || (body.title && body.venue && !body.isFilter)) {
            return createEvent(req, res);
        }

        const filters = {
            dateFilter: body.dateFilter || body.date || req.query.dateFilter || "all",
            zone: body.zone || req.query.zone || "all",
            genre: body.genre || req.query.genre || "all",
            type: body.type || req.query.type || "all",
            query: body.query || body.q || body.search || req.query.query || "",
            city: body.city || req.query.city || "",
            category: body.category || req.query.category || "all"
        };

        logInfo(`Filtro eventi POST: ${JSON.stringify(filters)}`);

        const rawEvents = filterAllEvents(filters);
        const events = rawEvents.map(normalizeEvent);

        return res.json({
            ok: true,
            count: events.length,
            events: events
        });
    } catch (err) {
        logError("Errore nel filtraggio eventi POST: " + err.message);
        return res.status(500).json({ ok: false, message: "Errore durante il filtraggio degli eventi." });
    }
}

/**
 * Controller per la creazione di un nuovo evento.
 */
function createEvent(req, res) {
    try {
        const eventData = req.body || {};
        if (!eventData.title || !eventData.venue) {
            return res.status(400).json({
                ok: false,
                message: "Titolo e locale sono campi obbligatori."
            });
        }

        logInfo(`Creazione nuovo evento: ${eventData.title} presso ${eventData.venue}`);

        const created = addEvent(eventData);
        const normalized = normalizeEvent(created);

        return res.status(201).json({
            ok: true,
            message: "Evento creato con successo!",
            event: normalized,
            totalCount: getAllEvents().length
        });
    } catch (err) {
        logError("Errore creazione evento: " + err.message);
        return res.status(500).json({ ok: false, message: "Errore nella creazione dell'evento." });
    }
}

/**
 * Controller GET per ottenere i dettagli di un singolo evento tramite ID.
 */
function getEventById(req, res) {
    try {
        const eventId = req.params.id;
        const rawEvent = findEventById(eventId);

        if (!rawEvent) {
            return res.status(404).json({ ok: false, message: "Evento non trovato." });
        }

        return res.json({
            ok: true,
            event: normalizeEvent(rawEvent)
        });
    } catch (err) {
        logError("Errore nel recupero del singolo evento: " + err.message);
        return res.status(500).json({ ok: false, message: "Errore interno del server." });
    }
}

module.exports = {
    getMapsConfig,
    getEvents,
    filterEvents,
    createEvent,
    getEventById,
    // Alias per compatibilità
    mapsController: filterEvents
};
