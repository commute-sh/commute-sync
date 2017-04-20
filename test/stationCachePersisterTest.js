
const chai = require('chai');
const fs = require('fs');
const expect = require('chai').expect;
const Cache = require('../lib/cache');
const Promise = require('bluebird');
const _ = require('lodash');

const stationCachePersister = require('../lib/stationCachePersister');

describe('Station Cache Persister', () => {

    const stations = JSON.parse(fs.readFileSync('./data/stations.json'));

    const cache = Cache.create();

    before((done) => {

        cache.select(1, function(err, res) {
            done(err, res);
        })
    });

    after(function(done) {
        done()
    });

    afterEach(function(done){
        cache.flushdb(function(err) {
            done(err);
        });
    });

    it('Should Persist station', (done) => {

        const station = stations[0];

        const expectedLocation = {
            latitude: 48.864528089761734,
            longitude: 2.416168749332428
        };

        const expectedStation = {
            address: "RUE DES CHAMPEAUX (PRES DE LA GARE ROUTIERE) - 93170 BAGNOLET",
            available_bike_stands: 48,
            available_bikes: 2,
            banking: true,
            bike_stands: 50,
            bonus: true,
            contract_name: "Paris",
            last_update: 1467555000000,
            name: "31705 - CHAMPEAUX (BAGNOLET)",
            number: 31705,
            position: {
                lat: 48.8645278209514,
                lng: 2.416170724425901
            },
            status: "OPEN",
            distance: 0
        };

        stationCachePersister.persist(station)
            .then(() => {

                cache.georadiusAsync(`Paris_stations`, expectedLocation.longitude, expectedLocation.latitude, 100, 'km', 'WITHDIST', 'ASC')
                    .then(entries => {
                        const keys = entries.map(([stationNumber, _]) => `Paris_${stationNumber}`);

                        return cache.mgetAsync(keys)
                            .then(_.flatten)
                            .map(JSON.parse)
                            .then ((results) => {
                                const stations = _.fromPairs(_.map(entries, i => [i[0], Number(i[1])]));
                                console.log("Stations:", stations);
                                const resultsMapped = results
                                    .map((station) => {
                                        station.distance = stations[station.number] || 0;
                                        return station;
                                    });
                                return resultsMapped;
                            })
                            .filter(filterStation(31705))
                            .then((results) => {
                                console.log('results[0]:', results[0]);
                                console.log('expectedStation:', expectedStation);
                                expect(results[0]).to.eql(expectedStation)
                                done();
                            })
                    });

            })
            .catch((err) => {
                done(err);
            });
    });
});

function filterStation(stationNumber) {
    return (station) => station.number === stationNumber
}