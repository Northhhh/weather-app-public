let API_KEY;
//imports
import { currentForecast } from './current_forecast.min.js';
import { settings, cacheData, cachedLang, cachedData, changeHistory, editHistory, editSettings, addToFav, favList, editFav, langHandler } from './read_storage.min.js';
import { dailyForecast } from './daily_forecast.min.js';
import { weeklyForecast, setCardData } from './weekly_forecast.min.js';

const body = document.querySelector('body');
const main = document.querySelector('main');
const menuNav = document.querySelector('.menu-dd-navbar');
const menuNavRadio = document.querySelectorAll('[name="radio-menu-dd-nav"]');
const menuDropdown = document.querySelector('.menu-dd');
const menuDropdownWrapper = document.querySelector('.menu-dd-wrapper');
const menuDropdownHide = document.querySelectorAll('.menu-dd-hideable');
const menuLocWrapper = document.querySelector('.menu-dd-location-wrapper');
const menuHistWrapper = document.querySelector('.menu-dd-history-wrapper');
const menuSettWrapper = document.querySelector('.menu-dd-sett-wrapper');
const menuFavWrapper = document.querySelector('.menu-dd-fav-wrapper');
const searchInput = document.querySelector('.search-bar');
const menuFavButton = document.querySelector('.button-sfd-add-fav');
const clearStorageButton = document.querySelector('.button-clear-storage');
const resetInputButton = document.querySelectorAll('.button-reset-input');
const settingsButton = document.querySelector('.button-settings');
const noAnimCheckbox = document.querySelector('.checkbox-no-anim');
const clockModeCheckbox = document.querySelector('.checkbox-clock-mode');
const resultNavRadio = document.querySelectorAll('[name="radio-result-nav"]');
const weekdayCardRadio = document.querySelectorAll('[name="radio-wf-weekday-card"]');
const measurementSelect = document.querySelector('[name="select-measurement-units"]');
const themeSelect = document.querySelector('[name="select-theme"]');
const langSelect = document.querySelector('[name="select-lang"]');
const chartDataSelect = document.querySelector('[name="select-df-chart-data-type"]');
const tooltip = document.querySelector('.tooltip')
const resultBox = document.querySelector('.result-container');
const refreshTime = document.querySelector('.refresh-time');
const refreshLink = document.querySelector('.refresh-link');

let isDropdownOpened = false;

//mobile toggles
const navbarMobile = document.querySelector('.navbar-wrapper');
const weekdayWrapper = document.querySelector('.wf-weekday-nav');
const forwardButton = document.querySelector('.button-result-nav-forward');
const backwardButton = document.querySelector('.button-result-nav-backward');
const mobileWeekdayButton = document.querySelector('.button-wf-mobile-weekday');
const searchButton = document.querySelector('.button-search');

let weatherData =
{
  location: null,
  weather: null,
  pollution: null,
  unitsTypes: null
}
let date = new Date();

const hideToggler = (hideList, unhideList) => {
  if (hideList != undefined) {
    !Array.isArray(hideList) ? hideList = new Array(hideList) : null;
    hideList.forEach(e => { Array.from(e).length == 0 ? (e.classList.add('box-hidden'), e.ariaHidden = true) : e.forEach(el => { el.classList.add('box-hidden'); e.ariaHidden = true }) });
  }
  if (unhideList != undefined) {
    !Array.isArray(unhideList) ? unhideList = new Array(unhideList) : null;
    unhideList.forEach(e => { Array.from(e).length == 0 ? (e.classList.remove('box-hidden'), e.ariaHidden = false) : e.forEach(el => { el.classList.remove('box-hidden'); e.ariaHidden = false }) });
  }
}

const themeToggler = () => {
  const weather = (weatherData.weather ? weatherData.weather.current : undefined);
  const clock = new Date();
  main.classList = '';
  if ((settings.theme == 'default' & !weather) | settings.theme == 'local') main.classList.add(clock.getHours() < 6 || clock.getHours() > 18 ? 'theme-day' : 'theme-night')
  else if (settings.theme == 'default') main.classList.add(weather.dt > weather.sunrise && weather.dt < weather.sunset ? 'theme-day' : 'theme-night')
  else if (settings.theme == 'night') main.classList.add('theme-night');
  else if (settings.theme == 'day') main.classList.add('theme-day')
  else if (settings.theme == 'contrast') main.classList.add('theme-contrast')
}

