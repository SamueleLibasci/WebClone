/**
 * eventsStore.js
 * Registro degli eventi e locali in memoria per la visualizzazione su Google Maps e nella Home.
 */

var events = [
    {
        id: 1,
        letter: "B",
        gradient: "linear-gradient(135deg, #2b3d18 0%, #445922 50%, #2f3d17 100%)",
        timeBadge: "tra 33 min",
        time: "ore 18:00",
        date: "oggi",
        venue: "Bar Centrale",
        title: "Aperitivo con vinili",
        description: "Dj set su vinile durante l'aperitivo, tavoli anche fuori.",
        zone: "Centro",
        genre: "Vario / Misto",
        type: "Aperitivo",
        price: "Gratuito",
        city: "Roma",
        address: "Piazza Navona 14, Roma",
        location: { lat: 41.8988, lng: 12.4731 },
        category: "aperitivi",
        categoryLabel: "Aperitivi"
    },
    {
        id: 2,
        letter: "O",
        gradient: "linear-gradient(135deg, #1b353f 0%, #264d5c 50%, #1a333d 100%)",
        timeBadge: "tra 2 h",
        time: "ore 19:00",
        date: "oggi",
        venue: "Officina Sonora",
        title: "Notte house al piano interrato",
        description: "Selezione house e afro-house, ingresso con lista fino a mezzanotte.",
        zone: "Zona Stazione",
        genre: "House / Techno",
        type: "Serata in discoteca",
        price: "10€ con drink",
        city: "Bologna",
        address: "Via de' Carracci 24, Bologna",
        location: { lat: 44.5075, lng: 11.3436 },
        category: "club",
        categoryLabel: "Club & DJ Set"
    },
    {
        id: 3,
        letter: "C",
        gradient: "linear-gradient(135deg, #42203b 0%, #5d254c 50%, #461f3a 100%)",
        timeBadge: "domani",
        time: "ore 21:00",
        date: "domani",
        venue: "Cantina Rossa",
        title: "Jam session acustica",
        description: "Musicisti locali si alternano sul palco, microfono aperto dopo le 22.",
        zone: "Quartiere Est",
        genre: "Jazz / Soul",
        type: "Concerto",
        price: "Gratuito",
        city: "Firenze",
        address: "Via San Niccolò 82, Firenze",
        location: { lat: 43.7645, lng: 11.2612 },
        category: "concerti",
        categoryLabel: "Musica & Concerti"
    },
    {
        id: 4,
        letter: "L",
        gradient: "linear-gradient(135deg, #193836 0%, #244f4d 50%, #183331 100%)",
        timeBadge: "stasera",
        time: "ore 22:30",
        date: "oggi",
        venue: "Largo Venue",
        title: "Indie Wave & Retro Night",
        description: "Dagli anni 80 ad oggi: chitarre, sintetizzatori e pista all'aperto.",
        zone: "Quartiere Est",
        genre: "Rock / Indie",
        type: "Serata in discoteca",
        price: "8€",
        city: "Roma",
        address: "Via Biordo Michelotti 2, Roma",
        location: { lat: 41.8902, lng: 12.5378 },
        category: "club",
        categoryLabel: "Club & DJ Set"
    },
    {
        id: 5,
        letter: "G",
        gradient: "linear-gradient(135deg, #1c3648 0%, #284c64 50%, #1a3242 100%)",
        timeBadge: "tra 4 h",
        time: "ore 20:00",
        date: "oggi",
        venue: "Giardino Sonoro",
        title: "Ambient Sunset & Tapas",
        description: "Dj set ambient e downtempo tra gli ulivi, selezione tapas mediterranee.",
        zone: "Centro",
        genre: "Elettronica",
        type: "Aperitivo",
        price: "12€ con drink",
        city: "Napoli",
        address: "Parco Virgiliano, Napoli",
        location: { lat: 40.7985, lng: 14.1843 },
        category: "aperitivi",
        categoryLabel: "Aperitivi"
    },
    {
        id: 6,
        letter: "T",
        gradient: "linear-gradient(135deg, #32431c 0%, #485c27 50%, #2f3e1b 100%)",
        timeBadge: "weekend",
        time: "ore 21:30",
        date: "weekend",
        venue: "Teatro Centrale",
        title: "Neo-Classical Piano & Strings",
        description: "Concerto a lume di candela con composizioni moderne e archi.",
        zone: "Centro",
        genre: "Jazz / Soul",
        type: "Concerto",
        price: "15€",
        city: "Milano",
        address: "Via Torino 34, Milano",
        location: { lat: 45.4623, lng: 9.1868 },
        category: "concerti",
        categoryLabel: "Musica & Concerti"
    },
    {
        id: 7,
        letter: "M",
        gradient: "linear-gradient(135deg, #3a2238 0%, #52274d 50%, #3e1e3b 100%)",
        timeBadge: "domani",
        time: "ore 19:30",
        date: "domani",
        venue: "Mag Cafè",
        title: "Aperitivo Navigli & Craft Cocktails",
        description: "Mixology sperimentale e musica funk sul canale storico dei Navigli.",
        zone: "Navigli",
        genre: "Vario / Misto",
        type: "Aperitivo",
        price: "Gratuito",
        city: "Milano",
        address: "Ripa di Porta Ticinese 43, Milano",
        location: { lat: 45.4519, lng: 9.1763 },
        category: "aperitivi",
        categoryLabel: "Aperitivi"
    },
    {
        id: 8,
        letter: "S",
        gradient: "linear-gradient(135deg, #1b353f 0%, #254d5d 50%, #19333f 100%)",
        timeBadge: "weekend",
        time: "ore 23:00",
        date: "weekend",
        venue: "Spazio Novecento",
        title: "Techno Immersion Live",
        description: "Special guest internazionale e visual mapping a 360 gradi.",
        zone: "Zona Stazione",
        genre: "House / Techno",
        type: "Serata in discoteca",
        price: "20€ con drink",
        city: "Roma",
        address: "Piazza Guglielmo Marconi 26, Roma",
        location: { lat: 41.8315, lng: 12.4705 },
        category: "club",
        categoryLabel: "Club & DJ Set"
    },
    {
        id: 9,
        letter: "A",
        gradient: "linear-gradient(135deg, #2b3d18 0%, #445922 50%, #2d3b16 100%)",
        timeBadge: "tra 1 h",
        time: "ore 18:30",
        date: "oggi",
        venue: "Alexanderplatz Jazz Club",
        title: "Bebop & Wine Tasting",
        description: "Degustazione vini biologici accompagnata da quartetto jazz dal vivo.",
        zone: "Centro",
        genre: "Jazz / Soul",
        type: "Concerto",
        price: "10€ con degustazione",
        city: "Roma",
        address: "Via Ostia 9, Roma",
        location: { lat: 41.9134, lng: 12.4552 },
        category: "concerti",
        categoryLabel: "Musica & Concerti"
    },
    {
        id: 10,
        letter: "P",
        gradient: "linear-gradient(135deg, #1b3838 0%, #274f4e 50%, #183332 100%)",
        timeBadge: "domani",
        time: "ore 22:00",
        date: "domani",
        venue: "Palazzo delle Esposizioni",
        title: "Silent Disco & Electronic Art",
        description: "Tre canali musicali in cuffia e installazioni d'arte digitale luminosa.",
        zone: "Centro",
        genre: "Elettronica",
        type: "Serata in discoteca",
        price: "12€ con cuffie",
        city: "Roma",
        address: "Via Nazionale 194, Roma",
        location: { lat: 41.8992, lng: 12.4912 },
        category: "club",
        categoryLabel: "Club & DJ Set"
    }
];

