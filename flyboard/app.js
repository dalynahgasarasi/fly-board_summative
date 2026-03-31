let allFlights = [];
let flightsCache = {};
 let currentPage = 1;
 const flightsPerPage = 10;

const API_KEY = "a110ee0698msha8e8a6b5895939dp135360jsnc8a0683ba8e4";
const API_HOST = "aerodatabox.p.rapidapi.com";

const searchBtn = document.getElementById("searchButton");
const airportInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("resultsArea");
function sanitize(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
searchBtn.addEventListener("click", function() {
    const searchTerm = sanitize(airportInput.value.trim().toUpperCase());
    if (!searchTerm) {
        alert("Please enter an airport code., airline, or flight number.");
        return;
    }
    let airportCode = searchTerm;
    if (cityLookup[searchTerm]) {
        airportCode = cityLookup[searchTerm];
    }
    if (airportCode.length <= 4) {
        resultsContainer.innerHTML = "<p>Loading...</p>";
        fetchFlights(airportCode);
    } else {
        if (allFlights.length === 0){
            alert("Search for an airport first, then filter by airline or flight number.");
            return;
        }
        const filtered = allFlights.filter(function(flight){
            const airline = flight.airline ? flight.airline.name.toUpperCase() : "";
            const flightNum = flight.number ? flight.number.toUpperCase() : "";
            return airline.includes(searchTerm) || flightNum.includes(searchTerm);

        });
        displayflights(filtered, "search results");
    }    
});
airportInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        searchBtn.click();
    }
});

