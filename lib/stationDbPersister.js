'use strict';

const _ = require('lodash');
const db = require('../lib/db');

exports.persist = function(station) {

    const knex = db.create();
    const st = require('knex-postgis')(knex);

    console.log(`[INFO] Persisting station ${station.number} to database`);
    
    const stationToPersist = _.chain().assign({}, station, {
//        position: knex.raw(`geomFromText('Point(${station.position.lat} ${station.position.lng})')`)
        position: st.geomFromText(`Point(${station.position.lat} ${station.position.lng})`)
    }).value();

    return knex('stations').insert(stationToPersist);
};




