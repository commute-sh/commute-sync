const inherits = require('inherits');
const _ = require('lodash');
const Promise = require('bluebird');

const Client_SQLite3 = require('knex/lib/dialects/sqlite3');

function Client_Spatialite(config) {
  Client_SQLite3.call(this, config);
  if (_.isUndefined(config.useNullAsDefault)) {
    console.warn(
        'spatialite does not support inserting default values. Set the ' +
        '`useNullAsDefault` flag to hide this warning. ' +
        '(see docs http://knexjs.org/#Builder-insert).'
    );
  }
}
inherits(Client_Spatialite, Client_SQLite3);
_.assign(Client_Spatialite.prototype, {

    driverName: 'spatialite',

    _driver() {
        return require('spatialite')
    },

    // Get a raw connection from the database, returning a promise with the connection object.
    acquireRawConnection() {
        const client = this;
        return new Promise(function(resolve, reject) {
            const db = new client.driver.Database(client.connectionSettings.filename);
            db.spatialite(function(err) {
                if (err) return reject(err);
                resolve(db)
            })
        })
    },

});

module.exports =  Client_Spatialite;