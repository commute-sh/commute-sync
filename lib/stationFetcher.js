'use strict';

var moment = require('moment');
var request = require('request');
var Promise = require('bluebird');

const jcdecauxApiBaseUrl = process.env.JCDECAUX_API_BASE_URL || 'https://api.jcdecaux.com';


/** AWS Lambda event handler */
exports.fetch = function(city, apiKey) {

    return new Promise(function (resolve, reject) {

        const url = `${jcdecauxApiBaseUrl}/vls/v1/stations?contract=${city}&apiKey=${apiKey}`;

        console.log(`[INFO] Fetching stations with URL: ${url}`);

        request.get({ url: url, json: true }, (err, response, body) => {
            if (err) {
                reject(err);
            } else if (response.statusCode >= 300) {
                reject(new Error(`Failed with status code: ${response.statusCode}`));
            } else {
                let stations = body.map((station) => {
                    station.last_update = new Date(station.last_update);
                    return station;
                });

                resolve(stations);
            }
        });

    });

};
