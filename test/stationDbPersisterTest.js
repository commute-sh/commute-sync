
const chai = require('chai');
const fs = require('fs');
const expect = require('chai').expect;
const sinon = require('sinon');
const Knex = require('knex');
const db = require('../lib/db');
const Client_Spatialite = require('../lib/spatialite');
const _ = require('lodash');
const wkx = require('../lib/wkx');

const stationDbPersister = require('../lib/stationDbPersister');

describe('Station Db Persister', () => {

    const stations = JSON.parse(fs.readFileSync('../data/stations.json'));

    const knex = Knex({
        client: Client_Spatialite,
        connection: { filename: ':memory:', useNullAsDefault: true, bailAfter: Infinity }
    });

    before((done) => {

        sinon
        .stub(db, 'create')
        .returns(knex);

        knex.schema.createTable('stations', function(t) {
            t.increments().primary();
            t.string('address', 128);
            t.integer('available_bike_stands');
            t.integer('available_bikes');
            t.boolean('banking');
            t.integer('bike_stands');
            t.boolean('bonus');
            t.string('contract_name', 128);
            t.timestamp('last_update');
            t.string('name', 128);
            t.integer('number');
            t.specificType('position', 'POINT');
            t.enum('status', ['OPEN', 'CLOSED']);
            t.timestamps();
        })
            .then(() => done())
            .catch((err) => done(err));
    });

    after(function(done) {
         db.create.restore();

        knex.schema.dropTable('stations')
            .then(() => done())
            .catch((err) => done(err));
    });

    it('Should Persist station', (done) => {

        const station = stations[0];

        const expectedStation = {
            address: "RUE DES CHAMPEAUX (PRES DE LA GARE ROUTIERE) - 93170 BAGNOLET",
            available_bike_stands: 48,
            available_bikes: 2,
            banking: 1,
            bike_stands: 50,
            bonus: 1,
            contract_name: "Paris",
            created_at: null,
            id: 1,
            last_update: 1467555000000,
            name: "31705 - CHAMPEAUX (BAGNOLET)",
            number: 31705,
            position: {
                lat: 48.8645278209514,
                lng: 2.416170724425901
            },
            status: "OPEN",
            updated_at: null
        };

        stationDbPersister.persist(station)
            .then(() => {
                return Promise.all([
                    knex('stations').count('* as count').first().then(result => expect(result.count).to.equal(1)),
                    knex('stations').select().first().then(wkx.parseWkbProps).then(result => expect(result).to.eql(expectedStation))
                  ]).then(() => done());
            })
            .catch((err) => {
                done(err);
            });
    });
});