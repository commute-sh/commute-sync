'use strict';

const moment = require('moment');
const request = require('request');
const Promise = require('bluebird');
const _ = require('lodash');

const jcdecauxApiBaseUrl = process.env.JCDECAUX_API_BASE_URL || 'https://api.jcdecaux.com';

const s3ImageFetcher = require('./stationImageFetcher');

/** AWS Lambda event handler */
exports.fetch = function(contractName, apiKey) {

    return new Promise(function (resolve, reject) {

        const url = `${jcdecauxApiBaseUrl}/vls/v1/stations?contract=${contractName}&apiKey=${apiKey}`;

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

                s3ImageFetcher.fetch(contractName).then(images => {

                    const imagesByNumber = _.groupBy(images, 'number');

                    stations.forEach(station => {
                        station.images = _.map(imagesByNumber[station.number] || [], image => _.omit(image, 'contractName'));

                        return station;
                    });

                    resolve(stations);
                }).catch(err => {
                    reject(err);
                });
            }
        });

    });

};
