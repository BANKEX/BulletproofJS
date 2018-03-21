import {BigInteger, toBI, BNCLASS} from "../bigInteger/bigInteger";
import {ECPoint, ECCurve} from "../curve/curve";
import {Buffer} from "buffer"
import {FieldVector} from "../linearAlgebra/fieldVector";
import {VectorBase} from "../linearAlgebra/vectorBase";
import {ProofUtils} from "../util/proofUtil";
import { assert } from "../elliptic/lib/elliptic/utils";
import {GeneratorVector} from "../linearAlgebra/generatorVector";
import {sha3} from "ethereumjs-util"
import { SchnorrSigner } from "./schnorrSigner";
import { SchnorrVerifier } from "./schnorrVerifier";

export class SchnorrSystem{

    public getSigner(): SchnorrSigner {
        return new SchnorrSigner ();
    }

    public getVerifier(): SchnorrVerifier {
        return new SchnorrVerifier();
    }
}