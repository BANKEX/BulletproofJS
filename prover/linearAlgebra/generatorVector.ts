import {BigInteger, toBI} from "../bigInteger/bigInteger";
import {ECPoint, ECCurve} from "../curve/curve";
import { assert } from "../elliptic/lib/elliptic/utils";
import { FieldVector } from "./fieldVector";

export class GeneratorVector {
    private gs : ECPoint[];
    private curve: ECCurve;

    constructor (gs: ECPoint[], curve: ECCurve) {
        this.gs = gs;
        this.curve = curve;
    }

    from(gs: ECPoint[]): GeneratorVector {
        return new GeneratorVector(gs, this.curve);
    }

    subVector(start: number,end: number) : GeneratorVector {
        return this.from(this.gs.slice(start, end) as ECPoint[]);
    }

    commit(exponents: BigInteger[]) : ECPoint {
        assert(exponents.length === this.gs.length, "Commitment base and vector should have the same length");
        let accumulator = this.curve.zero;
        const res = this.gs.reduce((prev:ECPoint , current: ECPoint, index: number) : ECPoint => {
            const newPoint = current.mul(exponents[index])
            return prev.add(newPoint);
        }, accumulator);
        assert(!res.isInfinity(), "Commitment resulted in infinity point");
        return res;
    }

    commitToFieldVector(vec: FieldVector) : ECPoint {
        const exponents: BigInteger[] = vec.getVector();
        assert(exponents.length === this.gs.length, "Commitment base and vector should have the same length");
        let accumulator = this.curve.zero;
        const res = this.gs.reduce((prev:ECPoint , current: ECPoint, index: number) : ECPoint => {
            const newPoint = current.mul(exponents[index].umod(this.curve.order))
            return prev.add(newPoint);
        }, accumulator);
        assert(!res.isInfinity(), "Commitment resulted in infinity point");
        return res;
    }


    sum() : ECPoint {
        let accumulator = this.curve.zero;
        return this.gs.reduce((prev:ECPoint , current: ECPoint, index: number) : ECPoint => {
            return prev.add(current);
        }, accumulator);
    }

    hadamard(exponents: BigInteger[]) : GeneratorVector {
        let newVector = this.gs.map((current: ECPoint, index: number) : ECPoint => {
            return current.mul(exponents[index]);
        }) as ECPoint[]
        return new GeneratorVector(newVector, this.curve);
    }

    add(other: ECPoint[]) : GeneratorVector {
        let newVector = this.gs.map((current: ECPoint, index: number) : ECPoint => {
            return current.add(other[index]);
        }) as ECPoint[]
        return new GeneratorVector(newVector, this.curve);
    }

    addVector(other: GeneratorVector) : GeneratorVector {
        const oth = other.gs;
        return this.add(oth)
    }

    get(i: number): ECPoint {
        return this.gs[i];
    }

    size(): number {
        return this.gs.length;
    }
    
    getVector(): ECPoint[] {
        return this.gs;
    }

    // @Override
    // public boolean equals(Object obj) {
    //     if (obj == null || !(obj instanceof GeneratorVector)) {
    //         return false;
    //     }
    //     GeneratorVector vector = (GeneratorVector) obj;
    //     return gs.equals(vector.gs);
    // }

    // @Override
    // public Iterator<T> iterator() {
    //     return gs.iterator();
    // }

    plus(other: ECPoint) {
        const newArray = [] as ECPoint[]
        for (const point of this.gs) {
            newArray.push(point)
        }
        newArray.push(other)
        return this.from(newArray);
    }

    getGroup(): ECCurve {
        return this.curve;
    }

    getCurve(): ECCurve {
        return this.curve;
    }
}
