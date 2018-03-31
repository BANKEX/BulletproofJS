"use strict";
exports.__esModule = true;
var bigInteger_1 = require("../bigInteger/bigInteger");
var buffer_1 = require("buffer");
var ethereumjs_util_1 = require("ethereumjs-util");
var emptyBuffer = buffer_1.Buffer.alloc(0);
var SchnorrVerifier = /** @class */ (function () {
    function SchnorrVerifier() {
    }
    SchnorrVerifier.prototype.verity = function (data, signature, publicKey) {
        var g_S = signature.getGenerator().mul(signature.getS());
        var y_E = publicKey.mul(signature.getE());
        var r_V = g_S.add(y_E);
        var r_V_buffer = r_V.serialize(true);
        var pkBuffer = publicKey.serialize(true);
        var e_V_buffer = ethereumjs_util_1.sha3(buffer_1.Buffer.concat([r_V_buffer, pkBuffer, data]));
        var e_V = new bigInteger_1.BNCLASS(e_V_buffer, 16, "be");
        return e_V.cmp(signature.getE()) == 0;
    };
    return SchnorrVerifier;
}());
exports.SchnorrVerifier = SchnorrVerifier;
