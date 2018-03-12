import {BigInteger, toBI, BNCLASS} from "../bigInteger/bigInteger";
import {ECPoint, ECCurve} from "../curve/curve";
import {Buffer} from "buffer"
import {FieldVector} from "../linearAlgebra/fieldVector";
import {VectorBase} from "../linearAlgebra/vectorBase";
import {ProofUtils} from "../util/proofUtil";
import { assert } from "../elliptic/lib/elliptic/utils";
import {GeneratorVector} from "../linearAlgebra/generatorVector";
import {sha3} from "ethereumjs-util"
import { RangeProofVerifier } from "./rangeProofVerifier";
import { RangeProofProver } from "./rangeProofProver";
import { GeneratorParams } from "./generatorParams";

export class RangeProofSystem{

    public getProver(): RangeProofProver {
        return new RangeProofProver();
    }

    public getVerifier(): RangeProofVerifier {
        return new RangeProofVerifier();
    }

    public generatePublicParams(size: number, group: ECCurve): GeneratorParams {
        return GeneratorParams.generateParams(size, group);
    }
}