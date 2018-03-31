import {BigInteger, toBI, BNCLASS} from "../bigInteger/bigInteger";
import {ECPoint, ECCurve} from "../curve/curve";
import {Buffer} from "buffer"
import {ProofUtils} from "../util/proofUtil";
import { assert } from "../elliptic/lib/elliptic/utils";
import {GeneratorVector} from "../linearAlgebra/generatorVector";
import {sha3} from "ethereumjs-util"
import { SchnorrWitness } from "./schnorrWitness";
import { SchnorrSignature } from "./schnorrSignature";

const emptyBuffer = Buffer.alloc(0);
type Buffer = typeof emptyBuffer;

export class SchnorrSigner {
    public sign(data: Buffer, witness: SchnorrWitness): SchnorrSignature {
        const X = witness.getR();
        const xBuffer = X.serialize(true);
        const pkBuffer = witness.getPublicKey().serialize(true);
        const hash = sha3(Buffer.concat([xBuffer, pkBuffer, data]));
        let e = new BNCLASS(hash, 16, "be");
        const x_E = witness.getPrivateKey().mul(e).umod(witness.getGenerator().curve.order);
        const s = witness.getRandomness().sub(x_E).umod(witness.getGenerator().curve.order);
        return new SchnorrSignature(s, e, witness.getGenerator())

    }
}