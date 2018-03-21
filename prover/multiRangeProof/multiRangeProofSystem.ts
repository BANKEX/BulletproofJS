import {BigInteger, toBI, BNCLASS} from "../bigInteger/bigInteger";
import {ECPoint, ECCurve} from "../curve/curve";
import {Buffer} from "buffer"
import {FieldVector} from "../linearAlgebra/fieldVector";
import {VectorBase} from "../linearAlgebra/vectorBase";
import {ProofUtils} from "../util/proofUtil";
import { assert } from "../elliptic/lib/elliptic/utils";
import {GeneratorVector} from "../linearAlgebra/generatorVector";
import {sha3} from "ethereumjs-util"
import { MultiRangeProofVerifier } from "./multiRangeProofVerifier";
import { MultiRangeProofProver } from "./multiRangeProofProver";
import { GeneratorParams } from "../rangeProof/generatorParams";

export class RangeProofSystem{

    public getProver(): MultiRangeProofProver {
        return new MultiRangeProofProver();
    }

    public getVerifier(): MultiRangeProofVerifier {
        return new MultiRangeProofVerifier();
    }

    public generatePublicParams(size: number, group: ECCurve): GeneratorParams {
        return GeneratorParams.generateParams(size, group);
    }
}