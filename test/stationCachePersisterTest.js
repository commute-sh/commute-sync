
const chai = require('chai');
const fs = require('fs');
const expect = require('chai').expect;
const sinon = require('sinon');
const FakeRedis = require('fakeredis');
const Cache = require('../lib/cache');
const Promise = require('bluebird');

const geoRedis = require('georedis');
const stationCachePersister = require('../lib/stationCachePersister');

describe('Station Cache Persister', () => {

    const stations = JSON.parse(fs.readFileSync('./data/stations.json'));

    Promise.promisifyAll(FakeRedis.RedisClient.prototype);
    Promise.promisifyAll(FakeRedis.Multi.prototype);

    const fakeClient = FakeRedis.createClient();

    before((done) => {
        sinon
            .stub(Cache, 'create')
            .returns(fakeClient);

        done();
    });

    after(function(done) {
        Cache.create.restore();
        done()
    });

    afterEach(function(done){
        fakeClient.flushdb(function(err) {
            done(err);
        });
    });

    it('Should Persist station', (done) => {

        const station = stations[0];

        const expectedLocation = {
            latitude: 48.864528089761734,
            longitude: 2.416168749332428
        };

        const Geo = geoRedis.initialize(fakeClient);
        const geo = Promise.promisifyAll(Geo.addSet('stations'));

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
            status: "OPEN"
        };

        stationCachePersister.persist(station)
            .then(() => {
                return Promise.all([
                    fakeClient.getAsync('Paris_31705').then(result => expect(JSON.parse(result)).to.eql(expectedStation)),
                    geo.locationAsync(31705).then(result => expect(result).to.eql(expectedLocation))
                  ]).then(() => done());
            })
            .catch((err) => {
                done(err);
            });
    });
});