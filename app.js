// ===== Hora UTC en vivo =====
function updateUTC(){
  const now = new Date();
  const utc = now.toISOString().split("T")[1].split(".")[0] + "Z";
  document.getElementById("utcClock").textContent = utc;
}
setInterval(updateUTC, 1000);
updateUTC();


// ===== Temperatura local (Open-Meteo) =====
async function loadTemp(){
  try{
    const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=41.15&longitude=1.18&current=temperature_2m");
    const data = await res.json();
    document.getElementById("tempLocal").textContent = data.current.temperature_2m + "°C";
  }catch(e){
    document.getElementById("tempLocal").textContent = "--";
  }
}
loadTemp();


// ===== Selector aeropuerto =====
let currentAirport = "LEBL";

function setAirport(apt){
  currentAirport = apt;
  document.getElementById("selectedAirport").textContent = apt;
  loadMetar(apt);
}


// ===== METAR REAL desde NOAA (sin CORS, profesional) =====
async function loadMetar(apt){
  const url = `https://tgftp.nws.noaa.gov/data/observations/metar/stations/${apt}.TXT`;

  const rawEl = document.getElementById("metarRaw");
  const metaEl = document.getElementById("metarMeta");

  rawEl.textContent = "Cargando METAR real...";
  metaEl.textContent = "";

  try{
    const res = await fetch(url);
    const text = await res.text();

    rawEl.textContent = text;
    metaEl.textContent = `Fuente: NOAA oficial · ICAO: ${apt}`;
  } catch(err){
    rawEl.textCon


