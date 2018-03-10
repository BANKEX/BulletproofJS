import {BigInteger, toBI} from "../bigInteger/bigInteger";
import {ECPoint} from "../curve/curve";

export class FieldVector {
    private a: BigInteger[]
    private q: BigInteger

    constructor (a: BigInteger[], q: BigInteger) {
        this.a = a;
        this.q = q;
    }

    innerPoduct(other: FieldVector): BigInteger {
        // assert(other.a.length === this.a.length);
        // assert(this.q === other.q);
        let res = toBI(0, 10);
        for (let i = 0; i < this.a.length; i++) {
            res = res.add(other.a[i].mul(this.a[i]))
        }
        return res.mod(this.q);
    }

    hadamard(other: FieldVector) {
        // assert(other.a.length === this.a.length);
        // assert(this.q === other.q);
        let res = [] as BigInteger[];
        for (let i = 0; i < this.a.length; i++) {
            res.push(other.a[i].mul(this.a[i]).mod(this.q));
        }
        return new FieldVector(res, this.q);
    }

    times(scalar: BigInteger): FieldVector {
        let res = [] as BigInteger[];
        for (let i = 0; i < this.a.length; i++) {
            res.push(scalar.mul(this.a[i]).mod(this.q));
        }
        return new FieldVector(res, this.q);
    }

    addVector(other: FieldVector): FieldVector {
        // assert(other.a.length === this.a.length);
        // assert(this.q === other.q);
        let res = [] as BigInteger[];
        for (let i = 0; i < this.a.length; i++) {
            res.push(other.a[i].add(this.a[i]).mod(this.q));
        }
        return new FieldVector(res, this.q);
    }

    addScalar(scalar: BigInteger): FieldVector {
        let res = [] as BigInteger[];
        for (let i = 0; i < this.a.length; i++) {
            res.push(scalar.add(this.a[i]).mod(this.q));
        }
        return new FieldVector(res, this.q);
    }

    subtractVector(other: FieldVector): FieldVector {
        // assert(other.a.length === this.a.length);
        // assert(this.q === other.q);
        let res = [] as BigInteger[];
        for (let i = 0; i < this.a.length; i++) {
            res.push(other.a[i].sub(this.a[i]).mod(this.q));
        }
        return new FieldVector(res, this.q);
    }

    sum(): BigInteger {
        let accumulator = toBI(0, 10);
        for (let i = 0; i < this.a.length; i++) {
            accumulator.add(this.a[i]);
        }
        return accumulator;
    }

    invert(): FieldVector {
        let res = [] as BigInteger[];
        for (let i = 0; i < this.a.length; i++) {
            res.push(this.a[i].invm(this.q));
        }
        return new FieldVector(res, this.q);
    }

    firstValue(): BigInteger {
        return this.a[0];
    }

    get(i: number) {
        return this.a[i];
    }

    size() {
        return this.a.length;
    }

    subVector(start: number, end: number) : FieldVector {
        const res = this.a.slice(start, end) as BigInteger[];
        return new FieldVector(res, this.q);
    }

    getVector() : BigInteger[] {
        return this.a;
    }


    static pow(k: BigInteger, n: number, q: BigInteger) : FieldVector {
        let res = [] as BigInteger[];
        let element = toBI(1, 10);
        res.push(element)
        for (let i = 1; i < n; i++) {
            element = element.mul(k);
            res.push(element);
        }
        return new FieldVector(res, q);
    }

    equals(other: FieldVector) {
        if (this == other) return true;
        if (other == null) return false;
        if (other.a.length !== this.a.length || this.q.cmp(other.q) !== 0) {
            return false;
        }
        for (let i = 0; i < this.a.length; i++) {
            if (this.a[i].cmp(other.a[i]) !== 0) {
                return false;
            }
        }
        return true;
    }
}