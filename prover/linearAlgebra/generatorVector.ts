import {BigInteger, toBI} from "../bigInteger/bigInteger";
import {ECPoint, ECCurve} from "../curve/curve";

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
        let accumulator = this.curve.zero;
        const multiplies = this.gs.map((point: ECPoint, index: number) : ECPoint => {
            console.log(point.getX().toString(16))
            console.log(exponents[index].toString(16))
            return point.mul(exponents[index]);
        })
        let res = multiplies[0]
        console.log(res.getX().toString(16))
        for (let i = 1; i < multiplies.length; i++) {
            console.log()
            res = res.add(multiplies[i])
            console.log(res.getX().toString(16))
        }
        console.log(res.getX().toString(16))
        res = this.gs.reduce((prev:ECPoint , current: ECPoint, index: number) : ECPoint => {
            return prev.add(current.mul(exponents[index]));
        }, accumulator);
        console.log(res.getX().toString(16))
        return res;
    }


    sum() : ECPoint {
        let accumulator = this.curve.zero;
        return this.gs.reduce((prev:ECPoint , current: ECPoint, index: number) : ECPoint => {
            return prev.add(current);
        }, accumulator);
    }

    haddamard(exponents: BigInteger[]) : GeneratorVector {
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

    size(): Number {
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

    getCurve(): ECCurve {
        return this.curve;
    }
}
