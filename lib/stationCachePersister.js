'use strict';

const _ = require('lodash');
const Cache = require('../lib/cache');
const Promise = require('bluebird');

exports.persist = function(station) {

    const cache = Cache.create();

    const contractName = station.contract_name;
    const stationKey = `${contractName}_${station.number}`;

    console.log(`[INFO] Persisting station ${station.number} to cache with key: ${stationKey}`);
    console.log(`[INFO] Persisting station ${station.number} geoloc to cache`);

    return Promise.all([
        cache.setAsync(stationKey, JSON.stringify(station)),
        cache.geoaddAsync(`${contractName}_stations`, station.position.lng, station.position.lat, station.number)
    ]);
    
};
