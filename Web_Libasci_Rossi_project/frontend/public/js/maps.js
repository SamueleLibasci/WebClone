/**
 * maps.js
 *
 * Logica client-side per la pagina Mappa (map.html).
 * - Richiede al server la configurazione pubblica (chiave Google Maps) via GET /api/maps/config (o /api/config).
 * - Tenta l'inizializzazione dell'SDK Google Maps (con gestione di gm_authFailure / billing).
 * - Attiva automaticamente il motore di mapping geografico Leaflet con tile dark qualora
 *   l'account Google Cloud non abbia abilitata la fatturazione o la chiave sia limitata.
 * - Inizializza la mappa centrata sull'Italia (lat: 42.5, lng: 12.5).
 * - Carica e visualizza i marker degli eventi con popup interattivi.
 * - Gestisce il filtraggio dinamico dei marker per categoria (Tutti, Concerti, Club, Aperitivi).
 * - Gestisce il pulsante per centrare la mappa sulla posizione geografica dell'utente.
 */

var MAP_CENTER = { lat: 42.5, lng: 12.5 };
var MAP_ZOOM = 6;
var mapInstance = null; // Google Maps Map o Leaflet Map
var isLeafletEngine = false;
var activeMarkers = [];
var currentInfoWindow = null;
var userMarker = null;

// Determina il prefisso corretto (/api/v1 se instradato dal Gateway, oppure vuoto)
var apiPrefix = window.location.pathname.startsWith("/api/v1") ? "/api/v1" : "";

var darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#141722" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#141722" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8b93a7" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#dbe2ef" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e2433" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#171a25" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0b0e14" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4f586d" }] }
];

/**
 * Intercetta l'errore di autenticazione o fatturazione di Google Maps.
 */
window.gm_authFailure = function () {
    console.warn("[Stasera Map] Google Maps API: errore di autenticazione o billing non abilitato. Attivazione fallback geografico interattivo...");
    initLeafletMap();
};

/**
 * Callback globale per Google Maps.
 */
window.initMap = async function () {
    var mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    try {
        if (window.google && google.maps) {
            mapInstance = new google.maps.Map(mapContainer, {
                center: MAP_CENTER,
                zoom: MAP_ZOOM,
                styles: darkMapStyles,
                mapTypeControl: false,
                streetViewControl: false
            });

            currentInfoWindow = new google.maps.InfoWindow();
            isLeafletEngine = false;

            await loadEvents("all");
            setupCategoryFilters();
            setupUserLocationButton();
        } else {
            initLeafletMap();
        }
    } catch (err) {
        console.warn("[Stasera Map] Errore avvio Google Maps, fallback a Leaflet:", err);
        initLeafletMap();
    }
};

/**
 * Inizializza il motore Leaflet con dark tiles (CartoDB Dark Matter).
 */
function initLeafletMap() {
    var mapContainer = document.getElementById("map");
    if (!mapContainer || !window.L) return;

    // Se esiste già una mappa precedente, puliscila
    if (mapInstance && typeof mapInstance.remove === "function") {
        mapInstance.remove();
    }
    mapContainer.innerHTML = "";

    isLeafletEngine = true;
    mapInstance = L.map(mapContainer, {
        center: [MAP_CENTER.lat, MAP_CENTER.lng],
        zoom: MAP_ZOOM,
        zoomControl: true
    });

    // Dark map tiles da CartoDB (senza necessità di API key con billing)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: "abcd",
        maxZoom: 19
    }).addTo(mapInstance);

    loadEvents("all");
    setupCategoryFilters();
    setupUserLocationButton();
}

/**
 * Rimuove i marker attualmente visibili dalla mappa.
 */
function clearMarkers() {
    if (isLeafletEngine) {
        activeMarkers.forEach(function (m) {
            if (mapInstance && m.remove) m.remove();
        });
    } else {
        activeMarkers.forEach(function (m) {
            if (m.setMap) m.setMap(null);
        });
    }
    activeMarkers = [];
}

/**
 * Scarica gli eventi dal backend e aggiunge i rispettivi marker sulla mappa.
 */
