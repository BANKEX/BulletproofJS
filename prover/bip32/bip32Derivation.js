"use strict";
exports.__esModule = true;
var schnorrWitness_1 = require("../schnorrSignature/schnorrWitness");
var buffer_1 = require("buffer");
var bigInteger_1 = require("../bigInteger/bigInteger");
var proofUtil_1 = require("../util/proofUtil");
var utils_1 = require("../elliptic/lib/elliptic/utils");
var ONE = new bigInteger_1.BNCLASS(1);
var emptyBuffer = buffer_1.Buffer.alloc(0);
var chainCode = buffer_1.Buffer.from("BankexFoundation", "ascii");
var crypto = require("crypto");
var BIP32Deriver = /** @class */ (function () {
    function BIP32Deriver() {
    }
    BIP32Deriver.derivePrivate = function (witness, index) {
        var indexBuffer = index.toArrayLike(buffer_1.Buffer, "be", 32);
        var hmac = crypto.createHmac("sha512", chainCode);
        var point = witness.getPublicKey();
        var compressedPoint = point.compress();
        var data = buffer_1.Buffer.concat([compressedPoint, indexBuffer]);
        var I = hmac.update(data).digest();
        utils_1.assert(I.length === 64);
        var q = point.curve.order;
        var I_L = new bigInteger_1.BNCLASS(I.slice(0, 32), 16, "be");
        if (I_L.cmp(q) >= 0) {
            return BIP32Deriver.derivePrivate(witness, index.add(ONE));
        }
        var newPrivateKey = I_L.add(witness.getPrivateKey()).umod(q);
        if (newPrivateKey.isZero()) {
            return BIP32Deriver.derivePrivate(witness, index.add(ONE));
        }
        var newWitness = new schnorrWitness_1.SchnorrWitness(newPrivateKey, proofUtil_1.ProofUtils.randomNumber(), witness.getGenerator());
        var newIndex = index.clone();
        return { newWitness: newWitness, newIndex: newIndex };
    };
    BIP32Deriver.derivePublic = function (publicKey, generator, index) {
        var indexBuffer = index.toArrayLike(buffer_1.Buffer, "be", 32);
        var hmac = crypto.createHmac("sha512", chainCode);
        var point = publicKey;
        var compressedPoint = point.compress();
        var data = buffer_1.Buffer.concat([compressedPoint, indexBuffer]);
        var I = hmac.update(data).digest();
        utils_1.assert(I.length === 64);
        var q = point.curve.order;
        var I_L = new bigInteger_1.BNCLASS(I.slice(0, 32), 16, "be");
        var newPoint = generator.mul(I_L);
        if (I_L.cmp(q) >= 0) {
            return BIP32Deriver.derivePublic(publicKey, generator, index.add(ONE));
        }
        var newPublicKey = newPoint.add(point);
        if (newPublicKey.isInfinity()) {
            return BIP32Deriver.derivePublic(publicKey, generator, index.add(ONE));
        }
        var newIndex = index.clone();
        return { newPublicKey: newPublicKey, newIndex: newIndex };
    };
    return BIP32Deriver;
}());
exports.BIP32Deriver = BIP32Deriver;
