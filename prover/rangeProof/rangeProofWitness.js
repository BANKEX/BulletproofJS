"use strict";
exports.__esModule = true;
var RangeProofWitness = /** @class */ (function () {
    function RangeProofWitness(number, randomness) {
        this.number = number;
        this.randomness = randomness;
    }
    RangeProofWitness.prototype.getNumber = function () {
        return this.number;
    };
    RangeProofWitness.prototype.getRandomness = function () {
        return this.randomness;
    };
    return RangeProofWitness;
}());
exports.RangeProofWitness = RangeProofWitness;
