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

export class SchnorrVerifier {
    public verity(data: Buffer, signature: SchnorrSignature, publicKey: ECPoint): Boolean {
        const g_S = signature.getGenerator().mul(signature.getS());
        const y_E = publicKey.mul(signature.getE());
        const r_V = g_S.add(y_E);
        const r_V_buffer = r_V.serialize(true);
        const pkBuffer = publicKey.serialize(true);
        const e_V_buffer = sha3(Buffer.concat([r_V_buffer, pkBuffer, data]));
        let e_V = new BNCLASS(e_V_buffer, 16, "be");
        return e_V.cmp(signature.getE()) == 0;
    }
}