function getAllEvents() {
    return events;
}

function getEventsByCategory(category) {
    if (!category || category === "all" || category === "tutti") {
        return events;
    }
    const normalizedCategory = String(category).toLowerCase().trim();
    return events.filter(e => (e.category && e.category.toLowerCase() === normalizedCategory));
}

function findEventById(id) {
    return events.find(e => e.id === parseInt(id, 10));
}

const GRADIENT_PALETTE = [
    "linear-gradient(135deg, #2b3d18 0%, #445922 50%, #2f3d17 100%)",
    "linear-gradient(135deg, #1b353f 0%, #264d5c 50%, #1a333d 100%)",
    "linear-gradient(135deg, #42203b 0%, #5d254c 50%, #461f3a 100%)",
    "linear-gradient(135deg, #193836 0%, #244f4d 50%, #183331 100%)",
    "linear-gradient(135deg, #1c3648 0%, #284c64 50%, #1a3242 100%)",
    "linear-gradient(135deg, #32431c 0%, #485c27 50%, #2f3e1b 100%)"
];

function addEvent(data) {
    const nextId = events.length > 0 ? Math.max(...events.map(e => e.id || 0)) + 1 : 1;
    const venue = (data.venue || "Locale").trim();
    const title = (data.title || "Nuovo Evento").trim();
    const letter = (data.letter || venue.charAt(0) || title.charAt(0) || "E").toUpperCase();
    const randomGradient = GRADIENT_PALETTE[nextId % GRADIENT_PALETTE.length];

    const newEvent = {
        id: nextId,
        letter: letter,
        gradient: data.gradient || randomGradient,
        timeBadge: data.timeBadge || "oggi",
        time: data.time || "ore 20:00",
        date: (data.date || "oggi").toLowerCase(),
        venue: venue,
        title: title,
        description: (data.description || "Nessuna descrizione specificata.").trim(),
        zone: data.zone || "Centro",
        genre: data.genre || "Vario / Misto",
        type: data.type || "Aperitivo",
        price: data.price || "Gratuito",
        city: data.city || "Roma",
        address: data.address || `${venue}, ${data.city || "Roma"}`,
        location: {
            lat: Number(data.location?.lat) || (41.9028 + (Math.random() - 0.5) * 0.05),
            lng: Number(data.location?.lng) || (12.4964 + (Math.random() - 0.5) * 0.05)
        },
        category: (data.category || (data.type === "Concerto" ? "concerti" : (data.type === "Aperitivo" ? "aperitivi" : "club"))),
        categoryLabel: data.categoryLabel || data.type || "Evento"
    };

    events.unshift(newEvent);
    return newEvent;
}

