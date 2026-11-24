/**
 * navbar.js
 *
 * Responsabilità:
 * 1. Carica il componente navbar.html nel contenitore #navbar della pagina corrente.
 * 2. Adatta i percorsi dei link interni se l'applicazione è servita tramite Gateway (/api/v1).
 * 3. Interroga l'endpoint /auth/me per verificare se l'utente ha una sessione attiva.
 * 4. Se autenticato, mostra il messaggio di benvenuto con il nome e il pulsante Esci,
 *    nascondendo il pulsante Accedi.
 * 5. Gestisce il click sul pulsante Esci effettuando una chiamata POST a /auth/logout.
 * 6. Gestisce il click sul pulsante "Aggiungi evento".
 */

function initNavbar() {
    var apiPrefix = window.location.pathname.startsWith("/api/v1") ? "/api/v1" : "";

    // Se siamo sotto il prefisso /api/v1, aggiorna i link interni della navbar
    if (apiPrefix) {
        var links = document.querySelectorAll(".navbar a");
        links.forEach(function (a) {
            var href = a.getAttribute("href");
            if (href && href.startsWith("/") && !href.startsWith("/api/v1")) {
                a.setAttribute("href", apiPrefix + href);
            }
        });
    }

    // Evidenzia link corrente
    var currentPath = window.location.pathname.replace(/^\/api\/v1/, "") || "/";
    document.querySelectorAll(".nav-link-item").forEach(function (link) {
        var href = link.getAttribute("href").replace(/^\/api\/v1/, "") || "/";
        if (href === currentPath || (currentPath === "/index.html" && href === "/")) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    var navLogin = document.getElementById("nav-login");
    var navUser = document.getElementById("nav-user");
    var navWelcome = document.getElementById("nav-welcome");
    var logoutButton = document.getElementById("btn-logout");
    var btnAddEvent = document.getElementById("btn-open-add-event");

    // Verifica stato sessione utente
    fetch(apiPrefix + "/auth/me")
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.ok && data.user) {
                if (navLogin) navLogin.style.display = "none";
                if (navUser) {
                    navUser.style.display = "flex";
                }
                if (navWelcome) {
                    navWelcome.textContent = "Ciao, " + (data.user.name || data.user.displayName || "Utente");
                }
            } else {
                if (navLogin) navLogin.style.display = "inline-block";
                if (navUser) navUser.style.display = "none";
            }
        })
        .catch(function () {
            if (navLogin) navLogin.style.display = "inline-block";
            if (navUser) navUser.style.display = "none";
        });

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            fetch(apiPrefix + "/auth/logout", { method: "POST" })
                .then(function () {
                    window.location.href = apiPrefix + "/";
                });
        });
    }

    if (btnAddEvent) {
        btnAddEvent.addEventListener("click", function () {
            var modal = document.getElementById("modal-add-event");
            if (modal) {
                modal.classList.add("modal--visible");
                modal.style.display = "flex";
                var firstInput = modal.querySelector("input");
                if (firstInput) firstInput.focus();
            } else {
                window.location.href = apiPrefix + "/?action=add-event";
            }
        });
    }
}
