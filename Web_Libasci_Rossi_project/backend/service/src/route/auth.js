const express = require("express");
const { googleLogin, me, logout } = require("../controllers/authController"); // Importa i controller dell'autenticazione Google.

const router = express.Router();

/**
 * Route POST per il login con Google OAuth.
 * Riceve il token JWT dal browser e delega la logica ad authController.
 */
router.post("/auth/google", googleLogin);

/**
 * Route GET per sapere chi è collegato.
 * Interroga la sessione e restituisce l'utente corrente.
 */
router.get("/auth/me", me);

/**
 * Route POST per il logout.
 * Distrugge la sessione corrente lato server.
 */
router.post("/auth/logout", logout);

module.exports = router;