async function fetchFlights(airportCode) {
    const today = new Date();
    const fromTime = today.toISOString().slice(0, 16);
    const later = new Date(today.getTime() + 12 * 60 * 60 * 1000);
    const toTime = later.toISOString().slice(0, 16);
    const activeToggle = document.querySelector(".toggle-btn.active");
    const direction = activeToggle ? activeToggle.textContent === "Departures" ? "Departure" : "Arrival" : "Departure";

    const cacheKey = airportCode + "-" + direction;
    if (flightsCache[cacheKey]) {
        console.log("Using cached data for " + cacheKey);
        allFlights = flightsCache[cacheKey];
        document.getElementById("filterArea").style.display = "flex";
        displayflights(allFlights, airportCode);
        return;
    }
    const url = "https://aerodatabox.p.rapidapi.com/flights/airports/iata/" + airportCode + "/" + fromTime + "/" + toTime + "?direction=" + direction;
    try {
        const response = await fetch(url, {
            headers: {
                "X-RapidAPI-Key": API_KEY,
                "X-RapidAPI-Host": API_HOST
            }
        });
        const data = await response.json();
        console.log(data);

        const flights = direction === "Departure" ? data.departures : data.arrivals;
        if (!flights || flights.length === 0){
            resultsContainer.innerHTML = "<p>No flights found for this airport today.</p>";
            return;
        }
        allFlights = flights;
        flightsCache[cacheKey] = flights;
        document.getElementById("filterArea").style.display = "flex";
        displayflights(allFlights, airportCode);
    } catch (error) {
        console.error("Error fetching flight data:", error);
        resultsContainer.innerHTML = "<p>Error fetching flight data. Please try again later.</p>";
    }
}
function formatTime(isoString) {
    if (!isoString || isoString === "N/A") return "N/A";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {hour: "2-digit", minute: "2-digit", hour12: true});
}
function displayflights(flights, airportCode) {
    if (flights.length === 0){
        resultsContainer.innerHTML = "<p>No Flights match your search.</p>";
        return;
    }

    const activeToggle = document.querySelector(".toggle-btn.active");
    const direction = activeToggle ? activeToggle.textContent === "Departures" ? "Departures" : "Arrivals" : "Flights";
    let html = "<h2>" +direction + " from " +airportCode + " (" + flights.length + ")</h2>";
    const totalPages = Math.ceil(flights.length / flightsPerPage);
    if (currentPage > totalPages) currentPage = 1;
    const start = (currentPage - 1) * flightsPerPage;
    const end = start + flightsPerPage;
    const pageFlights = flights.slice(start, end);

    html += "<p class='page-info'>Page " + currentPage + " of " + totalPages + "</p>";

    pageFlights.forEach(function(flight) {
    const airline = sanitize(flight.airline ? flight.airline.name : "Unknown");
    const flight_no = sanitize(flight.number || "N/A");
    const destination = sanitize(flight.movement && flight.movement.airport ? flight.movement.airport.name : "Unknown");
    const destination_code = sanitize(flight.movement && flight.movement.airport ? flight.movement.airport.iata : "---");
    const time = flight.movement && flight.movement.scheduledTime ? flight.movement.scheduledTime.local : "N/A";
    const status = sanitize(flight.status || "Unknown");
    const date = flight.movement && flight.movement.scheduledTime ? flight.movement.scheduledTime.local.slice(0, 10) : "N/A";
    const aircraft = sanitize(flight.aircraft ? flight.aircraft.model : "Unknown");


    html += "<div class= 'flight-card'>";
    html += "<div class='card-top'>";
    html += "<div class='flight-id'>";
    html += "<span class='airline-name'>" + airline + "</span>";
    html += "<span class='flight-number'>" + flight_no + "</span>";
    html += "</div>";
    html += "<span class='flight-status status-" + status.toLowerCase()+ "'>" + status + "</span>";
    html += "</div>";
    html += "<div class='card-route'>";
    html += "<div class='airport-block'>";
    html += "<div class='airport-code'>" + airportCode + "</div>";
    html += "<div class='airport-time'>" + formatTime(time) + "</div>";
    html += "</div>";
    html += "<div class='route-line'>&#9992;</div>";
    html += "<div class='airport-block arrival'>";
    html += "<div class='airport-code'>" + destination_code + "</div>";
    html += "<div class='airport-name'>" + destination + "</div>";
    html += "</div>";
    html += "</div>";
    html += "<div class='card-details'>";
    html += "<span>Aircraft: " + aircraft + "</span>";
    html += "<span>Date: " + date + "</span>";
    html += "</div>";
    html += "</div>";

    });
    html += "<div class='pagination'>";
    if (currentPage > 1) {
        html += "<button onclick='changePage(-1)'>Previous</button>";
    }
    if (currentPage < totalPages) {
        html += "<button onclick='changePage(1)'>Next</button>";
    }
    html += "</div>";

    resultsContainer.innerHTML = html;
}
function filterFlights(status) {
    document.querySelectorAll(".filter-chip").forEach(function(btn) {
        btn.classList.remove("active");
    });
    event.target.classList.add("active");
    let filtered = allFlights;
    if (status !== "all") {
        filtered = allFlights.filter(function(flight) {
            return flight.status && flight.status.toLowerCase() === status.toLowerCase();
        });
    }
    displayflights(filtered, airportInput.value.trim().toUpperCase());
}

function sortFlights() {
    const sortBy = document.getElementById("sortSelect").value;
    let sorted = [...allFlights];

    if (sortBy === "airline") {
        sorted.sort(function(a, b) {
            const airlineA = a.airline ? a.airline.name : "";
            const airlineB = b.airline ? b.airline.name : "";
            return airlineA.localeCompare(airlineB);
        });
    } else {
        sorted.sort(function(a, b) {
            const timeA = a.movement && a.movement.scheduledTime ? a.movement.scheduledTime.local : "";
            const timeB = b.movement && b.movement.scheduledTime ? b.movement.scheduledTime.local : "";
            return timeA.localeCompare(timeB);
        });
    }
    displayflights(sorted, airportInput.value.trim().toUpperCase());
}
function quickSearch(Code) {
    airportInput.value = Code;
    searchBtn.click();
}
function setDirection(value, btn) {
    document.querySelectorAll(".toggle-btn").forEach(function(b) {
        b.classList.remove("active");
    });
    btn.classList.add("active");
    const airportCode = airportInput.value.trim().toUpperCase();
    if (airportCode && allFlights.length > 0) {
        resultsContainer.innerHTML = "<p>Loading...</p>";
        fetchFlights(airportCode);
    }
}
function changePage(direction) {
    currentPage += direction;
    const airportCode = airportInput.value.trim().toUpperCase();
    displayflights(allFlights, airportCode);
    window.scrollTo(0, 0);
}