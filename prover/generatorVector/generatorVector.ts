import {BigInteger, toBI} from "../bigInteger/bigInteger";
import {ECPoint, ECCurve} from "../curve/curve";

export class GeneratorVector {
    private gs : [ECPoint];
    private curve: ECCurve;

    constructor (gs: [ECPoint] ,curve: ECCurve) {
        this.gs = gs;
        this.curve = curve;
    }

    from(gs: [ECPoint]) {
        return new GeneratorVector(gs, this.curve);
    }

    subVector(start: number,end: number) {
        return this.from(this.gs.slice(start, end) as [ECPoint]);
    }

    commit(exponents: [BigInteger]) {
        let accumulator = this.curve.zero;
        return this.gs.reduce((prev:ECPoint , current: ECPoint, index: number) : ECPoint => {
            return prev.add(current.mul(exponents[index]));
        }, accumulator);
    }


     sum() : ECPoint {
        let accumulator = this.curve.zero;
        return this.gs.reduce((prev:ECPoint , current: ECPoint, index: number) : ECPoint => {
            return prev.add(current);
        }, accumulator);
    }

    hadamard(exponents: [BigInteger]) : GeneratorVector {
        let newVector = this.gs.map((current: ECPoint, index: number) : ECPoint => {
            return current.mul(exponents[index]);
        }) as [ECPoint]
        return new GeneratorVector(newVector, this.curve);
    }

    add(other: [ECPoint]) : GeneratorVector {
        let newVector = this.gs.map((current: ECPoint, index: number) : ECPoint => {
            return current.add(other[index]);
        }) as [ECPoint]
        return new GeneratorVector(newVector, this.curve);
    }

    get(i: number) {
        return this.gs[i];
    }

    ize() {
        return this.gs.length;
    }
    
    getVector() {
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

    // public GeneratorVector<T> plus(T other) {
    //     return from(gs.plus(other));
    // }

    getCurve() {
        return this.curve;
    }
}
