import { settings, weatherIcons, cachedLang, airQualityColors, nightWeatherIcons, unitsTypes } from "./read_storage.min.js";

function currentForecast(data) {
    console.log(data);
    const location = data.location;
    const weather = data.weather.current;
    const pollution = data.pollution.list[0];
    const aria = cachedLang.aria;
    const daytime = weather.dt > weather.sunrise && weather.dt < weather.sunset ? 'day' : 'night';
    const date = new Date(weather.dt * 1000).toLocaleDateString('pl-pl', { timeZone: data.weather.timezone, day: "2-digit", month: "2-digit", year: "numeric" });
    const sunriseTime = new Date(weather.sunrise * 1000).toLocaleTimeString('pl-PL', { timeZone: data.weather.timezone, hour: '2-digit', minute: '2-digit', hourCycle: settings.clockMode });
    const sunsetTime = new Date(weather.sunset * 1000).toLocaleTimeString('pl-PL', { timeZone: data.weather.timezone, hour: '2-digit', minute: '2-digit', hourCycle: settings.clockMode });
    const daytimeDuration = Math.round((weather.sunset - weather.sunrise) / 60);
    const currentDaytime = Math.round((weather.dt - weather.sunrise) / 60);
    const id = weather.weather[0].id;
    const icon = daytime == 'night' ? (nightWeatherIcons.has(id) ? nightWeatherIcons.get(id) : weatherIcons.get(id)) : (weatherIcons.get(id));

    document.querySelector('.cf-city-info').ariaLabel = `${aria['weather-current-desc']} ${location.name}, ${location.country}`;
    document.querySelector('.cf-temp-data').innerHTML = Math.floor(weather.temp);
    document.querySelector('.units-temp-data').innerHTML = `${unitsTypes.get(settings.units).temp}`;
    document.querySelector('.cf-fl-temp-data').innerHTML = cachedLang.generic['weather-temp-feels-like'].replace('%temp', `${Math.round(weather.feels_like)} ${unitsTypes.get(settings.units).temp}`);
    document.querySelector('.city-date-data').innerHTML = date;
    document.querySelector('.cf-humid-data').innerHTML = `${weather.humidity} %`;
    document.querySelector('.cf-cloud-data').innerHTML = `${weather.clouds} %`;
    document.querySelector('.cf-dewpt-data').innerHTML = `${Math.round(weather.dew_point)} ${unitsTypes.get(settings.units).temp}`;
    document.querySelector('.cf-wind-deg-data').innerHTML = `${weather.wind_deg == 360 ? 0 : weather.wind_deg} °`;
    for (let [key, value] of Object.entries(pollution.components)) {
        document.querySelectorAll(`.cf-${key}-data`).forEach(e => {
            e.innerHTML = `${value} μg/m³`;
            e.ariaLabel = `${value} ${aria['unit-aq']}`
        })
    }
    document.querySelectorAll('.cf-wind-speed-data').forEach((e) => {
        e.innerHTML = `${weather.wind_speed} ${unitsTypes.get(settings.units).wind_speed}`;
        e.ariaLabel = `${weather.wind_speed} ${aria[`unit-${unitsTypes.get(settings.units).wind_speed}`]}`
    });
    document.querySelectorAll('.cf-temp').forEach(e => {
        e.title = e.ariaLabel = aria['weather-temp-desc'].replace('%temp', `${Math.floor(weather.temp)} ${unitsTypes.get(settings.units).temp}`)
    })
    document.querySelectorAll('.country-flag-data').forEach((e) => {
        e.classList.forEach((el) => { if (el.startsWith('fi-')) e.classList.replace(el, `fi-${location.country.toLowerCase()}`) });
    });
    document.querySelectorAll('.cf-weather-desc-data').forEach((e) => {
        let w = weather.weather[0].description;
        e.innerHTML = w[0].toUpperCase() + w.substr(1).toLowerCase();
    });
    document.querySelectorAll('.cf-press-data').forEach(e => {
        e.innerHTML = `${weather.pressure} hPa`;
        e.ariaLabel = `${weather.pressure} ${aria['unit-hPa']}`;
    })
    document.querySelectorAll('.cf-aqi-desc').forEach((e) => {
        e.innerHTML = cachedLang.airQualityDesc[pollution.main.aqi - 1]
        e.style.color = airQualityColors[pollution.main.aqi - 1]
    });
    document.querySelectorAll('.cf-weather-icon-data').forEach((e) => {
        e.classList.forEach((el) => { if (el.startsWith('bi-')) e.classList.replace(el, icon) });
    });
    document.querySelectorAll('.city-name-data').forEach((e) => {
        e.innerHTML = (location.local_names && location.local_names[settings.lang]) || location.name;
    });
    document.querySelectorAll('.country-code-data').forEach((e) => {
        e.innerHTML = location.country;
    });
    document.querySelectorAll('.cf-sunrise-data').forEach((e) => {
        e.innerHTML = sunriseTime;
        e.title = e.ariaLabel = `${aria["weather-sunrise-at"]} ${sunriseTime}`
    });
    document.querySelectorAll('.cf-sunset-data').forEach((e) => {
        e.innerHTML = sunsetTime;
        e.title = e.ariaLabel = `${aria["weather-sunset-at"]} ${sunsetTime}`
    });
    document.querySelectorAll('.cf-sun-box').forEach((e) => {
        let percentage = currentDaytime < 30 & currentDaytime >= 0 ? currentDaytime / 30 : (daytimeDuration - currentDaytime >= 0 & daytimeDuration - currentDaytime < 30 ? (daytimeDuration - currentDaytime) / 30 : (daytime == 'day' ? 1 : 0));
        e.style.backgroundColor = `hsl(200, ${30 + (percentage * 70)}%, ${10 + (percentage * 75)}%)`;
        document.querySelector('.cf-sun-path').style.borderColor = (daytime == 'day' ? 'black' : 'white');
    });

    //depends on data availability

    if (weather.snow) {
        document.querySelectorAll('.cf-snow-hideable').forEach((e) => {
            e.classList.remove('box-hidden');
            e.ariaHidden = false;
        });
        document.querySelectorAll('.cf-snow-data').forEach((e) => {
            e.innerHTML = `${weather.snow['1h']} mm`;
        });
    }
    else {
        document.querySelectorAll('.cf-snow-hideable').forEach((e) => {
            e.classList.add('box-hidden');
            e.ariaHidden = true;
        });
    }

    if (weather.rain) {
        document.querySelectorAll('.cf-rain-hideable').forEach((e) => {
            e.classList.remove('box-hidden');
            e.ariaHidden = false;
        });
        document.querySelectorAll('.cf-rain-data').forEach((e) => {
            e.innerHTML = `${weather.rain['1h']} mm`;
        });
    }
    else {
        document.querySelectorAll('.cf-rain-hideable').forEach((e) => {
            e.classList.add('box-hidden');
            e.ariaHidden = true;
        });
    }

    if (weather.wind_gust) {
        document.querySelectorAll('.cf-gust-hideable').forEach((e) => {
            e.classList.remove('box-hidden');
            e.ariaHidden = false;
        });
        document.querySelectorAll('.cf-wind-gust-data').forEach((e) => {
            e.innerHTML = `${weather.wind_gust} ${unitsTypes.get(settings.units).wind_speed}`;
            e.ariaLabel = `${weather.wind_gust} ${aria[`unit-${unitsTypes.get(settings.units).wind_speed}`]}`
        });
    }
    else {
        document.querySelectorAll('.cf-gust-hideable').forEach((e) => {
            e.classList.add('box-hidden');
            e.ariaHidden = true;
        });
    } 

    if (daytime == 'day') {
        document.querySelectorAll('.cf-sun-path').forEach((e) => {
            e.style.transform = `rotate(${-65 + (130 * (currentDaytime / daytimeDuration))}deg)`;
        });
    }
    else {
        document.querySelectorAll('.cf-sun-path').forEach((e) => {
            e.style.transform = 'rotate(-80deg)';
        });
    }
}

export { currentForecast };