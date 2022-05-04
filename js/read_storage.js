import { getLocation, themeToggler, weatherData } from './main.min.js';
const langVersion = 4; //for checking if cached language is up to date
let cachedData = localStorage.getItem('cachedData') ? JSON.parse(localStorage.getItem('cachedData')) : null;
let cachedLang = localStorage.getItem('cachedLang') ? JSON.parse(localStorage.getItem('cachedLang')) : null;
let searchHistory = localStorage.getItem('searchHistory') ? JSON.parse(localStorage.getItem('searchHistory')) : [];
let favList = localStorage.getItem('favList') ? JSON.parse(localStorage.getItem('favList')) : [];
let settings = localStorage.getItem('userSettings') ? JSON.parse(localStorage.getItem('userSettings')) : { units: 'metric', clockMode: 'h23', anim: true, theme: 'default', lang: 'en' };

const weatherIcons = new Map([[200, 'bi-cloud-lightning-rain'], [201, 'bi-cloud-lightning-rain'], [202, 'bi-cloud-lightning-rain'], [210, 'bi-cloud-lightning'], [211, 'bi-cloud-lightning'], [212, 'bi-cloud-lightning'], [221, 'bi-cloud-lightning'], [230, 'bi-cloud-lightning-rain'], [231, 'bi-cloud-lightning-rain'], [232, 'bi-cloud-lightning-rain'], [300, 'bi-cloud-drizzle'], [301, 'bi-cloud-drizzle'], [302, 'bi-cloud-drizzle'], [310, 'bi-cloud-drizzle'], [311, 'bi-cloud-drizzle'], [312, 'bi-cloud-drizzle'], [313, 'bi-cloud-drizzle'], [314, 'bi-cloud-drizzle'], [321, 'bi-cloud-drizzle'], [500, 'bi-cloud-rain'], [501, 'bi-cloud-rain'], [502, 'bi-cloud-rain-heavy'], [503, 'bi-cloud-rain-heavy'], [504, 'bi-cloud-rain-heavy'], [511, 'bi-cloud-sleet'], [520, 'bi-cloud-rain'], [521, 'bi-cloud-rain'], [522, 'bi-cloud-rain-heavy'], [531, 'bi-cloud-rain'], [600, 'bi-cloud-snow'], [601, 'bi-cloud-snow'], [602, 'bi-cloud-snow'], [611, 'bi-cloud-sleet'], [612, 'bi-cloud-sleet'], [613, 'bi-cloud-sleet'], [615, 'bi-cloud-sleet'], [616, 'bi-cloud-sleet'], [620, 'bi-cloud-snow'], [621, 'bi-cloud-snow'], [622, 'bi-cloud-snow'], [701, 'bi-cloud-haze2'], [711, 'bi-cloud-haze2'], [721, 'bi-cloud-haze2'], [731, 'bi-cloud-haze2'], [741, 'bi-cloud-haze2'], [751, 'bi-cloud-haze2'], [761, 'bi-cloud-haze2'], [762, 'bi-cloud-haze2'], [771, 'bi-wind'], [781, 'bi-tornado'], [800, 'bi-sun'], [801, 'bi-cloud-sun'], [802, 'bi-cloudy'], [803, 'bi-clouds'], [804, 'bi-clouds']])

const nightWeatherIcons = new Map([[800, 'bi-moon-stars'], [801, 'bi-cloud-moon']]);

const unitsTypes = new Map([['metric', { 'temp': '°C', 'wind_speed': 'm/s', 'pressure': 'hPa', 'humidity': '%' }], ['imperial', { 'temp': '°F', 'wind_speed': 'mph', 'pressure': 'hPa', 'humidity': '%' }], ['default', { 'temp': 'K', 'wind_speed': 'm/s', 'pressure': 'hPa', 'humidity': '%' }]]);

