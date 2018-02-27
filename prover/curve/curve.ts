import {BigInteger, toBI} from "../bigInteger/bigInteger";
import {ec, curve} from "../elliptic";
import {Buffer} from "buffer";
// import Buffer

const EC = ec;
const CURVE = curve.base;
const POINT = CURVE.BasePoint;

const emptyBuffer = Buffer.alloc(0);


type Curve = typeof CURVE;
type Point = typeof POINT;
type Buffer = typeof emptyBuffer;

interface iECCurve {
    order: BigInteger
    halfOrder: BigInteger
    primeFieldSize: BigInteger
}

export class ECCurve {
    public order: BigInteger
    public primeFieldSize: BigInteger
    public halfOrder: BigInteger
    public generator: ECPoint
    public zero: ECPoint
    private curveRef: any

    constructor (name: string) {
        let ellCurve = new EC(name);
        this.curveRef = ellCurve;
        this.order = this.curveRef.n as BigInteger;
        this.halfOrder = this.curveRef.nh as BigInteger;
        this.primeFieldSize = this.curveRef.curve.p as BigInteger;
        this.generator = new ECPoint(this.curveRef.g, this);
        this.zero = this.generator.sub(this.generator);
    }

    public pointFromCoordinates(x: BigInteger, y: BigInteger) : any {
        return this.curveRef.point(x, y, null, null);
    }

    public hash(input: Buffer) : Buffer {
        return this.curveRef.hash(input);
    }
}

interface iECPoint {
    x: BigInteger
    y: BigInteger
    curve: ECCurve
    pointRef: Point
    add(another: ECPoint) : ECPoint
    mul(scalar: BigInteger) : ECPoint
    negate() : ECPoint
    inverse(): ECPoint
}


export class ECPoint {
    public curve: ECCurve
    protected pointRef: any
    add(another: ECPoint): ECPoint {
        let p = this.pointRef.add(another.pointRef);
        return new ECPoint(p, this.curve);
    }
    mul(scalar: BigInteger): ECPoint {
        let p = this.pointRef.mul(scalar);
        return new ECPoint(p, this.curve);
    }
    sub(another: ECPoint) : ECPoint {
        let p = this.pointRef.add(another.pointRef.neg());
        return new ECPoint(p, this.curve);
    }
    negate(): ECPoint {
        let p = this.pointRef.neg();
        return new ECPoint(p, this.curve);
    }
    inverse(): ECPoint {
        let p = this.pointRef.inverse();
        return new ECPoint(p, this.curve);
    }
    isInfinity(): boolean {
        return this.pointRef.inf;
    }
    constructor(p: any, curve: ECCurve) {
        this.pointRef = p;
        this.curve = curve;
    }

    getX() : BigInteger {
        return this.pointRef.getX();
    }

    getY() : BigInteger {
        return this.pointRef.getY();
    }

    // public readonly x: BigInteger = this.getX();
    // public readonly y: BigInteger = this.getY();
}

const bn256 = new ECCurve("bn256");
const generator = bn256.generator;
console.log(generator.getX().toString(10));
console.log(generator.getY().toString(10));
const doubled = generator.mul(toBI(2));
console.log(doubled.getX().toString(10));
console.log(doubled.getY().toString(10));