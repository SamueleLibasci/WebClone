/**
 * maps.js
 * Router per le funzionalità Google Maps ed eventi geolocalizzati.
 */

const express = require("express");
const {
    getMapsConfig,
    getEvents,
    filterEvents,
    createEvent,
    getEventById
} = require("../controllers/mapsController");

const router = express.Router();

/**
 * Route GET per la configurazione pubblica di Google Maps (API Key).
 */
router.get("/api/maps/config", getMapsConfig);
router.get("/api/config", getMapsConfig); // Compatibilità con chiamate esistenti del frontend

/**
 * Route GET / POST per il recupero e filtraggio degli eventi sulla mappa.
 */
router.get("/api/maps/events", getEvents);
router.post("/api/maps/events", filterEvents);
router.post("/maps", filterEvents); // Pattern POST analogo a /weather in EsercizioNode

/**
 * Route POST per la creazione di un nuovo evento.
 */
router.post("/api/maps/events/create", createEvent);
router.post("/api/events", createEvent);

/**
 * Route GET per il singolo evento tramite ID.
 */
router.get("/api/maps/events/:id", getEventById);

module.exports = router;