const chartLimits = new Map([['metric', { 'temp': [0, 30], 'wind_speed': [0, 5.6], 'pressure': [950, 1000], 'humidity': [0, 100] }], ['imperial', { 'temp': [0, 86], 'wind_speed': [0, 12], 'pressure': [950, 1000], 'humidity': [0, 100] }], ['default', { 'temp': [243, 303], 'wind_speed': [0, 5.6], 'pressure': [950, 1000], 'humidity': [0, 100] }]]);
 
const airQualityColors = ['#007a06', '#02b13c', '#db9c14', '#db8b2f', '#ce5252'];

const editSettings = (units, clockMode, anim, theme, lang, reset) => {
    if (units) settings.units = units;
    if (theme) {
        settings.theme = theme;
        themeToggler();
    }
    if (lang) {
        settings.lang = lang;
    }
    if (reset === true) {
        let body = document.querySelector('body');
        settings.clockMode = "h23";
        langHandler();
        updateClockData(weatherData);
        settings.anim = true;
        body.classList.remove('no-anim');
    }
    else {
        if (clockMode === true) {
            settings.clockMode = (settings.clockMode == "h23" ? "h12" : "h23");
            updateClockData(weatherData);
        }
        if (anim === true) {
            let body = document.querySelector('body');
            settings.anim = (settings.anim === true ? false : true);
            settings.anim === false ? body.classList.add('no-anim') : body.classList.remove('no-anim');
        }
    }
    console.log(settings);
    localStorage.setItem('userSettings', JSON.stringify(settings));
}

function updateClockData() {
    const data = weatherData.weather;
    if (data != null) {
        const dataSelect = document.querySelector('.df-data-type');
        const chartColumns = Array.from(document.querySelectorAll('.df-chart-col'));
        const dataType = dataSelect.value;
        const weekdayData = data.daily[document.querySelector('[name="radio-wf-weekday-card"]').value];

        document.querySelector('.wf-sunrise-data').innerHTML = new Date(weekdayData.sunrise * 1000).toLocaleTimeString('pl-PL', { timeZone: data.timezone, hour: '2-digit', minute: '2-digit', hourCycle: settings.clockMode });
        document.querySelector('.wf-sunset-data').innerHTML = new Date(weekdayData.sunset * 1000).toLocaleTimeString('pl-PL', { timeZone: data.timezone, hour: '2-digit', minute: '2-digit', hourCycle: settings.clockMode });
        document.querySelector('.refresh-time').innerHTML = new Date(data.current.dt * 1000).toLocaleString('pl-PL', { hour: '2-digit', minute: '2-digit', hourCycle: settings.clockMode });

        document.querySelectorAll('.cf-sunrise-data').forEach((e) => {
            const sunriseTime = new Date(data.current.sunrise * 1000).toLocaleTimeString('pl-PL', { timeZone: data.timezone, hour: '2-digit', minute: '2-digit', hourCycle: settings.clockMode });
            e.innerHTML = sunriseTime;
            e.ariaLabel = `Sunrise at: ${sunriseTime}`
        });
        document.querySelectorAll('.cf-sunset-data').forEach((e) => {
            const sunsetTime = new Date(data.current.sunset * 1000).toLocaleTimeString('pl-PL', { timeZone: data.timezone, hour: '2-digit', minute: '2-digit', hourCycle: settings.clockMode });
            e.innerHTML = sunsetTime;
            e.ariaLabel = `Sunset at: ${sunsetTime}`
        });
        document.querySelectorAll('.city-time-data').forEach((e) => {
            e.innerHTML = new Date().toLocaleTimeString('pl-PL', { timeZone: data ? data.timezone : "etc/utc", hourCycle: settings.clockMode });
        });
        document.querySelectorAll('.df-hour-info').forEach((e, i) => {
            let d = data.hourly[i];
            const time = new Date(d.dt * 1000).toLocaleTimeString('pl-PL', { timeZone: data.timezone, hour: '2-digit', minute: '2-digit', hourCycle: settings.clockMode });

            e.innerHTML = time;
            chartColumns[i].ariaLabel = `${dataSelect[dataSelect.selectedIndex].text} at ${time}: ${dataType == 'temp' ? Math.round(d[dataType]) : d[dataType]} ${unitsTypes.get(settings.units)[dataType]}`;
        })
    }
}

