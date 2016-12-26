const stationFetcher = require('./lib/stationFetcher');
const stationTsDbPersister = require('./lib/stationTsDbPersister');
const stationCachePersister = require('./lib/stationCachePersister');

const Promise = require('bluebird');

const AWS = require('aws-sdk');


const city = process.env.CITY;
const apiKey = process.env.API_KEY;
const profile = process.env.AWS_PROFILE;

AWS.CredentialProviderChain.defaultProviders = [
    function () { return new AWS.EnvironmentCredentials('AWS'); },
    function () { return new AWS.EnvironmentCredentials('AMAZON'); },
    function () { return new AWS.SharedIniFileCredentials({ profile: profile }); },
    function () { return new AWS.CredentialsEC2MetadataCredentials(); }
];


stationFetcher.fetch(city, apiKey).then((stations) => {
    return Promise.map(stations, function(station) {
        return Promise.all([
            stationTsDbPersister.persist(station),
            stationCachePersister.persist(station)
        ]);
    }, { concurrency: 1 });
}).then(() => {
    console.log('[INFO] Done !');
    process.exit(0);
}).catch((err) => {
    console.error(`[ERROR] ${err.message} - stack: ${err.stack}`);
});


