import {BigInteger, toBI} from "../bigInteger/bigInteger";
import {ECPoint} from "../curve/curve";
import {Buffer} from "buffer"
import {FieldVector} from "../linearAlgebra/fieldVector";
import {VectorBase} from "../linearAlgebra/vectorBase";
import {InnerProductProof} from "./innerProductProof";
import {ProofUtils} from "../util/proofUtil";
import { assert } from "../elliptic/lib/elliptic/utils";
import {InnerProductWitness} from "./innerProductWitness";
import {InnerProductProver} from "./innerProductProver";

export class EfficientInnerProductVerifier {
    constructor() {

    }

    public verify(params: VectorBase, c: ECPoint, proof: InnerProductProof) : Boolean {
        const ls = proof.getL();
        const rs = proof.getR();
        const ONE = toBI(1, 10);
        const TWO = toBI(2, 10);
        let challenges = [] as BigInteger[]
        const inverseChallenges = [] as BigInteger[]
        const q = params.getGs().getCurve().order;
        for (let i = 0; i < ls.length; ++i) {
            const l = ls[i];
            const r = rs[i];
            // console.log(l.getX().toString(16));
            // console.log(l.getY().toString(16));
            const x = ProofUtils.computeChallenge(q, [l, c, r]);
            challenges.push(x);
            const xInv = x.invm(q) as BigInteger;
            inverseChallenges.push(xInv);
            c = l.mul(x.pow(TWO)).add(r.mul(xInv.pow(TWO))).add(c);
            // console.log(x.toString(16));
            // console.log(c.getX().toString(16));
        }
        const n = params.getGs().size() as number;
        const otherExponents = [] as BigInteger[];
        for (let i = 0; i < n; i++) {
            otherExponents.push(toBI(0, 10));
        }
        otherExponents[0] = challenges.reduce((prev, current) => {
            return prev.mul(current).umod(q)
        }, ONE).invm(q)
        challenges = challenges.reverse()
        let bitSet = toBI(0, 10);
        const n_t = toBI(n, 10);
        for (let i = 0; i < n/2; i++) {
            var i_t = toBI(i, 10);
            var j=0;
            do {
                var shifted = ONE.shln(j);
                if (i_t.add(shifted).cmp(n_t) !== -1) {
                    break;
                }
                var i1 = toBI(i, 10).add(shifted).toNumber();
                if (bitSet.testn(i1)) {
                
                }
                else {
                    otherExponents[i1] = otherExponents[i].mul(challenges[j].pow(TWO)).umod(q);
                    bitSet = bitSet.bincn(i1);
                }
                j++;
            } while (
                true
            )
        }
        const challengeVector = [] as BigInteger[]
        for (let i = 0; i < otherExponents.length; i++ ) {
            challengeVector.push(otherExponents[i]);
            }
        const g = params.getGs().commit(challengeVector);

        const h = params.getHs().commit(challengeVector.reverse());
        const prod = proof.getA().mul(proof.getB()).umod(q);
        // console.log(prod.toString(16));
        const cProof = g.mul(proof.getA()).add(h.mul(proof.getB())).add(params.getH().mul(prod));
        // console.log(cProof.getX().toString(16));
        return c.equals(cProof);
    }
}
