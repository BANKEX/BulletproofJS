const ethUtil = require('ethereumjs-util');
const assert = require('assert');
const BN = ethUtil.BN;

class FieldVector{
    constructor (a, q) {
        this.a = a;
        this.q = q;
    }

    innerPoduct(b) {
        assert(b.length === this.a.length);
        let res = new BN(0);
        for (let i = 0; i < b.length; i++) {
            res = res.add(b[i].mul(this.a[i]))
        }
        return res.mod(this.q);
    }

    hadamard(b) {
        assert(b.length === this.a.length);
        let res = [];
        for (let i = 0; i < b.length; i++) {
            res.push(b[i].mul(this.a[i]).mod(this.q));
        }
        return new FieldVector(res, this.q);
    }

    times(b) {
        let res = [];
        for (let i = 0; i < this.a.length; i++) {
            res.push(b.mul(this.a[i]).mod(this.q));
        }
        return new FieldVector(res, this.q);
    }

    addVector(b) {
        assert(b.length === this.a.length);
        let res = [];
        for (let i = 0; i < b.length; i++) {
            res.push(b[i].add(this.a[i]).mod(this.q));
        }
        return new FieldVector(res, this.q);
    }

    addConstant(b) {
        let res = [];
        for (let i = 0; i < this.a.length; i++) {
            res.push(b.add(this.a[i]).mod(this.q));
        }
        return new FieldVector(res, this.q);
    }

    // public FieldVector subtract(Iterable<BigInteger> b) {
    //     if (!b.iterator().hasNext()) {
    //         return this;
    //     }
    //     return from(a.zip(b, BigInteger::subtract).map(bi -> bi.mod(q)));
    // }

    sum() {
        let accumulator = new BN(0);
        for (let i = 0; i < this.a.length; i++) {
            accumulator.add(this.a[i]);
        }
        return accumulator;
    }

    // public FieldVector invert() {
    //     return from(a.map(bi -> bi.modInverse(q)));
    // }

    // public BigInteger firstValue() {
    //     return a.firstValue();
    // }

    get(i) {
        return this.a(i);
    }

    size() {
        return this.a.length;
    }

    // public FieldVector subVector(int start, int end) {
    //     return from(a.subList(start, end));
    // }

    getVector() {
        return this.a;
    }

    // public FieldVector plus(BigInteger other) {
    //     return from(a.plus(other));
    // }

    // public static FieldVector pow(BigInteger k, int n,BigInteger q) {
    //     return from(VectorX.iterate(n, BigInteger.ONE, k::multiply),q);
    // }

    equals(o) {
        if (this == o) return true;
        if (o == null) return false;
        if (o.a.length !== this.a.length) {
            return false;
        }
        for (let i = 0; i < this.a.length; i++) {
            if (!this.a[i].equals(o.a[i])) {
                return false;
            }
        }
        return true;
    }
}