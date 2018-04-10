import {BigInteger, toBI, BNCLASS} from "../bigInteger/bigInteger";
import {ec, curve} from "../elliptic";
import {Buffer} from "buffer";
import { assert } from "../elliptic/lib/elliptic/utils";
import {sha3} from "ethereumjs-util"
// import Buffer

const EC = ec;
const CURVE = curve.base;
const POINT = CURVE.BasePoint;
const ZERO = toBI(0, 10);
const emptyBuffer = Buffer.alloc(0);
type Buffer = typeof emptyBuffer;

type Curve = typeof CURVE;
type Point = typeof POINT;


export class ECCurve {
    public order: BigInteger
    public primeFieldSize: BigInteger
    public halfOrder: BigInteger
    public generator: ECPoint
    public zero: ECPoint
    public curveRef: any

    constructor (name: string) {
        let ellCurve = new EC(name);
        this.curveRef = ellCurve;
        this.order = this.curveRef.n as BigInteger;
        this.halfOrder = this.curveRef.nh as BigInteger;
        this.primeFieldSize = this.curveRef.curve.p as BigInteger;
        this.generator = new ECPoint(this.curveRef.g, this);
        this.zero = this.generator.sub(this.generator);
    }

    public pointFromCoordinates(x: BigInteger, y: BigInteger) : ECPoint {
        const pointRef = this.curveRef.curve.point(x, y);
        return new ECPoint(pointRef, this);
    }

    public hash(input: Buffer) : Buffer {
        return sha3(input);
    }

    public hashToBigInteger(input: Buffer) : BigInteger {
        let buff = sha3(input);
        let bn = new BNCLASS(buff, 16, "be");
        return bn
    }

    public validate(point: ECPoint): Boolean {
        return this.curveRef.curve.validate(point.pointRef)
    }
    
    public hashInto(input: Buffer) : ECPoint {
        // valid only for short curves
        let seed = new BNCLASS(input, 16, "be").umod(this.primeFieldSize);
        const ONE = toBI(1, 10);
        const ZERO = toBI(0, 10);
        let y: BigInteger;
        seed = seed.sub(ONE);
        do {
            seed = seed.add(ONE);
            const x = seed.toRed(this.curveRef.curve.red);
            let y2;
            if (this.curveRef.curve.a.cmp(ZERO) == 0) {
                y2 = x.redSqr().redIMul(x).redIAdd(this.curveRef.curve.b);
            } else {
                y2 = x.redSqr().redIMul(x).redIAdd(x.redMul(this.curveRef.curve.a)).redIAdd(this.curveRef.curve.b);
            }
            // y = y2.redPow(this.primeFieldSize.add(ONE).div(toBI(4, 10)));
            y = y2.redSqrt();
            if (y.redSqr().cmp(y2) === 0) {
                break;
            }
            // if (y.redSqr().redSub(y2).cmp(ZERO) === 0) {
            //     break;
            // }
        } while (true);
        // y = y.fromRed();
        const point = this.curveRef.curve.point(seed, y);
        const ecpoint = new ECPoint(point, this)
        return ecpoint
    }

}

export class ECPoint {
    public curve: ECCurve
    public pointRef: any
    add(another: ECPoint): ECPoint {
        const p = this.pointRef.add(another.pointRef);
        return new ECPoint(p, this.curve);
    }
    mul(scalar: BigInteger): ECPoint {
        const p = this.pointRef.mul(scalar);
        return new ECPoint(p, this.curve);
    }
    sub(another: ECPoint) : ECPoint {
        const p = this.pointRef.add(another.pointRef.neg());
        return new ECPoint(p, this.curve);
    }
    negate(): ECPoint {
        const p = this.pointRef.neg();
        return new ECPoint(p, this.curve);
    }
    inverse(): ECPoint {
        const p = this.pointRef.inverse();
        return new ECPoint(p, this.curve);
    }
    isInfinity(): boolean {
        return this.pointRef.inf;
    }
    constructor(p: any, curve: ECCurve) {
        this.pointRef = p;
        this.curve = curve;
        assert(curve.curveRef.curve.validate(p))
    }

    getX() : BigInteger {
        return this.pointRef.getX();
    }

    getY() : BigInteger {
        return this.pointRef.getY();
    }

    serialize(pad:Boolean): Buffer {
        if (pad) {
        return Buffer.concat([this.getX().toArrayLike(Buffer, "be", 32), this.getY().toArrayLike(Buffer, "be", 32)])
        } else {
            return Buffer.concat([this.getX().toArrayLike(Buffer, "be"), this.getY().toArrayLike(Buffer, "be")])
        }
    }

    compress(): Buffer {
        const X = this.getX().toArrayLike(Buffer, "be", 32);
        if (this.getY().isEven()) {
            return Buffer.concat([Buffer.from([0x02]), X]);
        } else {
            return Buffer.concat([Buffer.from([0x03]), X]);
        }
    }

    equals(other: ECPoint): Boolean {
        return this.getX().cmp(other.getX()) == 0 && this.getY().cmp(other.getY()) == 0
    }
}