const resetSearch = () => {
  searchInput.value = '';
  tooltip.classList.replace('col-err', 'col-sec');
  tooltip.innerHTML = cachedLang.generic['tooltip-default'];
  document.querySelector('#radio-result-nav1').checked = true;
  changeCard(1);
  hideToggler([resultBox, menuFavButton], tooltip);
  themeToggler();
}

const getLocation = (searchQuery, overwrite, searchCache) => {
  searchInput.value = searchQuery;
  if (cachedData) {
    if ((cachedData.location.name == searchQuery & cachedData.unitsTypes == settings.units) & overwrite !== true) {
      let date = (new Date().getTime()) / 1000;
      if (Math.floor((date - cachedData.weather.current.dt) / 60) < 10) {
        weatherData = cachedData;
        refreshTime.innerHTML = new Date(cachedData.weather.current.dt * 1000).toLocaleString('pl-PL', { hour: '2-digit', minute: '2-digit', hourCycle: settings.clockMode });
        closeDropdown();
        setWeatherData(weatherData);
        console.log("Readed data from cache");
        return;
      }
      else {
        weatherData.location = cachedData.location;
        getWeatherData(cachedData.location);
        return;
      }
    }
  }

  if (searchCache) {
    console.log("New API data fetch from saved lat/lon");
    fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${searchCache.lat}&lon=${searchCache.lon}&limit=1&appid=${API_KEY}`)
      .then(value => value.json())
      .then(json => {
        if (json.length != 0) {
          json[0].name = searchCache.name;
          weatherData.location = json[0];
          closeDropdown();
          getWeatherData(weatherData.location);
        }
        else throw Error(cachedLang.generic['error-cached']);
      })
      .catch((e) => {
        tooltip.classList.replace('col-sec', 'col-err');
        tooltip.innerHTML = `<i class="bi bi-cloud-slash"></i><br>${e.message[0].toUpperCase() + e.message.substr(1)}`;
        hideToggler(resultBox, tooltip);
      })
  }
  else {
    if (searchQuery == '') {
      console.log('Input is empty, ignoring');
      return;
    }
    console.log("New API data fetch from user query");
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${searchQuery}&limit=10&appid=${API_KEY}`)
      .then(value => value.json())
      .then(json => {
        if (json.length != 0) {
          json = json.filter((value, index, self) =>
            index === self.findIndex((t) => (
              t.state === value.state
            ))
          )

          if (json.length > 1) {
            document.querySelector('[tkey-gen="menu-loc-desc"]').innerHTML = cachedLang.generic["menu-loc-desc"].replace('%loc-amount', json.length).replace('%loc-phrase', searchQuery)
            menuDropdown.classList.add('dd-opened');
            hideToggler(menuDropdownHide, [menuDropdownWrapper, menuLocWrapper]);

            let content = '';
            json.forEach((e) => {
              content += `<div class="menu-dd-item">
              <button class="sld-city-select menu-dd-item-city col-prim">
                  <i class="fi fi-${e.country.toLowerCase()}"></i>
                  <p class="menu-dd-item-loc">${e.name}</p>
                  <h5 class="menu-dd-item-state">${e.state ? e.state : "N/A"}</h5>
              </button>
              </div>`
            })
            document.querySelector('.sld-wrapper').innerHTML = content;
            document.querySelectorAll('.sld-city-select').forEach((e, i) => {
              e.addEventListener('click', () => {
                searchInput.value = json[i].name;
                weatherData.location = json[i];
                closeDropdown();
                getWeatherData(json[i]);
              })
            })
          }
          else {
            let loc = weatherData.location = json[0];
            getWeatherData(loc);
            closeDropdown();
          }
        }
        else throw Error(cachedLang.generic['error-query']);
      })
      .catch((e) => {
        tooltip.classList.replace('col-sec', 'col-err');
        tooltip.innerHTML = `<i class="bi bi-cloud-slash"></i><br>${e.message[0].toUpperCase() + e.message.substr(1)}`;
        hideToggler(resultBox, tooltip);
      })
  }
}

