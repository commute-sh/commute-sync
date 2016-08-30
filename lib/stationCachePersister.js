'use strict';

const _ = require('lodash');
const Cache = require('../lib/cache');
const geoRedis = require('georedis');
const Promise = require('bluebird');

exports.persist = function(station) {

    const cache = Cache.create();
    const Geo = geoRedis.initialize(cache);

    const contractName = station.contract_name;
    const stationKey = `${contractName}_${station.number}`;

    var geo = Promise.promisifyAll(Geo.addSet('stations'));

    console.log(`[INFO] Persisting station ${station.number} to cache with key: ${stationKey}`);
    console.log(`[INFO] Persisting station ${station.number} geoloc to cache`);

    return Promise.all([
        cache.setAsync(stationKey, JSON.stringify(station)),
        geo.addLocationAsync(station.number, { latitude: station.position.lat, longitude: station.position.lng })
    ]);
    
};