const langHandler = () => {
    return new Promise(res => {
        let lang;
        try {
            lang = cachedLang.lang;
        } catch (error) {
            lang = null;
        }
        Promise.all([
            new Promise(resolve => {
                let check = false;
                if (cachedLang != null) {
                    if (cachedLang.langVersion) {
                        if (lang == settings.lang & cachedLang.langVersion == langVersion) {
                            console.log(`Reloaded language file "${cachedLang.lang}" from cache`);
                            check = true;
                            resolve();
                        }
                        if (cachedLang.langVersion != langVersion) console.log(`Language file "${cachedLang.lang}" is incorrect! Expected langVersion ${langVersion}, got ${cachedLang.langVersion}`)
                    }
                }

                if (check === false)
                {
                    fetch(`./js/lang/lang_${settings.lang}.json`)
                        .then(result => result.json())
                        .then(json => {
                            cachedLang = json;
                            localStorage.setItem('cachedLang', JSON.stringify(json));
                            console.log(`Saved language "${json.lang}" to cache`);
                            resolve();
                    })
                }
            })
        ]).then(() => {
            console.log(`Inserting language strings for language "${cachedLang.lang}"`)
            document.querySelectorAll('[tkey-gen]').forEach(e => {
                e.innerHTML = cachedLang.generic[e.getAttribute('tkey-gen')]
            })
            document.querySelectorAll('[tkey-aria]').forEach(e => {
                e.title = e.ariaLabel = cachedLang.aria[e.getAttribute('tkey-aria')];
            })
            res();
        })
    })
}