function filterAllEvents({ dateFilter, zone, genre, type, query, city, category } = {}) {
    let result = [...events];

    // Filtro data: "oggi", "domani", "weekend", "tutti"/"all"
    if (dateFilter && dateFilter !== "all" && dateFilter !== "tutti") {
        const d = dateFilter.toLowerCase().trim();
        result = result.filter(e => {
            const evDate = (e.date || "").toLowerCase();
            const badge = (e.timeBadge || "").toLowerCase();
            if (d === "oggi") {
                return evDate === "oggi" || badge.includes("min") || badge.includes("h") || badge.includes("stasera") || badge.includes("oggi");
            }
            if (d === "domani") {
                return evDate === "domani" || badge.includes("domani");
            }
            if (d === "weekend") {
                return evDate === "weekend" || badge.includes("weekend") || badge.includes("sabato") || badge.includes("domenica");
            }
            return evDate.includes(d);
        });
    }

    // Filtro zona
    if (zone && zone !== "all" && zone !== "tutte" && zone !== "tutte le zone") {
        const z = zone.toLowerCase().trim();
        result = result.filter(e => (e.zone && e.zone.toLowerCase() === z));
    }

    // Filtro genere
    if (genre && genre !== "all" && genre !== "tutti" && genre !== "tutti i generi") {
        const g = genre.toLowerCase().trim();
        result = result.filter(e => (e.genre && e.genre.toLowerCase() === g));
    }

    // Filtro tipo
    if (type && type !== "all" && type !== "tutti" && type !== "tutti i tipi") {
        const t = type.toLowerCase().trim();
        result = result.filter(e => (e.type && e.type.toLowerCase() === t));
    }

    // Filtro ricerca testuale (città, titolo, locale, indirizzo)
    const search = (query || city || "").toLowerCase().trim();
    if (search.length > 0) {
        result = result.filter(e => {
            return (
                (e.city && e.city.toLowerCase().includes(search)) ||
                (e.title && e.title.toLowerCase().includes(search)) ||
                (e.venue && e.venue.toLowerCase().includes(search)) ||
                (e.description && e.description.toLowerCase().includes(search)) ||
                (e.address && e.address.toLowerCase().includes(search)) ||
                (e.zone && e.zone.toLowerCase().includes(search))
            );
        });
    }

    // Filtro categoria (per retrocompatibilità con map.html)
    if (category && category !== "all" && category !== "tutti") {
        const c = category.toLowerCase().trim();
        result = result.filter(e => (e.category && e.category.toLowerCase() === c));
    }

    return result;
}

module.exports = {
    getAllEvents,
    getEventsByCategory,
    findEventById,
    addEvent,
    filterAllEvents
};