const getWeatherData = (loc) => {
  Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${loc.lat}&lon=${loc.lon}&exclude=minutely&units=${settings.units}&lang=${settings.lang}&appid=${API_KEY}`).then(value => value.json()),
    fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${loc.lat}&lon=${loc.lon}&appid=${API_KEY}`).then(value => value.json())
  ]).then(([weather, pollution]) => {
    weather.daily.shift();
    weather.hourly.splice(0, 24);
    weatherData.weather = weather;
    weatherData.pollution = pollution;
    weatherData.unitsTypes = settings.units;
    refreshTime.innerHTML = new Date().toLocaleString('pl-PL', { hour: '2-digit', minute: '2-digit', hourCycle: settings.clockMode });
    cacheData(weatherData);
    changeHistory(weatherData.location);
    setWeatherData(weatherData);
  })
    .catch((e) => {
      tooltip.classList.replace('col-sec', 'col-err');
      tooltip.innerHTML = `<i class="bi bi-cloud-slash"></i><br>${e.message[0].toUpperCase() + e.message.substr(1)}`;
      hideToggler(resultBox, tooltip);
    })
}

const setWeatherData = (weatherData) => {
  let loc = weatherData.location;
  document.querySelector('#radio-result-nav1').checked = true;
  changeCard(1);
  document.querySelector('[tkey-gen="menu-fav-button"]').innerHTML = cachedLang.generic["menu-fav-button"].replace('%loc-name', loc.name);
  hideToggler([tooltip, menuFavButton], resultBox);
  if (!favList.find(el => el.name === loc.name & el.country === loc.country & (loc.state != null ? el.state === loc.state : true))) hideToggler(...Array(1), menuFavButton);
  themeToggler();
  currentForecast(weatherData);
  dailyForecast(weatherData);
  weeklyForecast(weatherData);
}

const editTimer = () => {
  date = new Date();
  document.querySelector('.city-date-data').innerHTML = date.toLocaleDateString('pl-PL', {
    timeZone: weatherData.weather ? weatherData.weather.timezone : "etc/utc", day: "2-digit", month: "2-digit", year: "numeric"
  });
  document.querySelector('.city-time-data').innerHTML = date.toLocaleTimeString('pl-PL', {
    timeZone: weatherData.weather ? weatherData.weather.timezone : "etc/utc", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: settings.clockMode
  });
  setTimeout(() => {
    editTimer();
  }, 1000);
}

const closeDropdown = () => {
  hideToggler([menuDropdownWrapper, menuDropdownHide], [menuHistWrapper, menuNav]);
  [menuDropdown, weekdayWrapper, navbarMobile].forEach(e => e.classList.remove('dd-opened'));
  document.querySelector('#radio-menu-dd-nav1').checked = true;
  isDropdownOpened = false;
}

function changeCard(cardID, dir) {
  const radios = document.querySelectorAll('[name="radio-result-nav"]');
  if (!cardID) cardID = parseInt(document.querySelector('[name="radio-result-nav"]:checked').value.slice(-1));
  if (dir) dir == 'forward' ? cardID++ : cardID--;
  cardID > radios.length ? cardID = 1 : null;
  cardID < 1 ? cardID = radios.length : null;
  document.querySelector(`#radio-result-nav${cardID}`).checked = true;
  const card = document.querySelector(`.card${cardID}`);
  hideToggler(document.querySelectorAll('.weather-box'), card);
  card.scrollTo({top: 0, behavior:"smooth"});
}

function changeDropdownCard(cardName) {
  hideToggler(menuDropdownHide, [document.querySelector(`.${cardName}`), menuNav]);
}

searchInput.addEventListener('change', (e) => {
  getLocation(e.target.value);
  searchInput.blur();
})

searchInput.addEventListener('click', (e) => {
  hideToggler(...Array(1), menuDropdownWrapper);
  menuDropdown.classList.add('dd-opened');
  isDropdownOpened = true;
})

menuFavButton.addEventListener('click', () => { 
  addToFav(weatherData.location);
})

resetInputButton.forEach(e => e.addEventListener('click', () => {
  resetSearch();
  e.style.animation = "rotate-once 1s";
  e.disabled = true;

  setTimeout(() => {
    e.style.animation = "";
    e.disabled = false;
  }, 1000);
}));

