"use strict";
exports.__esModule = true;
var proofUtil_1 = require("../util/proofUtil");
var SchnorrWitness = /** @class */ (function () {
    function SchnorrWitness(privateKey, randomness, generator) {
        this.privateKey = privateKey;
        this.randomness = randomness;
        this.generator = generator;
    }
    SchnorrWitness.prototype.getPrivateKey = function () {
        return this.privateKey;
    };
    SchnorrWitness.prototype.getRandomness = function () {
        return this.randomness;
    };
    SchnorrWitness.prototype.getGenerator = function () {
        return this.generator;
    };
    SchnorrWitness.newKey = function (generator) {
        var key = proofUtil_1.ProofUtils.randomNumber();
        while (key.cmp(generator.curve.order) >= 0) {
            key = proofUtil_1.ProofUtils.randomNumber();
        }
        var rand = proofUtil_1.ProofUtils.randomNumber();
        while (rand.cmp(generator.curve.order) >= 0) {
            rand = proofUtil_1.ProofUtils.randomNumber();
        }
        return new SchnorrWitness(key, rand, generator);
    };
    SchnorrWitness.prototype.getR = function () {
        return this.generator.mul(this.randomness);
    };
    SchnorrWitness.prototype.getPublicKey = function () {
        return this.generator.mul(this.privateKey);
    };
    return SchnorrWitness;
}());
exports.SchnorrWitness = SchnorrWitness;
