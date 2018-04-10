import {BigInteger, toBI, BNCLASS} from "../bigInteger/bigInteger";
import {ECPoint} from "../curve/curve";
import { assert } from "../elliptic/lib/elliptic/utils";
import { ProofUtils } from "../util/proofUtil";

export class FieldVector {
    private a: BigInteger[]
    private q: BigInteger

    constructor (a: BigInteger[], q: BigInteger) {
        // this.a = a.map((el) => {
        //     return el.toRed(this.red);
        // });
        this.a = a;
        this.q = q;
    }

    innerPoduct(other: FieldVector): BigInteger {
        assert(other.a.length === this.a.length);
        assert(this.q.cmp(other.q) === 0);
        let accumulator = toBI(0, 10);
        const res = this.a.reduce((prev: BigInteger, next: BigInteger, index: number) : BigInteger => {
            return prev.add(next.mul(other.a[index]))
        }, accumulator)
        return res.mod(this.q);
    }

    hadamard(other: FieldVector) {
        assert(other.a.length === this.a.length);
        assert(this.q.cmp(other.q) === 0);
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
        assert(other.a.length === this.a.length);
        assert(this.q.cmp(other.q) === 0);
        let res = [] as BigInteger[];
        for (let i = 0; i < this.a.length; i++) {
            res.push(other.a[i].add(this.a[i]).mod(this.q));
        }
        return new FieldVector(res, this.q);
    }

    addScalar(scalar: BigInteger): FieldVector {
        let res = [] as BigInteger[];
        for (let i = 0; i < this.a.length; i++) {
            res.push(scalar.add(this.a[i]).umod(this.q));
        }
        return new FieldVector(res, this.q);
    }

    subtractVector(other: FieldVector): FieldVector {
        assert(other.a.length === this.a.length);
        assert(this.q.cmp(other.q) === 0);
        let res = [] as BigInteger[];
        for (let i = 0; i < this.a.length; i++) {
            const el = this.a[i].sub(other.a[i]).umod(this.q)
            res.push(el);
        }
        return new FieldVector(res, this.q);
    }

    sum(): BigInteger {
        let accumulator = toBI(0, 10);
        for (let i = 0; i < this.a.length; i++) {
            // accumulator = accumulator.add(this.a[i]).umod(this.q);
            accumulator.iadd(this.a[i]);
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

    get(i: number): BigInteger {
        return this.a[i];
    }

    size(): number {
        return this.a.length;
    }

    subVector(start: number, end: number) : FieldVector {
        const res = [] as BigInteger[];
        for (let i = start; i < end; i++) {
            res.push(this.a[i]);
        }
        return new FieldVector(res, this.q);
    }

    getVector() : BigInteger[] {
        return this.a;
    }


    static pow(k: BigInteger, n: number, q: BigInteger) : FieldVector {
        let redContext = BNCLASS.red(q);
        let res = [] as BigInteger[];
        let element = toBI(1, 10).toRed(redContext);
        let k_red = k.toRed(redContext);
        res.push(element)
        for (let i = 1; i < n; i++) {
            element = element.redMul(k_red);
            res.push(element.fromRed());
        }
        return new FieldVector(res, q);
    }

    static fill(k: BigInteger, n: number, q: BigInteger) : FieldVector {
        let redContext = BNCLASS.red(q);
        let res = [] as BigInteger[];
        let k_red = k.toRed(redContext);
        for (let i = 0; i < n; i++) {
            res.push(k_red.fromRed());
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

    public static random(n: number, q: BigInteger): FieldVector  {
        const res = [];
        for (let i = 0; i < n; i++) {
            res.push(ProofUtils.randomNumber());
        }
        return new FieldVector(res, q);
    }
}