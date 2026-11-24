const express = require("express");
const path = require("path");
const paths = require("../../config/paths");   // Importa i percorsi principali del progetto.

const router = express.Router();

/**
 * Route GET per servire le pagine HTML statiche del frontend.
 * I file inviati si trovano nella cartella frontend/public.
 */
router.get("/", (req, res) => {
    res.sendFile(path.join(paths.PUBLIC, "index.html")); // Invia index.html al browser.
});

router.get("/login", (req, res) => {
    res.sendFile(path.join(paths.PUBLIC, "login.html")); // Invia login.html al browser.
});

router.get("/signup", (req, res) => {
    res.sendFile(path.join(paths.PUBLIC, "signup.html")); // Invia signup.html al browser.
});

router.get("/about", (req, res) => {
    res.sendFile(path.join(paths.PUBLIC, "about.html")); // Invia about.html al browser.
});

router.get("/contact", (req, res) => {
    res.sendFile(path.join(paths.PUBLIC, "contact.html")); // Invia contact.html al browser.
});

router.get("/map", (req, res) => {
    res.sendFile(path.join(paths.PUBLIC, "map.html")); // Invia map.html al browser.
});

module.exports = router;
