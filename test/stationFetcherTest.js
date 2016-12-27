const request = require('request');
const sinon = require('sinon');
const chai = require('chai');
const fs = require('fs');
const expect = require('chai').expect;
const Promise = require('bluebird');
const _ = require('lodash');

const stationFetcher = require('../lib/stationFetcher');
const stationImageFetcher = require('../lib/stationImageFetcher');

describe('Station Fetcher', () => {

    const stations = JSON.parse(fs.readFileSync('./data/stations.json'));

    before((done) => {

        sinon
            .stub(stationImageFetcher, 'fetch')
            .returns(Promise.resolve([{
                number: 44101,
                width: 640,
                quality: 60,
                contractName: 'Paris',
                uid: 1
            }, {
                number: 44101,
                width: 640,
                quality: 60,
                contractName: 'Paris',
                uid: 2
            }]));

        sinon
            .stub(request, 'get')
            .yields(null, { statusCode: 200 }, stations);
        done();
    });

    after(function(done){
        stationImageFetcher.fetch.restore();
        request.get.restore();
        done();
    });

    it('Should Fetch stations', (done) => {

        const contractName = 'Paris';
        const apiKey = process.env.API_KEY;

        stationFetcher.fetch(contractName, apiKey).then((stations) => {

            const station = _.find(stations, station => station.number === 44101);

            console.log('station:', station);

            expect(stations.length).to.equal(1218);
            expect(station.images.length).to.equal(2);
            done();
        }).catch((err) => {
            done(err);
        });
    });
});