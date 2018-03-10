import { PeddersenCommitment } from "./peddersenCommitment";
import { toBI, BigInteger } from "../bigInteger/bigInteger";
import { FieldVector } from "../linearAlgebra/fieldVector";
import { ECPoint } from "../curve/curve";
import {PeddersenBase} from "../linearAlgebra/peddersenBase";
import { ProofUtils } from "../util/proofUtil";

export class PolyCommitment{

    public coefficientCommitments: PeddersenCommitment[];

    constructor (coefficientCommitments: PeddersenCommitment[]) {
        this.coefficientCommitments = coefficientCommitments;
    }


    public evaluate(x: BigInteger ): PeddersenCommitment  {
        const ONE = toBI(1, 10);
        let multiplier = ONE;
        const res = [this.coefficientCommitments[0].times(ONE)] as PeddersenCommitment[];
        for (let i = 1; i < this.coefficientCommitments.length; i++) {
            multiplier = multiplier.mul(x)
            // .mod(this.coefficientCommitments[0].base.generator.getGroup().order)
            const comm = this.coefficientCommitments[i].times(multiplier);
            res.push(comm);
        }
        let accumulator = res[0] as PeddersenCommitment;
        for (let i = 1; i < this.coefficientCommitments.length; i++) {
            accumulator = accumulator.add(res[i]);
        }
        return accumulator
    }

    public getCoefficientCommitments(): PeddersenCommitment[] {
        return this.coefficientCommitments;
    }

    public getNonzeroCommitments(): ECPoint[] {
        const ZERO = toBI(0, 10);
        const filtered = this.coefficientCommitments.filter((el) => {
            return el.getR().cmp(ZERO) !== 0
        });
        const res = filtered.map((el) => {
            return el.getCommitment()
        })
        return res;
    }

    public static from(base: PeddersenBase, x0: BigInteger, xs: BigInteger[]): PolyCommitment {
        const res = xs.map((el) => {
            return new PeddersenCommitment(base, el, ProofUtils.randomNumber());
        })
        const ZERO = toBI(0, 10);
        const toZero = new PeddersenCommitment(base, x0, ZERO);
        const peddersenCommitments = [toZero].concat(res);
        return new PolyCommitment(peddersenCommitments);
    }
}
