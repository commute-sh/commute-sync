const request = require('request');
const sinon = require('sinon');
const chai = require('chai');
const fs = require('fs');
const expect = require('chai').expect;

const stationFetcher = require('../lib/stationFetcher');

describe('Station Fetcher', () => {

    const stations = JSON.parse(fs.readFileSync('./data/stations.json'));

    before((done) => {
        sinon
            .stub(request, 'get')
            .yields(null, { statusCode: 200 }, stations);
        done();
    });

    after(function(done){
        request.get.restore();
        done();
    });

    it('Should Fetch stations', (done) => {

        const city = 'Paris';
        const apiKey = process.env.API_KEY;

        stationFetcher.fetch(city, apiKey).then((stations) => {
            expect(stations.length).to.equal(1218);
            done();
        }).catch((err) => {
            done(err);
        });
    });
});