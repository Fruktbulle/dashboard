// Globala variabler för graferna
let todayChart = null;
let tomorrowChart = null;

const HOGBRINK_URL = "https://transport.integration.sl.se/v1/sites/7261/departures";
const TUMBA_URL = "https://transport.integration.sl.se/v1/sites/9524/departures";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather?q=Stockholm&units=metric&appid=ab37338c8b61d28862cadc698dad79f6";

// Uppdatera nuvarande tid
function updateTime() {
  const now = new Date();
  document.getElementById("current-time").textContent = `🕒 Nuvarande tid: ${now.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}`;
}

// Hämta avgångar
async function fetchDepartures(url, transportMode) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.departures.filter((d) => d.line.transport_mode === transportMode);
  } catch (error) {
    console.error("Kunde inte hämta avgångar:", error);
    return [];
  }
}

async function updateDepartures() {
  const container = document.getElementById("departures");
  container.innerHTML = "";

  const buses = await fetchDepartures(HOGBRINK_URL, "BUS");
  const trains = await fetchDepartures(TUMBA_URL, "TRAIN");

  const allDepartures = [
    { title: "🚌 Högbrinksvägen - Bussar", data: buses },
    { title: "🚆 Tumba - Tåg", data: trains },
  ];

  allDepartures.forEach((section) => {
    if (section.data.length) {
      const header = document.createElement("h2");
      header.textContent = section.title;
      container.appendChild(header);

      section.data.forEach((departure) => {
        const div = document.createElement("div");
        div.classList.add("departure");
        div.innerHTML = `
          <div class="line">Linje ${departure.line.designation} - ${departure.destination}</div>
          <div class="time">⏳ Avgår om: ${departure.display}</div>
        `;
        container.appendChild(div);
      });
    }
  });
}

// Hämta väder
async function fetchWeather() {
  try {
    const response = await fetch(WEATHER_URL);
    const data = await response.json();
    document.getElementById("weather").textContent = `🌤 ${data.weather[0].description}, ${Math.round(data.main.temp)}°C`;
  } catch (error) {
    document.getElementById("weather").textContent = "❌ Väderdata otillgängligt";
  }
}

// Uppdatera elpris-widget (iframe)
function updateElectricityIframe() {
  const iframe = document.getElementById("electricity-iframe");
  const src = iframe.src;
  iframe.src = ""; // Töm src för att tvinga omladdning
  setTimeout(() => {
    iframe.src = src; // Återställ src för att ladda om innehållet
  }, 100); // Vänta 100 ms för att säkerställa omladdning
}

// Generera kalender
function generateCalendar(year, month) {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const date = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const daysOfWeek = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
  daysOfWeek.forEach((day) => {
    const dayElement = document.createElement("div");
    dayElement.classList.add("day", "header");
    dayElement.textContent = day;
    calendar.appendChild(dayElement);
  });

  for (let i = 0; i < date.getDay() - 1; i++) {
    const emptyElement = document.createElement("div");
    emptyElement.classList.add("day");
    calendar.appendChild(emptyElement);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement("div");
    dayElement.classList.add("day");
    dayElement.textContent = day;

    const currentDateObj = new Date(year, month, day);

    if (
      currentDateObj.getDate() === today.getDate() &&
      currentDateObj.getMonth() === today.getMonth() &&
      currentDateObj.getFullYear() === today.getFullYear()
    ) {
      dayElement.classList.add("today");
    }

    const firstSoptunnaDay = new Date(2025, 0, 9);
    const diffInDays = Math.floor((currentDateObj - firstSoptunnaDay) / (1000 * 60 * 60 * 24));
    if (diffInDays >= 0 && diffInDays % 14 === 0) {
      dayElement.classList.add("soptunna");
      dayElement.textContent += " - Soptunnor!";
    }

    calendar.appendChild(dayElement);
  }
}

function updateCalendar() {
  const now = new Date();
  generateCalendar(now.getFullYear(), now.getMonth());
}

// Initiera alla funktioner
setInterval(updateTime, 1000);
setInterval(updateDepartures, 30000);
setInterval(fetchWeather, 60000);
setInterval(updateElectricityIframe, 1800000); // Uppdatera iframen var 30:e minut

updateTime();
updateDepartures();
fetchWeather();
updateCalendar();
