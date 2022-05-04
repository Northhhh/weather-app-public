import { settings, weatherIcons, cachedLang, unitsTypes } from "./read_storage.min.js";

function weeklyForecast(data) {
  const weather = data.weather.daily;
  const cardIcons = document.querySelectorAll('.wf-card-weekday-weather-icon');
  const cardWeekdays = document.querySelectorAll('.wf-card-weekday');
  const cardDates = document.querySelectorAll('.wf-card-weekday-date');
  const cardTemps = document.querySelectorAll('.wf-card-weekday-temp');
  const aria = cachedLang.aria;

  for (let [i, e] of weather.entries()) {
    let weekday = new Date(e.dt * 1000);
    let w = e.weather[0].description;
    cardIcons[i].classList.forEach(el => el.startsWith('bi-') ? cardIcons[i].classList.replace(el, weatherIcons.get(e.weather[0].id)) : null);
    cardIcons[i].title = w[0].toUpperCase() + w.substr(1).toLowerCase();
    cardIcons[i].ariaLabel = aria['weather-week-label'].replace('%weather', w).replace('%weekday', cachedLang.weekdays[weekday.getDay()]).replace('%temp', `${Math.round(e.temp.day)} ${unitsTypes.get(settings.units).temp}`);
    cardWeekdays[i].innerHTML = cachedLang.weekdays[weekday.getDay()];
    cardDates[i].innerHTML = weekday.toLocaleDateString('pl-pl').padStart(10, '0');
    cardTemps[i].innerHTML = `${Math.round(e.temp.day)} ${unitsTypes.get(settings.units).temp}`;
  }

  document.querySelector('#wf-weekday-card-0').checked = true;
  setCardData(0, data);
}

function setCardData(value, data) {
  const weather = data.weather.daily[value];
  let weekday = new Date(weather.dt * 1000);
  const icon = weatherIcons.get(weather.weather[0].id); 
  let w = weather.weather[0].description;

  document.querySelector('.wf-weekday-data').innerHTML = cachedLang.weekdays[weekday.getDay()];
  document.querySelector('.wf-date-data').innerHTML = weekday.toLocaleDateString('pl-pl').padStart(10, '0');
  document.querySelector('.wf-sunrise-data').innerHTML = new Date(weather.sunrise * 1000).toLocaleTimeString('pl-PL', { timeZone: data.weather.timezone, hour: '2-digit', minute: '2-digit', hourCycle: settings.clockMode });
  document.querySelector('.wf-sunset-data').innerHTML = new Date(weather.sunset * 1000).toLocaleTimeString('pl-PL', { timeZone: data.weather.timezone, hour: '2-digit', minute: '2-digit', hourCycle: settings.clockMode });
  document.querySelector('.wf-day-temp-data').innerHTML = `${cachedLang.generic['weather-temp-abbr']} ${Math.round(weather.temp.day)} ${unitsTypes.get(settings.units).temp}`;
  document.querySelector('.wf-day-fl-temp-data').innerHTML = `${cachedLang.generic['weather-temp-fl-abbr']} ${Math.round(weather.feels_like.day)} ${unitsTypes.get(settings.units).temp}`;
  document.querySelector('.wf-night-temp-data').innerHTML = `${cachedLang.generic['weather-temp-abbr']} ${Math.round(weather.temp.night)} ${unitsTypes.get(settings.units).temp}`;
  document.querySelector('.wf-night-fl-temp-data').innerHTML = `${cachedLang.generic['weather-temp-fl-abbr']} ${Math.round(weather.feels_like.night)} ${unitsTypes.get(settings.units).temp}`;
  document.querySelector('.wf-humid-data').innerHTML = `${Math.round(weather.humidity)} %`;
  document.querySelector('.wf-press-data').innerHTML = `${Math.round(weather.pressure)} hPa`;
  document.querySelector('.wf-wind-speed-data').innerHTML = `${Math.round(weather.wind_speed)} ${unitsTypes.get(settings.units).wind_speed}`;
  document.querySelector('.wf-pop-data').innerHTML = `${Math.round(weather.pop * 100)} %`;
  document.querySelector('.wf-weather-desc-data').innerHTML = w[0].toUpperCase() + w.substr(1).toLowerCase();
  document.querySelectorAll('.wf-weather-icon-data').forEach((e) => {
    e.classList.forEach((el) => { if (el.startsWith('bi-')) e.classList.replace(el, icon) });
  });


  if (weather.snow) {
    document.querySelectorAll('.wf-snow-hideable').forEach((e) => {
      e.classList.remove('box-hidden');
      e.ariaHidden = false;
    });
    document.querySelectorAll('.wf-snow-data').forEach((e) => {
      e.innerHTML = `${weather.snow} mm`;
    });
  }
  else {
    document.querySelectorAll('.wf-snow-hideable').forEach((e) => {
      e.classList.add('box-hidden');
      e.ariaHidden = true;
    });
  }

  if (weather.rain) {
    document.querySelectorAll('.wf-rain-hideable').forEach((e) => {
      e.classList.remove('box-hidden');
      e.ariaHidden = false;
    });
    document.querySelectorAll('.wf-rain-data').forEach((e) => {
      e.innerHTML = `${weather.rain} mm`;
    });
  }
  else {
    document.querySelectorAll('.wf-rain-hideable').forEach((e) => {
      e.classList.add('box-hidden');
      e.ariaHidden = true;
    });
  }
}

export { weeklyForecast, setCardData }