'use strict';

const Promise = require('bluebird');

const Cache = require('../lib/cache');

/** AWS Lambda event handler */
exports.fetch = function(contractName) {

    const cache = Cache.create();

    return cache.getAsync(`${contractName}_images`).then(images => {
        if (images) {
            console.log(`[INFO] Found images in cache. Returning ${images.length} image infos.`);
            return Promise.resolve(images);
        } else {
            console.log(`[INFO] Did not found images in cache. Loading them from AWS ...`);

            return new Promise(function (resolve, reject) {

                const AWS = require('aws-sdk');
                const s3Bucket = process.env.S3_BUCKET;
                const s3 = new AWS.S3();

                console.log(`[INFO] Fetching stations images for contract with name: '${contractName}'`);

                s3.getObject({
                    Bucket: s3Bucket,
                    Key: `contracts/${contractName}/images.json`,
                    ResponseContentType : 'application/json'
                }, function(err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        const fileContents = data.Body.toString();
                        const images = JSON.parse(fileContents);

                        console.log(`[INFO] Saving ${images.length} image infos to cache entry with key '${contractName}_images'.`);
                        cache.setAsync(`${contractName}_images`, JSON.stringify(images));
                        resolve(images);
                    }
                });

            });

        }
    });




};
