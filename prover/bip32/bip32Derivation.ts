import { SchnorrWitness } from "../schnorrSignature/schnorrWitness";
import {Buffer} from "buffer";
import { BigInteger, BNCLASS } from "../bigInteger/bigInteger";
import { ECPoint } from "../curve/curve";
import { ProofUtils } from "../util/proofUtil";
import { assert } from "../elliptic/lib/elliptic/utils";
const ONE = new BNCLASS(1);
const emptyBuffer = Buffer.alloc(0);
type Buffer = typeof emptyBuffer;
const chainCode = Buffer.from("BankexFoundation", "ascii")
import crypto = require("crypto");

export class BIP32Deriver {
    public static derivePrivate(witness: SchnorrWitness, index: BigInteger): {newWitness: SchnorrWitness, newIndex: BigInteger} {
        const indexBuffer = index.toArrayLike(Buffer, "be", 32);
        const hmac = crypto.createHmac("sha512", chainCode);
        const point = witness.getPublicKey();
        const compressedPoint = point.compress();
        const data = Buffer.concat([compressedPoint, indexBuffer]);
        const I = hmac.update(data).digest();
        assert(I.length === 64);
        const q = point.curve.order;
        const I_L = new BNCLASS(I.slice(0, 32), 16, "be");
        if (I_L.cmp(q) >= 0) {
            return BIP32Deriver.derivePrivate(witness, index.add(ONE));
        }
        
        const newPrivateKey = I_L.add(witness.getPrivateKey()).umod(q);
        if (newPrivateKey.isZero()) {
            return BIP32Deriver.derivePrivate(witness, index.add(ONE));
        }
        const newWitness = new SchnorrWitness(newPrivateKey, ProofUtils.randomNumber(), witness.getGenerator());
        const newIndex = index.clone() as BigInteger;
        return {newWitness, newIndex};
    }

    public static derivePublic(publicKey: ECPoint, generator: ECPoint, index: BigInteger): {newPublicKey: ECPoint, newIndex: BigInteger} {
        const indexBuffer = index.toArrayLike(Buffer, "be", 32);
        const hmac = crypto.createHmac("sha512", chainCode);
        const point = publicKey;
        const compressedPoint = point.compress();
        const data = Buffer.concat([compressedPoint, indexBuffer]);
        const I = hmac.update(data).digest();
        assert(I.length === 64);
        const q = point.curve.order;
        const I_L = new BNCLASS(I.slice(0, 32), 16, "be");
        const newPoint = generator.mul(I_L);
        if (I_L.cmp(q) >= 0) {
            return BIP32Deriver.derivePublic(publicKey, generator, index.add(ONE));
        }
        const newPublicKey = newPoint.add(point);
        if (newPublicKey.isInfinity()) {
            return BIP32Deriver.derivePublic(publicKey, generator, index.add(ONE));
        }
        const newIndex = index.clone() as BigInteger;
        return {newPublicKey, newIndex};
    }

}