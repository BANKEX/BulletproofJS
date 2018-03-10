import {BigInteger, toBI, BNCLASS} from "../bigInteger/bigInteger";
import {ECPoint, ECCurve} from "../curve/curve";
import {Buffer} from "buffer"
import {FieldVector} from "../linearAlgebra/fieldVector";
import {VectorBase} from "../linearAlgebra/vectorBase";
import {InnerProductProof} from "./innerProductProof";
import {ProofUtils} from "../util/proofUtil";
import { assert } from "../elliptic/lib/elliptic/utils";
import {InnerProductWitness} from "./innerProductWitness";
import {InnerProductProver} from "./innerProductProver";
import {EfficientInnerProductVerifier} from "./efficientInnerProductVerifier";
import {GeneratorVector} from "../linearAlgebra/generatorVector";
import {sha3} from "ethereumjs-util"

export class InnerProductProofSystem{

    public getProver(): InnerProductProver {
        return new InnerProductProver();
    }

    public getVerifier(): EfficientInnerProductVerifier {
        return new EfficientInnerProductVerifier();
    }

    public generatePublicParams(size: number, group: ECCurve) {
        const gPoints = [] as ECPoint[]
        const hPoints = [] as ECPoint[]
        for (let i = 0; i < size; i++) {
            const gString = "G"+i
            const gHash = group.hash(Buffer.from(gString, "utf8"))
            const g = group.hashInto(gHash)
            gPoints.push(g)
            let hString = "H"+i
            const hHash = group.hash(Buffer.from(hString, "utf8"))
            const h = group.hashInto(hHash)
            hPoints.push(h)
        }
        const gs = new GeneratorVector(gPoints,group);
        const hs = new GeneratorVector(hPoints,group);
        const hash = group.hash(Buffer.from("V", "utf8"));
        const v = group.hashInto(hash);
        //TODO: This setup has a trapdoor. Just use it for testing. The previous setup is secure.
        // GeneratorVector gs = GeneratorVector.from(VectorX.generate(size, ProofUtils::randomNumber).map(ECConstants.G::multiply));
        // GeneratorVector hs = GeneratorVector.from(VectorX.generate(size, ProofUtils::randomNumber).map(ECConstants.G::multiply));
        // ECPoint v=ECConstants.G.multiply(ProofUtils.randomNumber());
        return new VectorBase(gs, hs, v);
    }
}