"use strict";
exports.__esModule = true;
var ECDHProtocol = /** @class */ (function () {
    function ECDHProtocol() {
    }
    ECDHProtocol.getAgreedKey = function (witness, otherSideKey) {
        return otherSideKey.mul(witness.getRandomness()).getX();
    };
    ECDHProtocol.getAgreedPoint = function (witness, otherSideKey) {
        return otherSideKey.mul(witness.getRandomness());
    };
    return ECDHProtocol;
}());
exports.ECDHProtocol = ECDHProtocol;
