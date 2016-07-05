const stationFetcher = require('./lib/stationFetcher');
const stationDbPersister = require('./lib/stationDbPersister');
const stationCachePersister = require('./lib/stationCachePersister');

const Promise = require('bluebird');

const city = process.env.CITY;
const apiKey = process.env.API_KEY;

stationFetcher.fetch(city, apiKey).then((stations) => {
    return Promise.map(stations, function(station) {
        return Promise.all([
            stationDbPersister.persist(station),
            stationCachePersister.persist(station)
        ]);
    }, { concurrency: 1 });
}).then(() => {
    console.log('[INFO] Done !');
    process.exit(0);
}).catch((err) => {
    console.error(`[ERROR] ${err.message} - stack: ${err.stack}`);
});


