import { settings, weatherIcons, cachedLang, nightWeatherIcons, unitsTypes, chartLimits } from "./read_storage.min.js";

function dailyForecast(data)
{
    const chartColumns = Array.from(document.querySelectorAll('.df-chart-col'));
    const chartData = Array.from(document.querySelectorAll('.df-hourly-weather-info'));
    const dataSelect = document.querySelector('.df-data-type');
    const dataType = dataSelect.value;
    const weather = data.weather.hourly;
    const vals = [];
    const aria = cachedLang.aria;
    weather.forEach(e => {vals.push(e[dataType])});

    const minValue = Math.min(...vals);
    const maxValue = Math.max(...vals);
    let minLimit = chartLimits.get(settings.units)[dataType][0];
    let maxLimit = chartLimits.get(settings.units)[dataType][1];
    Math.abs(maxValue) > maxLimit ? maxLimit = maxValue : null;
    Math.abs(minValue) < minLimit ? minLimit = minValue : null; 

    for (let [i, e] of weather.entries()) {
        let date = new Date(e.dt * 1000)
        const time = date.toLocaleTimeString('pl-PL', { timeZone: data.weather.timezone, hour: '2-digit', minute: '2-digit', hourCycle: settings.clockMode });
        const daytime = date.getHours() < 6 || date.getHours() > 18 ? 'night' : 'day';
        const icon = daytime == 'night' ? (nightWeatherIcons.has(e.weather[0].id) ? nightWeatherIcons.get(e.weather[0].id) : weatherIcons.get(e.weather[0].id)) : (weatherIcons.get(e.weather[0].id)); 


        chartData[i].innerHTML = `<p class="df-hour-info">${time}</p>
        <i class="df-weather-icon bi ${icon}"></i>`;
        chartColumns[i].style.maxHeight = `${(Math.abs(e[dataType]) - minLimit) / (maxLimit - minLimit) * 30}vh`;
        chartColumns[i].setAttribute('chart-value', `${dataType == 'temp' ? Math.round(e[dataType]) : e[dataType]} ${unitsTypes.get(settings.units)[dataType]}`);
        chartColumns[i].setAttribute('chart-time', time);
        chartColumns[i].ariaLabel = aria['weather-chart-col-desc'].replace('%data-type', dataSelect[dataSelect.selectedIndex].text).replace('%hour', time).replace('%data', `${dataType == 'temp' ? Math.round(e[dataType]) : e[dataType]} ${dataType == 'pressure' ? aria['unit-hPa'] : (dataType == 'wind_speed' ? aria[`unit-${unitsTypes.get(settings.units)[dataType]}`] : unitsTypes.get(settings.units)[dataType])}`)
        e[dataType] < 0 ? chartColumns[i].classList.replace('chart-col-pos', 'chart-col-neg') : chartColumns[i].classList.replace('chart-col-neg', 'chart-col-pos');
    };

    document.querySelector('.df-chart-max-val').innerHTML = `${dataType == 'temp' ? '± ' + Math.round(maxLimit) : maxLimit} ${unitsTypes.get(settings.units)[dataType]}`;
    document.querySelector('.df-chart-min-val').innerHTML = `${minLimit} ${unitsTypes.get(settings.units)[dataType]}`;
}


export {dailyForecast};