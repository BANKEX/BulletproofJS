"use strict";
exports.__esModule = true;
var proofUtil_1 = require("../util/proofUtil");
var ECDHWitness = /** @class */ (function () {
    function ECDHWitness(randomness, generator) {
        this.randomness = randomness;
        this.generator = generator;
    }
    ECDHWitness.prototype.getRandomness = function () {
        return this.randomness;
    };
    ECDHWitness.prototype.getGenerator = function () {
        return this.generator;
    };
    ECDHWitness.newKey = function (generator) {
        var rand = proofUtil_1.ProofUtils.randomNumber();
        while (rand.cmp(generator.curve.order) >= 0) {
            rand = proofUtil_1.ProofUtils.randomNumber();
        }
        return new ECDHWitness(rand, generator);
    };
    ECDHWitness.prototype.getKey = function () {
        return this.generator.mul(this.randomness);
    };
    return ECDHWitness;
}());
exports.ECDHWitness = ECDHWitness;
