"use strict";
exports.__esModule = true;
var rangeProofVerifier_1 = require("./rangeProofVerifier");
var rangeProofProver_1 = require("./rangeProofProver");
var generatorParams_1 = require("./generatorParams");
var RangeProofSystem = /** @class */ (function () {
    function RangeProofSystem() {
    }
    RangeProofSystem.prototype.getProver = function () {
        return new rangeProofProver_1.RangeProofProver();
    };
    RangeProofSystem.prototype.getVerifier = function () {
        return new rangeProofVerifier_1.RangeProofVerifier();
    };
    RangeProofSystem.prototype.generatePublicParams = function (size, group) {
        return generatorParams_1.GeneratorParams.generateParams(size, group);
    };
    return RangeProofSystem;
}());
exports.RangeProofSystem = RangeProofSystem;
