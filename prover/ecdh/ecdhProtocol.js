"use strict";
exports.__esModule = true;
var ECDHProtocol = /** @class */ (function () {
    function ECDHProtocol(witness, otherSideKey) {
        this.witness = witness;
        this.otherSideKey = otherSideKey;
    }
    ECDHProtocol.prototype.getAgreedKey = function () {
        return this.otherSideKey.mul(this.witness.getRandomness()).getX();
    };
    return ECDHProtocol;
}());
exports.ECDHProtocol = ECDHProtocol;
