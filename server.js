const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const weather_database = require('./database/weather_database');

const app = express();
const port = 3000;
app.listen(port, () =>
    console.log(`Server booted up and listening at http://localhost:${port}`)
);
app.use(cors());

const apiKey = 'O1XAGUnPQv0VxIiDzQTITaBbUAX1aH7n';
//const apiKey = "ZSTWOA1o8MlVaxWo79PfdAqvYYeEU8gJ";
//const apiKey = 'JSAz93UV0ixfmyqkwA4vlbNx1FB3KCdA';

let serverCache = {};

const useDB = false;

//"type" paramater should be a string that is either "zip" or "ip"
async function getLocationKey(param, type = 'ip') {
    if (useDB) {
        const exists = await weather_database.location_key_exists(param);
        if (exists) {
            return await weather_database.get_location_key(param);
        }
    }
    if (!serverCache[param]) {
        let url = `http://dataservice.accuweather.com`;
        if (type === 'zip') {
            //url for zip code
            url =
                url +
                `/locations/v1/postalcodes/search?apikey=${apiKey}&q=${param}&language=en-us&details=false`;
        } else if (type === 'ip') {
            //url for ip address
            url =
                url +
                `/locations/v1/cities/ipaddress?apikey=${apiKey}&q=${param}&language=en-us&details=false`;
        } else {
            console.log(
                'In getLocationKey()... incorrect type has been provided'
            );
        }
        const promise = new Promise((resolve, reject) => {
            fetch(url)
                .then((response) => response.text())
                .then((result) => {
                    var obj = JSON.parse(result);
                    // console.log(`Retrieved location key for (1): ${param}`);
                    key = obj.Key;
                    if (useDB) {
                        weather_database.store_location_key(key, param);
                    }
                    resolve(key);
                });
        });
        const myPromise = await promise;
        serverCache[param] = myPromise;
        console.log(
            `Nothing in cache, fetched getLocationKey response: `,
            myPromise
        );
        return myPromise;
    } else {
        console.log(`Returning from getLocationKey cache`);
        return serverCache[param];
    }
}

async function getCurrentConditions(locationKey) {
    console.log(
        `Fetching current conditions for location key (2): ${locationKey}`
    );
    if (!serverCache['getCurrentConditions']) {
        const promise = new Promise((resolve, reject) => {
            fetch(
                `http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}&language=en-us&details=false`
            )
                .then((response) => response.text())
                .then((result) => {
                    var obj = JSON.parse(result);
                    console.log(
                        `Retrieved current conditions for location key (3): ${locationKey}`
                    );
                    console.log(obj);
                    resolve(obj);
                });
        });
        const myPromise = await promise;
        serverCache['getCurrentConditions'] = myPromise;
        console.log(
            `Nothing in cache, fetched getCurrentConditions response: `,
            myPromise
        );
        return myPromise;
    } else {
        console.log(`Returning from getCurrentConditions cache`);
        return serverCache['getCurrentConditions'];
    }
}

async function getFiveDayForecast(locationKey) {
    if (!serverCache['getFiveDayForecast']) {
        const promise = new Promise((resolve, reject) => {
            fetch(
                `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}?apikey=${apiKey}&language=en-us&details=false&metric=false`
            )
                .then((response) => response.text())
                .then((result) => {
                    var obj = JSON.parse(result);
                    console.log(
                        `Retrieved 5 day forecast for location key(8): ${locationKey}`
                    );

                    resolve(obj);
                });
        });
        const myPromise = await promise;
        serverCache['getFiveDayForecast'] = myPromise;
        console.log(
            `Nothing in cache, fetched getFiveDayForecast response: `,
            myPromise
        );
        return myPromise;
    } else {
        console.log(`Returning from getFiveDayForecast cache`);
        return serverCache['getFiveDayForecast'];
    }
}
//get function that returns current conditions when given an IP
app.get(`/current_conditions_with_IP/:ip`, async (req, res) => {
    // const locationKey = (await weather_database.location_key_exists(
    //     req.params.ip
    // ))
    //     ? await weather_database.get_location_key(req.params.ip)
    //     : await getLocationKey(req.params.ip, 'ip');

    const locationKey = await getLocationKey(req.params.ip);
    const currentConditionsRes = await getCurrentConditions(locationKey);
    res.send(currentConditionsRes);
});

app.get(`/5_day_forecast_with_IP/:ip`, async (req, res) => {
    // const locationKey = (await weather_database.location_key_exists(
    //     req.params.ip
    // ))
    //     ? await weather_database.get_location_key(req.params.ip)
    //     : await getLocationKey(req.params.ip, 'ip');

    const locationKey = await getLocationKey(req.params.ip);
    const fiveDayForecastRes = await getFiveDayForecast(locationKey);
    res.send(fiveDayForecastRes);
});
