"use strict";
exports.__esModule = true;
var schnorrSigner_1 = require("./schnorrSigner");
var schnorrVerifier_1 = require("./schnorrVerifier");
var SchnorrSystem = /** @class */ (function () {
    function SchnorrSystem() {
    }
    SchnorrSystem.prototype.getSigner = function () {
        return new schnorrSigner_1.SchnorrSigner();
    };
    SchnorrSystem.prototype.getVerifier = function () {
        return new schnorrVerifier_1.SchnorrVerifier();
    };
    return SchnorrSystem;
}());
exports.SchnorrSystem = SchnorrSystem;