const changeHistory = (searchLocation) => {
    const searchObject = {
        name: searchLocation.name,
        lat: searchLocation.lat,
        lon: searchLocation.lon,
        country: searchLocation.country,
        state: searchLocation.state ? searchLocation.state : "N/A"
    }
    const found = searchHistory.filter(el => { return el.name === searchObject.name & el.country === searchObject.country & el.state == searchObject.state });
    if (found.length != 0) {
        searchHistory.forEach(el => { if (el.name === searchObject.name & el.country === searchObject.country & el.state == searchObject.state) searchHistory.splice(searchHistory.indexOf(el), 1) })
        searchHistory.unshift(searchObject);
    }
    else if (searchHistory.length >= 10) {
        searchHistory.pop();
        searchHistory.unshift(searchObject);
    }
    else {
        searchHistory.unshift(searchObject);
    }

    console.log(searchHistory);
    editHistory();
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

const addToFav = (searchLocation) => {
    const searchObject = {
        name: searchLocation.name,
        lat: searchLocation.lat,
        lon: searchLocation.lon,
        country: searchLocation.country,
        state: searchLocation.state ? searchLocation.state : "N/A"
    }
    const found = favList.filter(el => { return el.name === searchObject.name & el.country === searchObject.country & el.state == searchObject.state });
    if (found.length == 0) {
        favList.unshift(searchObject);
        document.querySelector('.button-sfd-add-fav').classList.add('box-hidden');
    }
    else {
        console.log("This city is already on fav list!")
    }

    localStorage.setItem('favList', JSON.stringify(favList));
    editFav();
}

const editFav = () => {
    let favBoxContent = '';
    favList.forEach((e) => {
        favBoxContent += `<div class="menu-dd-item">
        <button class="sfd-fav-city menu-dd-item-city col-prim" aria-label="${cachedLang.aria['menu-hist-search'].replace('%loc-name', e.name)}" title="${cachedLang.aria['menu-hist-search'].replace('%loc-name', e.name)}">
            <i class="fi fi-${e.country.toLowerCase()}"></i>
            <p class="menu-dd-item-loc">${e.name}</p>
            <h5 class="menu-dd-item-state">${e.state}</h5>
        </button>
        <button class="bi bi-heartbreak sfd-fav-remove menu-dd-item-remove col-sec menu-dd-nohide" aria-label="${cachedLang.aria['menu-fav-remove'].replace('%loc-name', e.name)}" title="${cachedLang.aria['menu-fav-remove'].replace('%loc-name', e.name)}"></button>
    </div>`
    });
    if (favBoxContent == '') {
        document.querySelector('.sfd-desc').innerHTML = cachedLang.generic['menu-fav-desc-empty'];
        document.querySelector('.sfd-wrapper').innerHTML = favBoxContent;
        if (!weatherData.location) document.querySelector('.button-sfd-add-fav').classList.add('box-hidden');
    }
    else {
        document.querySelector('.sfd-desc').innerHTML = cachedLang.generic['menu-fav-desc'].replace('%fav-amount', favList.length);
        document.querySelector('.sfd-wrapper').innerHTML = favBoxContent;
        document.querySelectorAll('.sfd-fav-city').forEach((e, i) => {
            e.addEventListener('click', () => {
                getLocation(favList[i].name, false, favList[i]);
            })
        });

        document.querySelectorAll('.sfd-fav-remove').forEach((e, i) => {
            e.addEventListener('click', () => {
                if (weatherData.location.name == favList[i].name) document.querySelector('.button-sfd-add-fav').classList.remove('box-hidden');
                favList.splice(i, 1);
                localStorage.setItem('favList', JSON.stringify(favList));
                editFav();
            })
        });
    }
}

const editHistory = () => {
    let historyBoxContent = '';
    searchHistory.forEach((e) => {
        historyBoxContent += `<div class="menu-dd-item">
        <button class="menu-dd-history-city menu-dd-item-city col-prim" aria-label="${cachedLang.aria['menu-hist-search'].replace('%loc-name', e.name)}" title="${cachedLang.aria['menu-hist-search'].replace('%loc-name', e.name)}">
            <i class="fi fi-${e.country.toLowerCase()}"></i>
            <p class="menu-dd-item-loc">${e.name}</p>
            <h5 class="menu-dd-item-state">${e.state}</h5>
        </button>
        <button class="bi bi-trash menu-dd-history-remove menu-dd-item-remove col-sec menu-dd-nohide" aria-label="${cachedLang.aria['menu-hist-remove'].replace('%loc-name', e.name)}" title="${cachedLang.aria['menu-hist-remove'].replace('%loc-name', e.name)}"></button>
    </div>`
    });
    if (historyBoxContent == '') {
        document.querySelector('.shd-desc').innerHTML = cachedLang.generic['menu-hist-desc-empty']
    }
    else {
        document.querySelector('.shd-desc').innerHTML = cachedLang.generic['menu-hist-desc']
        document.querySelector('.shd-wrapper').innerHTML = historyBoxContent;
        document.querySelectorAll('.menu-dd-history-city').forEach((e, i) => {
            e.addEventListener('click', () => {
                getLocation(searchHistory[i].name, false, searchHistory[i]);
            })
        });

        document.querySelectorAll('.menu-dd-history-remove').forEach((e, i) => {
            e.addEventListener('click', () => {
                searchHistory.splice(i, 1);
                localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
                editHistory();
            })
        });
    }
}

const cacheData = (newData) => {
    cachedData = newData;
    localStorage.setItem('cachedData', JSON.stringify(newData));
}

export { cachedData, searchHistory, settings, favList, airQualityColors, nightWeatherIcons, weatherIcons, unitsTypes, chartLimits, cachedLang, cacheData, langHandler, changeHistory, editSettings, editHistory, editFav, addToFav };