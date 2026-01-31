function pad2(n){ return String(n).padStart(2,'0'); }

/* ---------------- UTC CLOCK ---------------- */
function setUTCClock(){
  const el = document.getElementById('utcClock');
  if(!el) return;

  const now = new Date();
  const hh = pad2(now.getUTCHours());
  const mm = pad2(now.getUTCMinutes());
  const ss = pad2(now.getUTCSeconds());
  el.textContent = `${hh}:${mm}:${ss}Z`;
}
setInterval(setUTCClock, 250);
setUTCClock();

/* ---------------- TEMP (Open-Meteo) ---------------- */
async function fetchTemp(lat, lon){
  const el = document.getElementById('tempNow');
  const meta = document.getElementById('tempMeta');
  if(!el || !meta) return;

  try{
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=UTC`;
    const res = await fetch(url);
    const data = await res.json();
    const t = data?.current?.temperature_2m;

    if(typeof t === 'number'){
      el.textContent = `${t.toFixed(1)}°C`;
      meta.textContent = `Fuente: Open-Meteo · Lat ${lat.toFixed(3)} / Lon ${lon.toFixed(3)} (UTC)`;
    } else {
      el.textContent = `—`;
      meta.textContent = `No se pudo leer la temperatura actual.`;
    }
  } catch(e){
    el.textContent = `—`;
    meta.textContent = `Error consultando la temperatura.`;
  }
}

function initTemp(){
  const el = document.getElementById('tempNow');
  const meta = document.getElementById('tempMeta');
  if(!el || !meta) return;

  if(!navigator.geolocation){
    el.textContent = `—`;
    meta.textContent = `Tu navegador no permite geolocalización.`;
    return;
  }

  meta.textContent = `Pide tu ubicación para mostrar temperatura local…`;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      fetchTemp(latitude, longitude);
    },
    () => {
      el.textContent = `—`;
      meta.textContent = `Ubicación denegada. Podemos poner una ciudad fija si quieres.`;
    },
    { enableHighAccuracy:false, timeout:8000, maximumAge: 600000 }
  );
}
initTemp();

/* ---------------- AIRPORT SELECT (localStorage) ---------------- */
function getAirport(){
  return localStorage.getItem('apt') || 'LERS';
}

function paintAirport(){
  const aptEl = document.getElementById('aptSel');
  if(aptEl) aptEl.textContent = getAirport();
}

/* Te la dejo global para que el botón onclick la vea */
window.setAirport = function(icao){
  localStorage.setItem('apt', icao);
  paintAirport();
  loadMetar();
};

/* ---------------- METAR (AviationWeather.gov) ----------------
   Nota: si tu navegador bloquea la llamada por CORS, te lo dirá.
*/
async function loadMetar(){
  const apt = getAirport();
  const rawEl = document.getElementById('metarRaw');
  const metaEl = document.getElementById('metarMeta');
  if(!rawEl || !metaEl) return;

  rawEl.textContent = `Cargando METAR de ${apt}…`;
  metaEl.textContent = `—`;

  try{
    const url = `https://aviationweather.gov/api/data/metar?ids=${encodeURIComponent(apt)}&format=json`;
    const res = await fetch(url);
    const data = await res.json();

    // Normalmente viene como array
    const item = Array.isArray(data) ? data[0] : data;
    const raw = item?.rawOb || item?.raw || item?.metar || null;

    if(raw){
      rawEl.textContent = raw;
      metaEl.textContent = `Fuente: AviationWeather.gov · ICAO: ${apt}`;
    } else {
      rawEl.textContent = `No se encontró METAR para ${apt}.`;
      metaEl.textContent = `Prueba con otro aeropuerto o revisamos el endpoint.`;
    }
  } catch(err){
    rawEl.textContent = `No pude cargar el METAR (posible bloqueo del navegador por CORS).`;
    metaEl.textContent = `Solución si pasa: usamos un proxy/otra fuente o lo abrimos como enlace directo.`;
  }
}

paintAirport();
loadMetar();

