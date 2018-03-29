"use strict";
exports.__esModule = true;
var ethereumjs_util_1 = require("ethereumjs-util");
var bigInteger_1 = require("../bigInteger/bigInteger");
var SecureRandom = require("secure-random");
var buffer_1 = require("buffer");
var emptyBuffer = buffer_1.Buffer.alloc(0);
var ProofUtils = /** @class */ (function () {
    function ProofUtils() {
    }
    ProofUtils.computeChallengeForBigIntegersAndPoints = function (q, ints, points) {
        var buffers = [];
        for (var _i = 0, ints_1 = ints; _i < ints_1.length; _i++) {
            var bi = ints_1[_i];
            var buff = bi.toArrayLike(buffer_1.Buffer, "be", 32);
            buffers.push(buff);
        }
        for (var _a = 0, points_1 = points; _a < points_1.length; _a++) {
            var point = points_1[_a];
            var buff = point.serialize(true);
            buffers.push(buff);
        }
        var hashed = this.keccak256(buffer_1.Buffer.concat(buffers));
        var bn = new bigInteger_1.BNCLASS(hashed, 16, "be").umod(q);
        return bn;
    };
    ProofUtils.computeChallengeForBigIntegers = function (q, ints) {
        var buffers = [];
        for (var _i = 0, ints_2 = ints; _i < ints_2.length; _i++) {
            var bi = ints_2[_i];
            var buff = bi.toArrayLike(buffer_1.Buffer, "be", 32);
            buffers.push(buff);
        }
        var hashed = this.keccak256(buffer_1.Buffer.concat(buffers));
        var bn = new bigInteger_1.BNCLASS(hashed, 16, "be").umod(q);
        return bn;
    };
    ProofUtils.randomNumber = function () {
        // return new BNCLASS(1);
        var buff = SecureRandom(32);
        return new bigInteger_1.BNCLASS(buff, 16, "be");
    };
    ProofUtils.keccak256 = ethereumjs_util_1.sha3;
    ProofUtils.computeChallenge = function (q, points) {
        var buffers = [];
        for (var _i = 0, points_2 = points; _i < points_2.length; _i++) {
            var point = points_2[_i];
            var buff = point.serialize(true);
            buffers.push(buff);
        }
        var hashed = this.keccak256(buffer_1.Buffer.concat(buffers));
        var bn = new bigInteger_1.BNCLASS(hashed, 16, "be").umod(q);
        return bn;
    };
    return ProofUtils;
}());
exports.ProofUtils = ProofUtils;
// public static <T extends GroupElement<T>> BigInteger computeChallenge(BigInteger q,T... points) {
//     return computeChallenge(q, asList(points));
// }
// public static BigInteger challengeFromints(BigInteger q, BigInteger... ints){
//     StringBuilder x = new StringBuilder();
//     for (BigInteger anInt : ints) {
//         x.append(encode(new Uint256(anInt)));
//     }
//     return new BigInteger(1, hexStringToByteArray(sha3(x.toString()))).mod(q);
// }
// public static BigInteger hash(String string) {
//     KECCACK.get().update(string.getBytes());
//     return new BigInteger(KECCACK.get().digest());
// }
// public static BigInteger hash(String id, BigInteger salt) {
//     KECCACK.get().update(id.getBytes());
//     KECCACK.get().update(salt.toByteArray());
//     return new BigInteger(KECCACK.get().digest());
// }
// public static BigInteger randomNumber(int bits) {
//     return new BigInteger(bits, RNG);
// }
// public static BigInteger randomNumber() {
//     return ProofUtils.randomNumber(256);
// }
// static {
//     RNG = new SecureRandom();
//     KECCACK = ThreadLocal.withInitial(Keccak.Digest256::new);
// }
// }
