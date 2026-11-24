/**
 * index.js
 * Logica client-side interattiva della Home Page di "Stasera".
 *
 * Responsabilità:
 * 1. Recupera gli eventi dal backend tramite API REST (/api/maps/events).
 * 2. Esegue il rendering reattivo delle schede evento secondo il design dark & lime del mockup.
 * 3. Gestisce l'interattività di tutti i filtri:
 *    - Filtri temporali: Oggi, Domani, Weekend, Tutti
 *    - Dropdown: Tutte le zone, Tutti i generi, Tutti i tipi
 *    - Ricerca testuale per città, provincia o regione
 *    - Pulsante "Usa la mia posizione" (geolocalizzazione browser)
 *    - Pulsante "Azzera" filtri
 * 4. Gestisce lo switch vista tra "Lista" e "Mappa" interattiva a doppio motore (Google Maps + fallback Leaflet dark).
 * 5. Gestisce l'interazione delle card:
 *    - Preferiti (heart toggle con salvataggio in localStorage)
 *    - Anteprima audio con sintetizzatore Web Audio API e toast
 *    - Modale dettagli evento completi
 * 6. Gestisce la modale di creazione "Aggiungi evento" con salvataggio POST su backend.
 */

(function () {
    // Determina prefisso /api/v1 (se instradato da API Gateway) o vuoto
    var apiPrefix = window.location.pathname.startsWith("/api/v1") ? "/api/v1" : "";

    var MAP_CENTER = { lat: 42.5, lng: 12.5 };
    var MAP_ZOOM = 6;

    // Stato locale dei filtri attivi
    var filterState = {
        dateFilter: "all",
        zone: "all",
        genre: "all",
        type: "all",
        query: ""
    };

    var currentEvents = [];
    var mapInstance = null; // Google Maps Map o Leaflet Map
    var isLeafletEngine = false;
    var mapMarkers = [];
    var mapInfoWindow = null;
    var userPosition = null;
    var userMapMarker = null;

    // Preferiti salvati in localStorage
    var favorites = (function () {
        try {
            return JSON.parse(localStorage.getItem("stasera_favorites") || "[]");
        } catch (e) {
            return [];
        }
    })();

    // Elementi DOM
    var gridEl = document.getElementById("events-grid");
    var countTextEl = document.getElementById("events-count-text");
    var selectZoneEl = document.getElementById("select-zone");
    var selectGenreEl = document.getElementById("select-genre");
    var selectTypeEl = document.getElementById("select-type");
    var inputSearchEl = document.getElementById("input-search");
    var btnUserLocEl = document.getElementById("btn-user-location");
    var btnResetEl = document.getElementById("btn-reset-filters");
    var btnViewList = document.getElementById("btn-view-list");
    var btnViewMap = document.getElementById("btn-view-map");
    var viewListSec = document.getElementById("events-view-list");
    var viewMapSec = document.getElementById("events-view-map");

    // Modali
    var modalAdd = document.getElementById("modal-add-event");
    var formAdd = document.getElementById("form-add-event");
    var btnCloseAdd = document.getElementById("btn-close-modal-add");
    var btnCancelAdd = document.getElementById("btn-cancel-add");

    var modalDetails = document.getElementById("modal-details");
    var modalDetailsBody = document.getElementById("modal-details-body");
    var btnCloseDetails = document.getElementById("btn-close-modal-details");

    // Toast
    var audioToast = document.getElementById("audio-preview-toast");
    var btnCloseAudio = document.getElementById("btn-close-audio");
    var toastNotification = document.getElementById("toast-notification");

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
     * Intercetta errore auth / billing di Google Maps per passare a Leaflet senza errori visivi.
     */
    window.gm_authFailure = function () {
        console.warn("[Stasera Home] Google Maps API: auth failure / billing non abilitato. Attivazione mappa Leaflet Dark...");
        initHomeLeafletMap();
    };

    /**
     * Mostra una notifica toast temporanea.
     */
    function showToast(message, duration) {
        if (!toastNotification) return;
        toastNotification.textContent = message;
        toastNotification.style.display = "block";
        setTimeout(function () {
            toastNotification.style.display = "none";
        }, duration || 2500);
    }

    /**
     * Costruisce l'URL di query con i parametri attuali dei filtri.
     */
    function buildEventsUrl() {
        var params = new URLSearchParams();
        if (filterState.dateFilter && filterState.dateFilter !== "all") {
            params.append("dateFilter", filterState.dateFilter);
        }
        if (filterState.zone && filterState.zone !== "all") {
            params.append("zone", filterState.zone);
        }
        if (filterState.genre && filterState.genre !== "all") {
            params.append("genre", filterState.genre);
        }
        if (filterState.type && filterState.type !== "all") {
            params.append("type", filterState.type);
        }
        if (filterState.query && filterState.query.trim().length > 0) {
            params.append("query", filterState.query.trim());
        }
        var queryString = params.toString();
        return apiPrefix + "/api/maps/events" + (queryString ? "?" + queryString : "");
    }

    /**
     * Scarica gli eventi dal backend e aggiorna sia la griglia che la mappa.
     */
    async function fetchAndRenderEvents() {
        try {
            var url = buildEventsUrl();
            var res = await fetch(url);
            var data = await res.json();

            if (data.ok && Array.isArray(data.events)) {
                currentEvents = data.events;
                renderCards(currentEvents);
                updateCount(currentEvents.length);
                updateMapMarkers(currentEvents);
            } else {
                renderCards([]);
                updateCount(0);
                updateMapMarkers([]);
            }
        } catch (err) {
            console.error("[Stasera Home] Errore recupero eventi:", err);
            showToast("Errore di connessione al server.");
        }
    }

    /**
     * Aggiorna il testo del contatore (es. "10 eventi in programma").
     */
    function updateCount(count) {
        if (!countTextEl) return;
        if (count === 0) {
            countTextEl.textContent = "Nessun evento in programma per questi filtri";
        } else if (count === 1) {
            countTextEl.textContent = "1 evento in programma";
        } else {
            countTextEl.textContent = count + " eventi in programma";
        }
    }

    /**
     * Renderizza le card degli eventi nella griglia.
     */
    function renderCards(eventsList) {
        if (!gridEl) return;
        gridEl.innerHTML = "";

        if (eventsList.length === 0) {
            var noResults = document.createElement("div");
            noResults.className = "no-results-box";
            noResults.innerHTML = `
                <h4>Nessun evento trovato</h4>
                <p>Nessun evento corrisponde ai criteri selezionati. Prova ad azzerare i filtri.</p>
                <button type="button" class="action-pill-btn" id="btn-empty-reset">Reimposta filtri</button>
            `;
            gridEl.appendChild(noResults);
            var emptyReset = document.getElementById("btn-empty-reset");
            if (emptyReset) {
                emptyReset.addEventListener("click", resetAllFilters);
            }
            return;
        }

        eventsList.forEach(function (ev) {
            var card = createCardElement(ev);
            gridEl.appendChild(card);
        });
    }

    /**
     * Crea il nodo DOM di una singola card evento.
     */
    function createCardElement(ev) {
        var card = document.createElement("article");
        card.className = "event-card";
        card.setAttribute("data-id", ev.id);

        var isFav = favorites.includes(ev.id);
        var letter = ev.letter || (ev.venue ? ev.venue.charAt(0).toUpperCase() : "E");
        var gradient = ev.gradient || "linear-gradient(135deg, #2b3d18 0%, #445922 50%, #2f3d17 100%)";

        var badgeText = ev.timeBadge || "oggi";
        var isLimeBadge = badgeText.includes("min") || badgeText.includes("h") || badgeText.includes("stasera");
        var badgeClass = isLimeBadge ? "card-time-badge badge-lime" : "card-time-badge badge-gray";

        var priceClass = (ev.price && ev.price.toLowerCase().includes("gratuito")) ? "card-price price-free" : "card-price price-regular";

        card.innerHTML = `
            <div class="card-banner" style="background: ${gradient};">
                <span class="card-banner-letter">${letter}</span>
                <button type="button" class="btn-card-favorite ${isFav ? 'is-favorite' : ''}" data-id="${ev.id}" title="Aggiungi ai preferiti" aria-label="Aggiungi ai preferiti">
                    ${isFav ? '♥' : '♡'}
                </button>
            </div>
            <div class="card-body">
                <div class="card-time-row">
                    <span class="${badgeClass}">${badgeText}</span>
                    <span class="card-time-text">${ev.time || ''}</span>
                </div>
                <div class="card-venue">${escapeHtml(ev.venue)}</div>
                <h3 class="card-title">${escapeHtml(ev.title)}</h3>
                <p class="card-description">${escapeHtml(ev.description)}</p>
                <div class="card-tags-row">
                    <span class="tag-zone">${escapeHtml(ev.zone || 'Centro')}</span>
                    <span class="tag-meta">${escapeHtml(ev.genre || 'Vario / Misto')}</span>
                    <span class="tag-meta">•</span>
                    <span class="tag-meta">${escapeHtml(ev.type || 'Aperitivo')}</span>
                </div>
                <div class="card-footer">
                    <span class="${priceClass}">${escapeHtml(ev.price || 'Gratuito')}</span>
                    <div class="card-actions">
                        <button type="button" class="btn-card-audio" data-id="${ev.id}" title="Ascolta anteprima atmosfera" aria-label="Ascolta anteprima audio">♪</button>
                        <button type="button" class="btn-card-details" data-id="${ev.id}">Dettagli</button>
                    </div>
                </div>
            </div>
        `;

        // Event listener: Toggle Preferito
        var btnFav = card.querySelector(".btn-card-favorite");
        btnFav.addEventListener("click", function (e) {
            e.stopPropagation();
            toggleFavorite(ev.id, btnFav);
        });

        // Event listener: Anteprima Audio
        var btnAudio = card.querySelector(".btn-card-audio");
        btnAudio.addEventListener("click", function (e) {
            e.stopPropagation();
            playAudioPreview(ev);
        });

        // Event listener: Dettagli Evento
        var btnDetails = card.querySelector(".btn-card-details");
        btnDetails.addEventListener("click", function (e) {
            e.stopPropagation();
            openEventDetails(ev);
        });

        return card;
    }

    /**
     * Sanitizzazione stringhe HTML contro XSS.
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
     * Gestione toggle preferiti con persistenza in localStorage.
     */
    function toggleFavorite(id, btnElement) {
        var index = favorites.indexOf(id);
        if (index > -1) {
            favorites.splice(index, 1);
            btnElement.classList.remove("is-favorite");
            btnElement.innerHTML = "♡";
            showToast("Rimosso dai preferiti");
        } else {
            favorites.push(id);
            btnElement.classList.add("is-favorite");
            btnElement.innerHTML = "♥";
            showToast("Aggiunto ai preferiti ♥");
        }
        try {
            localStorage.setItem("stasera_favorites", JSON.stringify(favorites));
        } catch (e) {}
    }

    /**
     * Anteprima audio sintetica tramite Web Audio API + visualizzazione toast.
     */
    function playAudioPreview(ev) {
        try {
            var AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                var ctx = new AudioContext();
                var freqs = [220, 277.18, 329.63, 440];
                if (ev.genre && ev.genre.includes("Techno")) {
                    freqs = [110, 164.81, 220, 110];
                } else if (ev.genre && ev.genre.includes("Jazz")) {
                    freqs = [261.63, 329.63, 392, 493.88];
                }

                freqs.forEach(function (f, i) {
                    var osc = ctx.createOscillator();
                    var gain = ctx.createGain();
                    osc.type = i % 2 === 0 ? "sine" : "triangle";
                    osc.frequency.setValueAtTime(f, ctx.currentTime);
                    gain.gain.setValueAtTime(0.08, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + (i * 0.1));
                    osc.stop(ctx.currentTime + 1.8);
                });
            }
        } catch (e) {}

        if (audioToast) {
            document.getElementById("audio-toast-title").textContent = ev.title;
            document.getElementById("audio-toast-genre").textContent = "Atmosfera " + (ev.genre || "Musicale") + " • " + ev.venue;
            audioToast.style.display = "flex";
            setTimeout(function () {
                if (audioToast) audioToast.style.display = "none";
            }, 3500);
        }
    }

    if (btnCloseAudio) {
        btnCloseAudio.addEventListener("click", function () {
            audioToast.style.display = "none";
        });
    }

    /**
     * Apre la modale dei dettagli dell'evento.
     */
    function openEventDetails(ev) {
        if (!modalDetails || !modalDetailsBody) return;
        var letter = ev.letter || (ev.venue ? ev.venue.charAt(0).toUpperCase() : "E");
        var gradient = ev.gradient || "linear-gradient(135deg, #2b3d18 0%, #445922 50%, #2f3d17 100%)";

        modalDetailsBody.innerHTML = `
            <div class="details-banner" style="background: ${gradient};">
                <span class="details-banner-letter">${letter}</span>
            </div>
            <h2 style="font-size: 22px; color: #fff; margin-bottom: 6px;">${escapeHtml(ev.title)}</h2>
            <p style="color: #8b93a7; font-size: 14px; margin-bottom: 16px;">📍 ${escapeHtml(ev.venue)} — ${escapeHtml(ev.address || ev.city)}</p>

            <div class="details-meta-grid">
                <div class="details-meta-item">
                    <strong>Giorno & Orario</strong>
                    <span>${escapeHtml(ev.timeBadge)} ${escapeHtml(ev.time)}</span>
                </div>
                <div class="details-meta-item">
                    <strong>Ingresso</strong>
                    <span style="color: #d4ff32;">${escapeHtml(ev.price)}</span>
                </div>
                <div class="details-meta-item">
                    <strong>Zona</strong>
                    <span>${escapeHtml(ev.zone)}</span>
                </div>
                <div class="details-meta-item">
                    <strong>Genere / Tipologia</strong>
                    <span>${escapeHtml(ev.genre)} (${escapeHtml(ev.type)})</span>
                </div>
            </div>

            <h4 class="details-desc-title">Descrizione completa</h4>
            <p class="details-desc-text">${escapeHtml(ev.description)}</p>

            <button type="button" class="details-btn-map" id="btn-detail-switch-map">
                Visualizza sulla Mappa 📍
            </button>
        `;

        modalDetails.style.display = "flex";

        var btnSwitchMap = document.getElementById("btn-detail-switch-map");
        if (btnSwitchMap) {
            btnSwitchMap.addEventListener("click", function () {
                modalDetails.style.display = "none";
                switchToMapView();
                if (ev.location && ev.location.lat) {
                    centerMapOnLocation(ev.location.lat, ev.location.lng, ev);
                }
            });
        }
    }

    if (btnCloseDetails) {
        btnCloseDetails.addEventListener("click", function () {
            modalDetails.style.display = "none";
        });
    }

    if (modalDetails) {
        modalDetails.addEventListener("click", function (e) {
            if (e.target === modalDetails) modalDetails.style.display = "none";
        });
    }

    /**
     * Switch vista: Lista
     */
    function switchToListView() {
        if (btnViewList) btnViewList.classList.add("active");
        if (btnViewMap) btnViewMap.classList.remove("active");
        if (viewListSec) viewListSec.style.display = "block";
        if (viewMapSec) viewMapSec.style.display = "none";
    }

    /**
     * Switch vista: Mappa
     */
    function switchToMapView() {
        if (btnViewMap) btnViewMap.classList.add("active");
        if (btnViewList) btnViewList.classList.remove("active");
        if (viewListSec) viewListSec.style.display = "none";
        if (viewMapSec) viewMapSec.style.display = "block";

        if (!mapInstance) {
            initHomeMap();
        } else {
            setTimeout(function () {
                if (isLeafletEngine && mapInstance && mapInstance.invalidateSize) {
                    mapInstance.invalidateSize();
                } else if (window.google && google.maps && google.maps.event) {
                    google.maps.event.trigger(mapInstance, "resize");
                }
            }, 100);
        }
    }

    if (btnViewList) btnViewList.addEventListener("click", switchToListView);
    if (btnViewMap) btnViewMap.addEventListener("click", switchToMapView);

    /**
     * Centra la mappa su un punto specifico ed apre il popup associato.
     */
    function centerMapOnLocation(lat, lng, ev) {
        if (isLeafletEngine && mapInstance) {
            mapInstance.setView([lat, lng], 14);
            var targetMarker = mapMarkers.find(function (m) {
                var pos = m.getLatLng();
                return Math.abs(pos.lat - lat) < 0.001 && Math.abs(pos.lng - lng) < 0.001;
            });
            if (targetMarker && targetMarker.openPopup) {
                targetMarker.openPopup();
            }
        } else if (mapInstance && window.google) {
            mapInstance.setCenter({ lat: lat, lng: lng });
            mapInstance.setZoom(14);
        }
    }

    /**
     * Inizializzazione Mappa nella Home.
     */
    async function initHomeMap() {
        var mapContainer = document.getElementById("map");
        if (!mapContainer) return;

        try {
            var configRes = await fetch(apiPrefix + "/api/maps/config")
                .then(r => r.json())
                .catch(() => fetch(apiPrefix + "/api/config").then(r => r.json()));

            var apiKey = configRes && configRes.mapsApiKey;

            if (apiKey) {
                loadGoogleMapsApi(apiKey);
            } else {
                initHomeLeafletMap();
            }
        } catch (err) {
            console.warn("[Stasera Home] Errore configurazione mappa, avvio Leaflet:", err);
            initHomeLeafletMap();
        }
    }

    /**
     * Inizializza il motore Leaflet per la home.
     */
    function initHomeLeafletMap() {
        var mapContainer = document.getElementById("map");
        if (!mapContainer || !window.L) return;

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

        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution: '&copy; CARTO &copy; OpenStreetMap',
            subdomains: "abcd",
            maxZoom: 19
        }).addTo(mapInstance);

        updateMapMarkers(currentEvents);

        setTimeout(function () {
            if (mapInstance && mapInstance.invalidateSize) {
                mapInstance.invalidateSize();
            }
        }, 150);
    }

    /**
     * Carica script Google Maps con callback e timeout protettivo.
     */
    function loadGoogleMapsApi(apiKey) {
        if (window.google && window.google.maps) {
            createGoogleMapInstance();
            return;
        }

        var safetyTimer = setTimeout(function () {
            if (!mapInstance) {
                console.warn("[Stasera Home] Timeout Google Maps API, caricamento Leaflet...");
                initHomeLeafletMap();
            }
        }, 2500);

        window.__initGoogleHomeMap = function () {
            clearTimeout(safetyTimer);
            createGoogleMapInstance();
        };

        var script = document.createElement("script");
        script.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(apiKey) + "&callback=__initGoogleHomeMap";
        script.async = true;
        script.defer = true;
        script.onerror = function () {
            clearTimeout(safetyTimer);
            console.warn("[Stasera Home] Errore di rete Google Maps, avvio Leaflet...");
            initHomeLeafletMap();
        };
        document.head.appendChild(script);
    }

    /**
     * Istanzia Google Map con dark style coordinato.
     */
    function createGoogleMapInstance() {
        var mapContainer = document.getElementById("map");
        if (!mapContainer || !window.google || !google.maps) return;

        mapContainer.innerHTML = "";
        isLeafletEngine = false;

        mapInstance = new google.maps.Map(mapContainer, {
            center: MAP_CENTER,
            zoom: MAP_ZOOM,
            styles: darkMapStyles,
            mapTypeControl: false,
            streetViewControl: false
        });

        mapInfoWindow = new google.maps.InfoWindow();
        updateMapMarkers(currentEvents);
    }

    /**
     * Aggiorna i marker su Google Maps o Leaflet in base al motore attivo.
     */
    function updateMapMarkers(eventsList) {
        if (!mapInstance) return;

        // Pulizia marker precedenti
        if (isLeafletEngine) {
            mapMarkers.forEach(function (m) {
                if (m && m.remove) m.remove();
            });
        } else {
            mapMarkers.forEach(function (m) {
                if (m && m.setMap) m.setMap(null);
            });
        }
        mapMarkers = [];

        if (isLeafletEngine) {
            var latLngs = [];
            eventsList.forEach(function (ev) {
                if (!ev.location || typeof ev.location.lat !== "number" || typeof ev.location.lng !== "number") return;

                var letter = ev.letter || (ev.venue ? ev.venue.charAt(0).toUpperCase() : "E");

                var pinIcon = L.divIcon({
                    className: "custom-map-pin",
                    html: `<span>${letter}</span>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                    popupAnchor: [0, -18]
                });

                var marker = L.marker([ev.location.lat, ev.location.lng], { icon: pinIcon }).addTo(mapInstance);

                var popupHtml = `
                    <div style="font-family: inherit; max-width: 250px;">
                        <span style="display: inline-block; font-size: 10px; font-weight: bold; text-transform: uppercase; padding: 2px 8px; border-radius: 9999px; background: rgba(212, 255, 50, 0.12); color: #d4ff32; margin-bottom: 6px;">
                            ${escapeHtml(ev.zone || 'Centro')}
                        </span>
                        <h4 style="margin: 4px 0 6px 0; font-size: 14.5px; color: #ffffff; font-weight: 700;">${escapeHtml(ev.title)}</h4>
                        <p style="margin: 0 0 6px 0; font-size: 12px; color: #8b93a7;">
                            <strong>${escapeHtml(ev.venue)}</strong> • ${escapeHtml(ev.city)}
                        </p>
                        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #283044; padding-top: 6px; margin-top: 6px;">
                            <span style="font-size: 12.5px; font-weight: bold; color: #d4ff32;">${escapeHtml(ev.price || 'Gratuito')}</span>
                            <span style="font-size: 11px; color: #8b93a7;">${escapeHtml(ev.genre || '')}</span>
                        </div>
                    </div>
                `;

                marker.bindPopup(popupHtml);
                mapMarkers.push(marker);
                latLngs.push([ev.location.lat, ev.location.lng]);
            });

            if (latLngs.length > 1) {
                mapInstance.fitBounds(latLngs, { padding: [40, 40] });
            }
        } else if (window.google && google.maps) {
            var bounds = new google.maps.LatLngBounds();

            eventsList.forEach(function (ev) {
                if (!ev.location || typeof ev.location.lat !== "number" || typeof ev.location.lng !== "number") return;

                var marker = new google.maps.Marker({
                    position: { lat: ev.location.lat, lng: ev.location.lng },
                    map: mapInstance,
                    title: ev.title
                });

                var contentString = `
                    <div style="font-family: sans-serif; padding: 6px; max-width: 240px; color: #111;">
                        <span style="background: #0d1017; color: #d4ff32; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: bold;">
                            ${escapeHtml(ev.zone || 'Centro')}
                        </span>
                        <h4 style="margin: 6px 0 4px 0; font-size: 14px;">${escapeHtml(ev.title)}</h4>
                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #555;">${escapeHtml(ev.venue)} • ${escapeHtml(ev.city)}</p>
                        <p style="margin: 0; font-size: 11px; font-weight: bold; color: #1b8a3e;">${escapeHtml(ev.price)}</p>
                    </div>
                `;

                marker.addListener("click", function () {
                    mapInfoWindow.setContent(contentString);
                    mapInfoWindow.open(mapInstance, marker);
                });

                mapMarkers.push(marker);
                bounds.extend(marker.getPosition());
            });

            if (mapMarkers.length > 1) {
                mapInstance.fitBounds(bounds);
            }
        }
    }

    /**
     * Setup filtri temporali (Oggi, Domani, Weekend, Tutti).
     */
    function setupDatePills() {
        var pills = document.querySelectorAll(".date-pill");
        pills.forEach(function (pill) {
            pill.addEventListener("click", function () {
                pills.forEach(p => p.classList.remove("active"));
                pill.classList.add("active");

                filterState.dateFilter = pill.getAttribute("data-date") || "all";
                fetchAndRenderEvents();
            });
        });
    }

    /**
     * Setup filtri secondari: Selects & Ricerca testuale.
     */
    function setupSecondaryFilters() {
        if (selectZoneEl) {
            selectZoneEl.addEventListener("change", function () {
                filterState.zone = selectZoneEl.value;
                fetchAndRenderEvents();
            });
        }

        if (selectGenreEl) {
            selectGenreEl.addEventListener("change", function () {
                filterState.genre = selectGenreEl.value;
                fetchAndRenderEvents();
            });
        }

        if (selectTypeEl) {
            selectTypeEl.addEventListener("change", function () {
                filterState.type = selectTypeEl.value;
                fetchAndRenderEvents();
            });
        }

        // Ricerca testuale con debounce
        if (inputSearchEl) {
            var searchTimeout = null;
            inputSearchEl.addEventListener("input", function () {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(function () {
                    filterState.query = inputSearchEl.value;
                    fetchAndRenderEvents();
                }, 250);
            });
        }

        // Pulsante "Usa la mia posizione"
        if (btnUserLocEl) {
            btnUserLocEl.addEventListener("click", handleUserLocation);
        }

        // Pulsante "Azzera"
        if (btnResetEl) {
            btnResetEl.addEventListener("click", resetAllFilters);
        }
    }

    /**
     * Gestione geolocalizzazione utente.
     */
    function handleUserLocation() {
        if (!navigator.geolocation) {
            showToast("Geolocalizzazione non supportata dal browser.");
            return;
        }

        btnUserLocEl.textContent = "Rilevamento...";
        navigator.geolocation.getCurrentPosition(
            function (pos) {
                btnUserLocEl.textContent = "Usa la mia posizione";
                userPosition = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
                showToast("📍 Posizione rilevata con successo!");

                if (isLeafletEngine && mapInstance) {
                    mapInstance.setView([userPosition.lat, userPosition.lng], 13);
                    if (userMapMarker) {
                        userMapMarker.setLatLng([userPosition.lat, userPosition.lng]);
                    } else {
                        var userIcon = L.divIcon({
                            className: "custom-map-pin",
                            html: `<span>📍</span>`,
                            iconSize: [36, 36],
                            iconAnchor: [18, 18]
                        });
                        userMapMarker = L.marker([userPosition.lat, userPosition.lng], { icon: userIcon }).addTo(mapInstance);
                    }
                    userMapMarker.bindPopup(`<strong style="color: #d4ff32;">📍 La tua posizione attuale</strong>`).openPopup();
                } else if (mapInstance && window.google) {
                    mapInstance.setCenter(userPosition);
                    mapInstance.setZoom(13);
                }
            },
            function (err) {
                btnUserLocEl.textContent = "Usa la mia posizione";
                console.warn("Geolocalizzazione negata:", err);
                showToast("Impossibile accedere alla tua posizione.");
            },
            { timeout: 8000, enableHighAccuracy: true }
        );
    }

    /**
     * Ripristina tutti i filtri allo stato predefinito (Tutti).
     */
    function resetAllFilters() {
        filterState = {
            dateFilter: "all",
            zone: "all",
            genre: "all",
            type: "all",
            query: ""
        };

        // Reset UI pill data
        document.querySelectorAll(".date-pill").forEach(function (pill) {
            if (pill.getAttribute("data-date") === "all") {
                pill.classList.add("active");
            } else {
                pill.classList.remove("active");
            }
        });

        if (selectZoneEl) selectZoneEl.value = "all";
        if (selectGenreEl) selectGenreEl.value = "all";
        if (selectTypeEl) selectTypeEl.value = "all";
        if (inputSearchEl) inputSearchEl.value = "";

        showToast("Filtri azzerati.");
        fetchAndRenderEvents();
    }

    /**
     * Setup modale "Aggiungi evento".
     */
    function setupAddEventModal() {
        if (btnCloseAdd) {
            btnCloseAdd.addEventListener("click", function () {
                modalAdd.style.display = "none";
            });
        }

        if (btnCancelAdd) {
            btnCancelAdd.addEventListener("click", function () {
                modalAdd.style.display = "none";
            });
        }

        if (modalAdd) {
            modalAdd.addEventListener("click", function (e) {
                if (e.target === modalAdd) modalAdd.style.display = "none";
            });
        }

        if (formAdd) {
            formAdd.addEventListener("submit", async function (e) {
                e.preventDefault();

                var formData = new FormData(formAdd);
                var newEventPayload = {
                    title: formData.get("title"),
                    venue: formData.get("venue"),
                    city: formData.get("city"),
                    zone: formData.get("zone"),
                    genre: formData.get("genre"),
                    type: formData.get("type"),
                    date: formData.get("date"),
                    timeBadge: formData.get("date") === "oggi" ? "stasera" : formData.get("date"),
                    time: formData.get("time"),
                    price: formData.get("price"),
                    address: formData.get("address"),
                    description: formData.get("description")
                };

                try {
                    var res = await fetch(apiPrefix + "/api/maps/events/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newEventPayload)
                    });
                    var result = await res.json();

                    if (result.ok) {
                        modalAdd.style.display = "none";
                        formAdd.reset();
                        showToast("🎉 Evento pubblicato con successo!");
                        fetchAndRenderEvents();
                    } else {
                        showToast(result.message || "Errore durante la creazione dell'evento.");
                    }
                } catch (err) {
                    console.error("Errore invio form evento:", err);
                    showToast("Errore di connessione al server.");
                }
            });
        }

        if (window.location.search.includes("action=add-event") && modalAdd) {
            modalAdd.style.display = "flex";
        }
    }

    // Inizializzazione al caricamento del DOM
    document.addEventListener("DOMContentLoaded", function () {
        setupDatePills();
        setupSecondaryFilters();
        setupAddEventModal();
        fetchAndRenderEvents();
    });

    if (document.readyState === "interactive" || document.readyState === "complete") {
        setupDatePills();
        setupSecondaryFilters();
        setupAddEventModal();
        fetchAndRenderEvents();
    }
})();
