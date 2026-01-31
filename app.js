function pad2(n){ return String(n).padStart(2,'0'); }

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
