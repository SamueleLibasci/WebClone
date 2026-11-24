/**
 * normalizeEvent.js
 * Normalizza e valida i campi di un evento per garantire la coerenza dei dati inviati al client.
 */

function normalizeEvent(event) {
    if (!event) return null;

    const letter = event.letter || (event.venue ? event.venue.charAt(0).toUpperCase() : (event.title ? event.title.charAt(0).toUpperCase() : "E"));
    const gradient = event.gradient || "linear-gradient(135deg, #2b3d18 0%, #445922 50%, #2f3d17 100%)";

    return {
        id: event.id,
        letter: letter,
        gradient: gradient,
        title: event.title || "Evento senza titolo",
        category: event.category || "generale",
        categoryLabel: event.categoryLabel || event.category || "Evento",
        venue: event.venue || "",
        address: event.address || "",
        city: event.city || "",
        location: {
            lat: Number(event.location?.lat) || 0,
            lng: Number(event.location?.lng) || 0
        },
        date: event.date || "oggi",
        timeBadge: event.timeBadge || "oggi",
        time: event.time || "",
        zone: event.zone || "Centro",
        genre: event.genre || "Vario / Misto",
        type: event.type || "Aperitivo",
        price: event.price || "Gratuito",
        description: event.description || ""
    };
}

module.exports = { normalizeEvent };