settingsButton.addEventListener('click', () => {
  hideToggler(menuHistWrapper, [menuDropdownWrapper, menuSettWrapper]);
  document.querySelector('#radio-menu-dd-nav3').checked = true;
  [menuDropdown, navbarMobile].forEach(e => e.classList.add('dd-opened'));
  isDropdownOpened = true;
})

searchButton.addEventListener('click', () => {
  hideToggler([menuSettWrapper, menuFavWrapper], [menuDropdownWrapper, menuHistWrapper]);
  document.querySelector('#radio-menu-dd-nav1').checked = true;
  [menuDropdown, navbarMobile].forEach(e => e.classList.add('dd-opened'));
  searchInput.focus();
  searchInput.select();
  isDropdownOpened = true;
});

clearStorageButton.addEventListener('click', () => {
  let prompt = confirm(cachedLang != null ? cachedLang.generic['menu-sett-clear-prompt'] : 'Are you sure?');
  if (prompt === true) {
    console.log("Cleared local storage!");
    localStorage.clear();
    editSettings('metric', true, true, 'default', 'en', true);
  }
})

forwardButton.addEventListener('click', () => {
  changeCard(...Array(1), 'forward');
  forwardButton.style.animation = "arrow-right 1s";
  forwardButton.disabled = true;

  setTimeout(() => {
    forwardButton.style.animation = "";
    forwardButton.disabled = false;
  }, 1000);
})

backwardButton.addEventListener('click', () => {
  changeCard(...Array(1), 'backward');
  backwardButton.style.animation = "arrow-left 1s";
  backwardButton.disabled = true;

  setTimeout(() => {
    backwardButton.style.animation = "";
    backwardButton.disabled = false;
  }, 1000);
})

mobileWeekdayButton.addEventListener('click', () => {
  hideToggler(menuHistWrapper, [menuDropdownWrapper, menuSettWrapper]);
  document.querySelector('#radio-menu-dd-nav3').checked = true;
  [weekdayWrapper, navbarMobile].forEach(e => e.classList.add('dd-opened'));
  isDropdownOpened = true;
});

measurementSelect.addEventListener('change', () => {
  editSettings(measurementSelect.value);
  if (searchInput.value) {
    getWeatherData(weatherData.location);
  }
});

chartDataSelect.addEventListener('change', () => {
  dailyForecast(weatherData);
})

themeSelect.addEventListener('change', () => {
  editSettings(...Array(3), themeSelect.value);
})

langSelect.addEventListener('change', async () => {
  editSettings(...Array(4), langSelect.value);
  await langHandler();
  if (weatherData.location != null) getWeatherData(weatherData.location);
})

for (let button of resultNavRadio) {
  button.addEventListener('click', () => changeCard(parseInt(button.value.slice(-1))))
}

for (let button of menuNavRadio) {
  button.addEventListener('click', () => changeDropdownCard(button.value))
}

for (let button of weekdayCardRadio) {
  button.addEventListener('click', () => {
    if (weatherData.weather != null) {
      setCardData(button.value, weatherData);
      document.querySelector('.wf-info-wrapper').scrollTo({ top: 0, behavior: "smooth" })
    }
  });
}

refreshLink.addEventListener('click', () => {
  getWeatherData(weatherData.location);
})

clockModeCheckbox.addEventListener('click', () => {
  editSettings(...Array(1), true);
});

noAnimCheckbox.addEventListener('click', () => {
  editSettings(...Array(2), true);
});

window.addEventListener('load', async () => {
  await fetch('./js/api_key.json').then(res => res.json().then(r => API_KEY = r.API_KEY));
  themeToggler();
  clockModeCheckbox.checked = (settings.clockMode == "h12" ? true : false);
  noAnimCheckbox.checked = (settings.anim === false ? true : false);
  measurementSelect.value = settings.units;
  themeSelect.value = settings.theme;
  langSelect.value = settings.lang;
  await langHandler();
  editTimer();
  editHistory();
  editFav();
  if (cachedData) {
    let name = cachedData.location.name;
    getLocation(name);
  }

  setTimeout(() => {
    if (settings.anim === true) body.classList.remove("no-anim");
  }, 500);
});

window.addEventListener('click', (e) => {
  if (!(menuDropdown.contains(e.target) | e.target.classList.contains('menu-dd-nohide')) & isDropdownOpened === true) closeDropdown();
})

export { getLocation, themeToggler, hideToggler, weatherData }