async function loadEvents(category) {
    if (!mapInstance) return;
    clearMarkers();

    try {
        var url = apiPrefix + "/api/maps/events";
        if (category && category !== "all") {
            url += "?category=" + encodeURIComponent(category);
        }

        var res = await fetch(url);
        var data = await res.json();

        if (!data.ok || !Array.isArray(data.events)) {
            console.warn("[Stasera Map] Nessun evento ricevuto dal server:", data);
            return;
        }

        if (isLeafletEngine) {
            renderLeafletMarkers(data.events);
        } else {
            renderGoogleMarkers(data.events);
        }

    } catch (err) {
        console.error("[Stasera Map] Errore durante il recupero degli eventi:", err);
    }
}

/**
 * Rendering marker con motore Leaflet.
 */
function renderLeafletMarkers(eventsList) {
    var latLngs = [];

    eventsList.forEach(function (ev) {
        if (!ev.location || typeof ev.location.lat !== "number" || typeof ev.location.lng !== "number") {
            return;
        }

        var letter = ev.letter || (ev.venue ? ev.venue.charAt(0).toUpperCase() : "E");

        var pinIcon = L.divIcon({
            className: "custom-map-pin",
            html: `<span>${letter}</span>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -18]
        });

        var marker = L.marker([ev.location.lat, ev.location.lng], { icon: pinIcon }).addTo(mapInstance);

        var popupContent = `
            <div style="font-family: inherit; max-width: 260px;">
                <span style="display: inline-block; font-size: 10px; font-weight: bold; text-transform: uppercase; padding: 2px 8px; border-radius: 9999px; background: rgba(212, 255, 50, 0.12); color: #d4ff32; border: 1px solid rgba(212, 255, 50, 0.25); margin-bottom: 6px;">
                    ${escapeHtml(ev.zone || 'Centro')}
                </span>
                <h4 style="margin: 4px 0 6px 0; font-size: 15px; color: #ffffff; font-weight: 700;">${escapeHtml(ev.title)}</h4>
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #8b93a7;">
                    <strong style="color: #cbd5e1;">Locale:</strong> ${escapeHtml(ev.venue)} (${escapeHtml(ev.city)})<br>
                    <strong style="color: #cbd5e1;">Indirizzo:</strong> ${escapeHtml(ev.address || ev.city)}
                </p>
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #a4adc3;">
                    🗓 ${escapeHtml(ev.timeBadge || '')} ${escapeHtml(ev.time || '')}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #283044; padding-top: 6px;">
                    <span style="font-size: 12.5px; font-weight: bold; color: #d4ff32;">${escapeHtml(ev.price || 'Gratuito')}</span>
                    <span style="font-size: 11px; color: #8b93a7;">${escapeHtml(ev.genre || '')}</span>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
        activeMarkers.push(marker);
        latLngs.push([ev.location.lat, ev.location.lng]);
    });

    if (latLngs.length > 1) {
        mapInstance.fitBounds(latLngs, { padding: [40, 40] });
    }
}

/**
 * Rendering marker con motore Google Maps.
 */
function renderGoogleMarkers(eventsList) {
    var bounds = new google.maps.LatLngBounds();

    eventsList.forEach(function (ev) {
        if (!ev.location || typeof ev.location.lat !== "number" || typeof ev.location.lng !== "number") {
            return;
        }

        var marker = new google.maps.Marker({
            position: { lat: ev.location.lat, lng: ev.location.lng },
            map: mapInstance,
            title: ev.title
        });

        var contentString = `
            <div style="font-family: sans-serif; padding: 6px 8px; max-width: 250px; color: #111;">
                <span style="display: inline-block; font-size: 10px; font-weight: bold; text-transform: uppercase; padding: 2px 8px; border-radius: 12px; background: #0d1017; color: #d4ff32; margin-bottom: 6px;">
                    ${ev.categoryLabel || ev.category || 'Evento'}
                </span>
                <h4 style="margin: 4px 0 6px 0; font-size: 15px; color: #111;">${escapeHtml(ev.title)}</h4>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #555;">
                    <strong>Locale:</strong> ${escapeHtml(ev.venue)} (${escapeHtml(ev.city)})<br>
                    <strong>Indirizzo:</strong> ${escapeHtml(ev.address || ev.city)}
                </p>
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #222; font-weight: 600;">
                    🗓 ${escapeHtml(ev.timeBadge || '')} ${escapeHtml(ev.time || '')}
                </p>
                <p style="margin: 0; font-size: 12px; font-weight: bold; color: #15803d;">
                    ${escapeHtml(ev.price || 'Gratuito')}
                </p>
            </div>
        `;

        marker.addListener("click", function () {
            currentInfoWindow.setContent(contentString);
            currentInfoWindow.open(mapInstance, marker);
        });

        activeMarkers.push(marker);
        bounds.extend(marker.getPosition());
    });

    if (activeMarkers.length > 1) {
        mapInstance.fitBounds(bounds);
    }
}

/**
 * Imposta gli event listener per i pulsanti di filtro categoria.
 */
function setupCategoryFilters() {
    var buttons = document.querySelectorAll(".map-filter-btn:not(#btn-user-location)");
    buttons.forEach(function (btn) {
        btn.onclick = function () {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            var category = btn.getAttribute("data-category");
            if (!category) {
                var text = btn.textContent.toLowerCase();
                if (text.includes("concerti") || text.includes("musica")) category = "concerti";
                else if (text.includes("club") || text.includes("dj")) category = "club";
                else if (text.includes("aperitivi")) category = "aperitivi";
                else category = "all";
            }

            loadEvents(category);
        };
    });
}

/**
 * Configura il pulsante per rilevare la posizione geografica dell'utente e centrare la mappa.
 */
function setupUserLocationButton() {
    var locBtn = document.getElementById("btn-user-location");
    if (!locBtn) return;

    if (!navigator.geolocation) {
        locBtn.style.display = "none";
        return;
    }

    locBtn.onclick = function () {
        locBtn.textContent = "Rilevamento...";
        navigator.geolocation.getCurrentPosition(
            function (position) {
                locBtn.textContent = "Centra sulla mia posizione";
                var userPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                if (isLeafletEngine && mapInstance) {
                    mapInstance.setView([userPos.lat, userPos.lng], 13);
                    if (userMarker) {
                        userMarker.setLatLng([userPos.lat, userPos.lng]);
                    } else {
                        var userIcon = L.divIcon({
                            className: "custom-map-pin",
                            html: `<span>📍</span>`,
                            iconSize: [36, 36],
                            iconAnchor: [18, 18]
                        });
                        userMarker = L.marker([userPos.lat, userPos.lng], { icon: userIcon }).addTo(mapInstance);
                    }
                    userMarker.bindPopup(`<strong style="color: #d4ff32;">📍 La tua posizione attuale</strong>`).openPopup();
                } else if (mapInstance && window.google) {
                    mapInstance.setCenter(userPos);
                    mapInstance.setZoom(13);
                    if (userMarker) {
                        userMarker.setPosition(userPos);
                    } else {
                        userMarker = new google.maps.Marker({
                            position: userPos,
                            map: mapInstance,
                            title: "La tua posizione"
                        });
                    }
                    currentInfoWindow.setContent(`<div style="padding: 4px;"><h4>📍 La tua posizione attuale</h4></div>`);
                    currentInfoWindow.open(mapInstance, userMarker);
                }
            },
            function (err) {
                locBtn.textContent = "Centra sulla mia posizione";
                alert("Impossibile determinare la posizione geografica.");
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };
}

/**
 * Sanitizza caratteri speciali HTML.
 */
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Carica dinamicamente lo script delle Google Maps API con timeout di sicurezza.
 */
function loadGoogleMaps(apiKey) {
    if (window.google && window.google.maps) {
        window.initMap();
        return;
    }

    var timeoutTimer = setTimeout(function () {
        if (!mapInstance) {
            console.warn("[Stasera Map] Timeout Google Maps API, caricamento mappa geografica...");
            initLeafletMap();
        }
    }, 2500);

    var script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(apiKey) + "&callback=initMap";
    script.async = true;
    script.defer = true;
    script.onerror = function () {
        clearTimeout(timeoutTimer);
        console.warn("[Stasera Map] Errore di rete Google Maps, caricamento Leaflet...");
        initLeafletMap();
    };
    document.head.appendChild(script);
}

// Avvio: recupero configurazione dal backend
fetch(apiPrefix + "/api/maps/config")
    .then(function (res) {
        if (!res.ok) throw new Error("Status " + res.status);
        return res.json();
    })
    .catch(function () {
        return fetch(apiPrefix + "/api/config").then(res => res.json());
    })
    .then(function (data) {
        if (data && data.ok && data.mapsApiKey) {
            loadGoogleMaps(data.mapsApiKey);
        } else {
            initLeafletMap();
        }
    })
    .catch(function () {
        initLeafletMap();
    });
