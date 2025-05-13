// Når hele HTML-dokumentet er indlæst, bliver der startet en asynkron funktion
document.addEventListener("DOMContentLoaded", async () => {
    // Hent referencer til DOM-elementer
    const locationSelect = document.getElementById("locationSelect");  // Dropdown menu
    const weatherContainer = document.getElementById("weatherContainer"); // Container til vejr-tiles

    // Et Map til at holde styr på hvilke lokationer der allerede vises
    const displayedTiles = new Map();

    try {
        // Hent listen over lokationer fra API
        const response = await fetch("api/location.json");
        const locations = await response.json();
        // console.log("Indlæste lokationer:", locations); // Log de hentede lokationer

        // Gennemgå alle lokationer og tilføj dem som mulighed til dropdown
        for (const [id, name] of Object.entries(locations)) {
            // console.log("Opretter dropdown-option:", id, name); // Log id og navn for hver option
            const option = document.createElement("option");
            option.value = id;
            option.textContent = name;
            locationSelect.appendChild(option);
        }
    } catch (error) {
        // Hvis noget går galt under hentning af lokationer, bliver fejlen logget
        console.error("Fejl ved indlæsning af lokationer:", error);
    }

    // Når brugeren ændrer valget i dropdown
    locationSelect.addEventListener("change", async () => {
        // Find de valgte lokationer
        const selected = Array.from(locationSelect.selectedOptions).map(opt => opt.value);
        // console.log("Valgte lokationer:", selected); // Log de valgte værdier

        // For hver valgt lokation:
        for (const id of selected) {
            // Hvis der ikke allerede har vist denne tile
            if (!displayedTiles.has(id)) {
                try {
                    // Hent vejrdata for lokationen
                    const response = await fetch(`api/location/${id}.json`);
                    const data = await response.json();
                    // console.log("Vejrdata modtaget for", id, ":", data); // Log de hentede vejrdata

                    // Opret en tile og tilføj den til containeren
                    const tile = createWeatherTile(id, data);
                    weatherContainer.appendChild(tile);

                    // Gem tile i Map så den bliver vist
                    displayedTiles.set(id, tile);
                } catch (error) {
                    // Log fejl hvis der er problemer med at hente vejrdata
                    console.error(`Fejl ved indlæsning af vejrdata for ${id}:`, error);
                }
            }
        }

        // Fjern tiles for lokationer der ikke længere er valgt
        for (const [id, tile] of displayedTiles) {
            if (!selected.includes(id)) {
                tile.remove();
                displayedTiles.delete(id);
            }
        }
    });

    // Funktion der laver en tile med vejrdata
    function createWeatherTile(id, data) {
        // console.log("Opretter vejr-tile for", id, "med data:", data); // Log data der bruges til at oprette en tile
        const tile = document.createElement("div");
        tile.className = "relative bg-stone-100 rounded-lg shadow p-4 w-60";

        // HTML-strukturen med vejrdata
        tile.innerHTML = `
            <button class="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
            <h3 class="text-xl font-semibold mb-2">${data.locationName}</h3>
            <p><span class="font-medium">Temperature:</span> ${data.temperature}°C</p>
            <p><span class="font-medium">Weather:</span> ${data.weather}</p>
            <p><span class="font-medium">Humidity:</span> ${data.humidity}%</p>
            <p><span class="font-medium">Wind:</span> ${data.wind} m/s</p>
        `;

        // Klik på "×"-knappen fjerner tuilen og opdaterer dropdown'en
        tile.querySelector("button").addEventListener("click", () => {
            // console.log("Fjern-knap klikket for lokation:", id); // Log hvilken tile der forsøges fjernet
            tile.remove();             
            displayedTiles.delete(id); 

            // Fjern markering i dropdown'en
            for (const option of locationSelect.options) {
                if (option.value === id) option.selected = false;
            }
        });

        return tile;
    }
});

