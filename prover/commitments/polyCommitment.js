"use strict";
exports.__esModule = true;
var peddersenCommitment_1 = require("./peddersenCommitment");
var bigInteger_1 = require("../bigInteger/bigInteger");
var proofUtil_1 = require("../util/proofUtil");
var PolyCommitment = /** @class */ (function () {
    function PolyCommitment(coefficientCommitments) {
        this.coefficientCommitments = coefficientCommitments;
    }
    PolyCommitment.prototype.evaluate = function (x) {
        var ONE = bigInteger_1.toBI(1, 10);
        var multiplier = ONE;
        var res = [this.coefficientCommitments[0].times(ONE)];
        for (var i = 1; i < this.coefficientCommitments.length; i++) {
            multiplier = multiplier.mul(x);
            // .mod(this.coefficientCommitments[0].base.generator.getGroup().order)
            var comm = this.coefficientCommitments[i].times(multiplier);
            res.push(comm);
        }
        var accumulator = res[0];
        for (var i = 1; i < this.coefficientCommitments.length; i++) {
            accumulator = accumulator.add(res[i]);
        }
        return accumulator;
    };
    PolyCommitment.prototype.getCoefficientCommitments = function () {
        return this.coefficientCommitments;
    };
    PolyCommitment.prototype.getNonzeroCommitments = function () {
        var ZERO = bigInteger_1.toBI(0, 10);
        var filtered = this.coefficientCommitments.filter(function (el) {
            return el.getR().cmp(ZERO) !== 0;
        });
        var res = filtered.map(function (el) {
            return el.getCommitment();
        });
        return res;
    };
    PolyCommitment.from = function (base, x0, xs) {
        var res = xs.map(function (el) {
            return new peddersenCommitment_1.PeddersenCommitment(base, el, proofUtil_1.ProofUtils.randomNumber());
        });
        var ZERO = bigInteger_1.toBI(0, 10);
        var toZero = new peddersenCommitment_1.PeddersenCommitment(base, x0, ZERO);
        var peddersenCommitments = [toZero].concat(res);
        return new PolyCommitment(peddersenCommitments);
    };
    return PolyCommitment;
}());
exports.PolyCommitment = PolyCommitment;
