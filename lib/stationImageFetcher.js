'use strict';

const Promise = require('bluebird');
const AWS = require('aws-sdk');

const s3Bucket = process.env.S3_BUCKET;

const s3 = new AWS.S3();

/** AWS Lambda event handler */
exports.fetch = function(contractName) {

    return new Promise(function (resolve, reject) {

        console.log(`[INFO] Fetching stations images for contract with name: ${contractName}`);

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

                resolve(images);
            }
        });

    });

};
