"use strict";
exports.__esModule = true;
var multiRangeProofVerifier_1 = require("./multiRangeProofVerifier");
var multiRangeProofProver_1 = require("./multiRangeProofProver");
var generatorParams_1 = require("../rangeProof/generatorParams");
var RangeProofSystem = /** @class */ (function () {
    function RangeProofSystem() {
    }
    RangeProofSystem.prototype.getProver = function () {
        return new multiRangeProofProver_1.MultiRangeProofProver();
    };
    RangeProofSystem.prototype.getVerifier = function () {
        return new multiRangeProofVerifier_1.MultiRangeProofVerifier();
    };
    RangeProofSystem.prototype.generatePublicParams = function (size, group) {
        return generatorParams_1.GeneratorParams.generateParams(size, group);
    };
    return RangeProofSystem;
}());
exports.RangeProofSystem = RangeProofSystem;
