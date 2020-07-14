const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3000;
app.listen(port, () => console.log(`Server booted up and listening at http://localhost:${port}`));
app.use(cors());

//current apiKEY

// const apiKey = "O1XAGUnPQv0VxIiDzQTITaBbUAX1aH7n";
const apiKey = "ZSTWOA1o8MlVaxWo79PfdAqvYYeEU8gJ";
// const apiKey = 'JSAz93UV0ixfmyqkwA4vlbNx1FB3KCdA';

let serverCache = {};

//get function that returns current conditions when given an IP
app.get(`/current_conditions_with_IP/:ip`, async (req, res) => {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };
    var key = "this didnt work";
    const promise = new Promise((resolve, reject) => {
        console.log(`Fetching location key for IP Address: ${req.params.ip}`);

        serverCache['current_conditions_with_IP'] = serverCache['current_conditions_with_IP'] ? serverCache['current_conditions_with_IP'] : {};

        const cacheExists = !!serverCache['current_conditions_with_IP'][req.params.ip];

        if (cacheExists) {
            return resolve(serverCache['current_conditions_with_IP'][req.params.ip]);
        } else {
            fetch(`http://dataservice.accuweather.com/locations/v1/cities/ipaddress?apikey=${apiKey}&q=${req.params.ip}&language=en-us&details=false`, requestOptions)
                .then(response => response.text())
                .then(result => {
                    var obj = JSON.parse(result);
                    console.log(`Retrieved location key for IP Address (1): ${req.params.ip}`);
                    key = obj.Key;
                    console.log(`Fetchin current conditions for IP Address (2): ${req.params.ip}`);
                    fetch(`http://dataservice.accuweather.com/currentconditions/v1/${key}?apikey=${apiKey}&language=en-us&details=false`, requestOptions)
                        .then(response => response.text())
                        .then(result => {
                            var obj = JSON.parse(result);
                            serverCache['current_conditions_with_IP'][req.params.ip] = obj; // store cache
                            console.log(`Stored in cache serverCache['current_conditions_with_IP'][req.params.ip] : ${serverCache['current_conditions_with_IP'][req.params.ip]}`);
                            console.log(`Retrieved current conditions for IP Address: ${req.params.ip}`);
                            console.log(obj);
                            resolve(obj);
                        });
                });
        }

    });
    const myPromise = await promise;
    res.send(myPromise);
});
app.get(`/5_day_forecast_with_IP/:ip`, async (req, res) => {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };
    var key = "this didnt work";
    const promise = new Promise((resolve, reject) => {
        console.log(`Fetching location key for IP Address: ${req.params.ip}`);

        serverCache['5_day_forecast_with_IP'] = serverCache['5_day_forecast_with_IP'] || {};
        const cacheExists = serverCache['5_day_forecast_with_IP'][req.params.ip];

        if (cacheExists) {
            resolve(serverCache['5_day_forecast_with_IP'][req.params.ip]);
        } else {
            fetch(`http://dataservice.accuweather.com/locations/v1/cities/ipaddress?apikey=${apiKey}&q=${req.params.ip}&language=en-us&details=false`, requestOptions)
                .then(response => response.text())
                .then(result => {
                    var obj = JSON.parse(result);
                    console.log(`Retrieved location key for IP Address: ${req.params.ip}`);
                    key = obj.Key;
                    console.log(`Fetchin 5 day forecast for IP Address: ${req.params.ip}`);
                    fetch(`http://dataservice.accuweather.com/forecasts/v1/daily/5day/${key}?apikey=${apiKey}&language=en-us&details=false&metric=false`, requestOptions)
                        .then(response => response.text())
                        .then(result => {
                            var obj = JSON.parse(result);
                            serverCache['5_day_forecast_with_IP'][req.params.ip] = obj;
                            console.log(`Stored in cache serverCache['5_day_forecast_with_IP'][req.params.ip] : ${serverCache['5_day_forecast_with_IP'][req.params.ip]}`);
                            console.log(`Retrieved 5 day forecast for IP Address: ${req.params.ip}`);
                            resolve(obj);
                        });
                });
        }

    });
    const myPromise = await promise;
    res.send(myPromise);
});

//get function that returns current conditions when given a zip code
app.get(`/location/:zip`, async (req, res) => {
    var key = "this didnt work";
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };
    const promise = new Promise((resolve, reject) => {
        fetch(`http://dataservice.accuweather.com/locations/v1/postalcodes/search?apikey=${apiKey}&q=${req.params.zip}&language=en-us&details=false`, requestOptions)
            .then(response => response.text())
            .then(result => {
                var obj = JSON.parse(result);
                key = obj[0].Key;
                fetch(`http://dataservice.accuweather.com/currentconditions/v1/${key}?apikey=${apiKey}&language=en-us&details=false`, requestOptions)
                    .then(response => response.text())
                    .then(result => {
                        var obj = JSON.parse(result);
                        console.log(obj);
                        resolve(obj);
                    });
            });
    });
    const myPromise = await promise;
    res.send(myPromise);
});


const get_request_options = {
    method: 'GET',
    redirect: 'follow'
};
//endpoints to get location keys
app.get(`location_key_city/:city`, (req, res) => {
    //city search still needs to be finished, its a little complicated right now
});
app.get(`/location_key_zip/:zip_code`, async (req, res) => {
    console.log("we in this bitch dawg");
    const promise = new Promise((resolve, reject) => {
        fetch(`http://dataservice.accuweather.com/locations/v1/postalcodes/search?apikey=${apiKey}&q=${req.params.zip_code}&language=en-us&details=false`, get_request_options)
            .then(response => response.text())
            .then(result => {
                const data = JSON.parse(result);
                console.log("we in this bitch dawg");
                resolve(data[0].Key);
            });
    });
    const myPromise = await promise;
    res.send(myPromise);
});
app.get(`location_key_ip/:ip_address`, (req, res) => {

});

//endpoints to get forecasts and current conditions
app.get(`5_day_forecast/:location_key`, (req, res) => {

});
app.get(`12_hour_forecast/:location_key`, (req, res) => {

});
app.get(`current_conditions/:location_key`, (req, res) => {

});
