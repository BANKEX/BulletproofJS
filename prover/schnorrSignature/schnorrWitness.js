"use strict";
exports.__esModule = true;
var proofUtil_1 = require("../util/proofUtil");
var SchnorrWitness = /** @class */ (function () {
    function SchnorrWitness(privateKey, randomness, group) {
        this.privateKey = privateKey;
        this.randomness = randomness;
        this.group = group;
    }
    SchnorrWitness.prototype.getPrivateKey = function () {
        return this.privateKey;
    };
    SchnorrWitness.prototype.getRandomness = function () {
        return this.randomness;
    };
    SchnorrWitness.prototype.getGroup = function () {
        return this.group;
    };
    SchnorrWitness.newKey = function (group) {
        var key = proofUtil_1.ProofUtils.randomNumber();
        while (key.cmp(group.order) >= 0) {
            key = proofUtil_1.ProofUtils.randomNumber();
        }
        var rand = proofUtil_1.ProofUtils.randomNumber();
        while (rand.cmp(group.order) >= 0) {
            rand = proofUtil_1.ProofUtils.randomNumber();
        }
        return new SchnorrWitness(key, rand, group);
    };
    SchnorrWitness.prototype.getR = function () {
        return this.group.generator.mul(this.randomness);
    };
    SchnorrWitness.prototype.getPublicKey = function () {
        return this.group.generator.mul(this.privateKey);
    };
    return SchnorrWitness;
}());
exports.SchnorrWitness = SchnorrWitness;
