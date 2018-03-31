"use strict";
exports.__esModule = true;
var bigInteger_1 = require("../bigInteger/bigInteger");
var buffer_1 = require("buffer");
var ethereumjs_util_1 = require("ethereumjs-util");
var schnorrSignature_1 = require("./schnorrSignature");
var emptyBuffer = buffer_1.Buffer.alloc(0);
var SchnorrSigner = /** @class */ (function () {
    function SchnorrSigner() {
    }
    SchnorrSigner.prototype.sign = function (data, witness) {
        var X = witness.getR();
        var xBuffer = X.serialize(true);
        var pkBuffer = witness.getPublicKey().serialize(true);
        var hash = ethereumjs_util_1.sha3(buffer_1.Buffer.concat([xBuffer, pkBuffer, data]));
        var e = new bigInteger_1.BNCLASS(hash, 16, "be");
        var x_E = witness.getPrivateKey().mul(e).umod(witness.getGenerator().curve.order);
        var s = witness.getRandomness().sub(x_E).umod(witness.getGenerator().curve.order);
        return new schnorrSignature_1.SchnorrSignature(s, e, witness.getGenerator());
    };
    return SchnorrSigner;
}());
exports.SchnorrSigner = SchnorrSigner;
