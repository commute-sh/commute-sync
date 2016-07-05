const wkx = require('wkx');
const _ = require('lodash');

exports.parsePoint = function(buffer) {
    var wellKnownBinary = new Buffer(buffer.length - 38);

    buffer.copy(wellKnownBinary, 0, 1, 2);
    buffer.copy(wellKnownBinary, 1, 39, buffer.length);

    const position = wkx.Geometry.parse(wellKnownBinary);

    return {
        lat: position.x,
        lng: position.y
    };
};

exports.parseWkb = function(obj) {

    if (!Buffer.isBuffer(obj)) {
       return obj;
    }

    const buffer = obj;

    const type = buffer.readUInt8(1);

    if (type === 1) {
        return exports.parsePoint(buffer);
    }

    return buffer;
};


exports.parseWkbProps = function(obj) {
    return _.mapValues(obj, (value) => {
        return Buffer.isBuffer(value) ? exports.parseWkb(value) : value;
    });
};

Buffer.prototype.parseWkb = function() {
    return exports.parsePoint(this);
};
