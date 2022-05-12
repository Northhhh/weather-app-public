import { settings, weatherIcons, cachedLang, nightWeatherIcons, unitsTypes, chartLimits, calcTemp, calcWind } from "./read_storage.min.js";

//function sets chart data for specified data type
function dailyForecast(data)
{
    const chartColumns = Array.from(document.querySelectorAll('.df-chart-col'));
    const chartData = Array.from(document.querySelectorAll('.df-hourly-weather-info'));
    const dataSelect = document.querySelector('.df-data-type');
    const dataType = dataSelect.value;
    const weather = data.weather.hourly;
    const vals = [];
    const aria = cachedLang.aria;
    weather.forEach(e => {
        let val;
        if (dataType == 'temp') val = calcTemp(e[dataType], false);
        else if (dataType == 'wind_speed') val = calcWind(e[dataType], false);
        else val = e[dataType];
        vals.push(val);
    });

    const minValue = Math.min(...vals);
    const maxValue = Math.max(...vals);
    
    let minLimit = chartLimits.get(settings.units)[dataType][0];
    let maxLimit = chartLimits.get(settings.units)[dataType][1];
    Math.abs(maxValue) > maxLimit ? maxLimit = maxValue : null;
    Math.abs(minValue) < minLimit ? minLimit = minValue : null; 

    for (let [i, e] of weather.entries()) {
        let date = new Date(e.dt * 1000);
        const time = date.toLocaleTimeString('pl-PL', { timeZone: data.weather.timezone, hour: '2-digit', minute: '2-digit', hourCycle: settings.clockMode });
        const daytime = date.getHours() < 6 || date.getHours() > 18 ? 'night' : 'day';
        const icon = daytime == 'night' ? (nightWeatherIcons.get(e.weather[0].id) || weatherIcons.get(e.weather[0].id)) : (weatherIcons.get(e.weather[0].id)); 

        chartData[i].innerHTML = `<p class="df-hour-info">${time}</p>
        <i class="df-weather-icon bi ${icon}"></i>`;
        chartColumns[i].style.maxHeight = `${(Math.abs(vals[i]) - minLimit) / (maxLimit - minLimit) * 30}vh`;
        chartColumns[i].setAttribute('chart-value', `${vals[i]} ${unitsTypes.get(settings.units)[dataType]}`);
        chartColumns[i].setAttribute('chart-time', time);
        chartColumns[i].ariaLabel = aria['weather-chart-col-desc'].replace('%data-type', dataSelect[dataSelect.selectedIndex].text).replace('%hour', time).replace('%data', `${dataType == 'temp' ? calcTemp(e[dataType], false) : e[dataType]} ${dataType == 'pressure' ? aria['unit-hPa'] : (dataType == 'wind_speed' ? aria[`unit-${unitsTypes.get(settings.units)[dataType]}`] : unitsTypes.get(settings.units)[dataType])}`)
        e[dataType] < 0 ? chartColumns[i].classList.replace('chart-col-pos', 'chart-col-neg') : chartColumns[i].classList.replace('chart-col-neg', 'chart-col-pos');
    };

    document.querySelector('.df-chart-max-val').innerHTML = `${dataType == 'temp' ? '± ' + maxLimit : maxLimit} ${unitsTypes.get(settings.units)[dataType]}`;
    document.querySelector('.df-chart-min-val').innerHTML = `${minLimit} ${unitsTypes.get(settings.units)[dataType]}`;
}

export {dailyForecast};