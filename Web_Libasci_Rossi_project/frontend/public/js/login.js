function handleCredentialResponse(response) {
    var message = document.getElementById("login-message");

    fetch("/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential })
    })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                 message.textContent = "Benvenuto, " + data.user.name + "!"; // ...saluta l'utente.
                setTimeout(function () { window.location.href = "/"; }, 1000); // ...e dopo un secondo lo porta alla home.
            } else {
                message.textContent = data.message;
            }
        })
        .catch(() => {
            message.textContent = "Errore di connessione al server.";
        });
}