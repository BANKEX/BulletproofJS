import {BigInteger, toBI} from "../bigInteger/bigInteger";
import {ECPoint} from "../curve/curve";
import {Buffer} from "buffer"
import {FieldVector} from "../linearAlgebra/fieldVector";
import {VectorBase} from "../linearAlgebra/vectorBase";
import {InnerProductProof} from "./innerProductProof";
import {ProofUtils} from "../util/proofUtil";
import { assert } from "../elliptic/lib/elliptic/utils";

export class InnerProductVerifier {
    static verify(base: VectorBase, c: ECPoint, proof:InnerProductProof) : Boolean {
        let n = base.getGs().size() as number;
        let gs = base.getGs();
        let hs = base.getHs();
        const q=gs.getCurve().order;
        for (let i = 0; i < proof.getL().length; ++i) {
            const nPrime = n / 2;
            const L = proof.getL()[i];
            const R = proof.getR()[i];

            const gLeft = gs.subVector(0, nPrime);
            const gRight = gs.subVector(nPrime, nPrime * 2);

            const hLeft = hs.subVector(0, nPrime);
            const hRight = hs.subVector(nPrime, nPrime * 2);
            const x = ProofUtils.computeChallenge(q,[L, c, R]) as BigInteger;

            const xInv = x.invm(q) as BigInteger;
            const xSquare = x.pow(2).mod(q) as BigInteger;
            const xInvSquare = xInv.pow(2).mod(q) as BigInteger;
            let xs = [] as  BigInteger[]
            let xInverses = [] as BigInteger[]
            for (let i = 0; i < nPrime; i++) {
                xs.push(x)
                xInverses.push(xInv)
            }
            let gPrime = gLeft.hadamard(xInverses).addVector(gRight.hadamard(xs))
            let hPrime = hLeft.hadamard(xs).addVector(hRight.hadamard(xInverses));
            if (n % 2 == 1) {
                gPrime = gPrime.plus(gs[(n - 1)]);
                hPrime = hPrime.plus(hs[(n - 1)]);

            }
            c = L.mul(xSquare).add(R.mul(xInvSquare)).add(c);
            gs = gPrime;
            hs = hPrime;
            n = gs.size() as number;
        }
        assert(gs.size() == 1, "G Generator size is wrong %s should be 1");
        assert(hs.size() == 1, "H Generator size is wrong %s should be 1");

        const g = gs.get(0);
        const h = hs.get(0);
        const prod = proof.getA().mul(proof.getB()).mod(q) as BigInteger;
        const cProof = g.mul(proof.getA()).add(h.mul(proof.getB())).add(base.getH().mul(prod));
        return c.equals(cProof)
    }
}
