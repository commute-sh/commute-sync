'use strict';

var influx = require('influx');
var Promise = require('bluebird');
var moment = require('moment');

var client = Promise.promisifyAll(influx({
    host : process.env.TSDB_HOST || 'localhost',
    port : process.env.TSDB_PORT || 8086, // optional, default 8086
    protocol : process.env.TSDB_PROTOCOL || 'http', // optional, default 'http'
    username : process.env.TSDB_USER || 'commute',
    password : process.env.TSDB_PASSWORD || 'commute',
    database : process.env.TSDB_DATABASE || 'commute'
}));

exports.persist = function(station) {

    var key = station.contract_name + "_" + station.number;

    console.log(`[INFO] Persisting station ${station.number} to time series database with key: ${key}`);

    var time = moment().unix();

    var point = {
        time: (time - (time % 60)) * 1000,
        available_bikes: station.available_bikes,
        available_bike_stands: station.available_bike_stands
    };

    client.writePoint(key, point, null, function(err, response) { })

};




