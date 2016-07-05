var index = require('./lib/stationFetcher');

index.handler({
    City: process.env.CITY,
    ApiKey: process.env.API_KEY,
    S3Bucket: process.env.S3_BUCKET
}, {}, function(err, data) {
    if (err) {
        console.log("[LAMBDA][ERROR]", err.message);
    } else {
        console.log("[LAMBDA][SUCCESS]", data);
    }
});
