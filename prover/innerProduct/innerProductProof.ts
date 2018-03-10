import {BigInteger, toBI} from "../bigInteger/bigInteger";
import {ECPoint} from "../curve/curve";
import {Buffer} from "buffer"

const emptyBuffer = Buffer.alloc(0);
type Buffer = typeof emptyBuffer;

export class InnerProductProof {
    private L: ECPoint[]
    private R: ECPoint[]
    private a: BigInteger
    private b: BigInteger

    constructor (L: ECPoint[], R: ECPoint[], a: BigInteger, b: BigInteger) {
        this.L = L;
        this.R = R;
        this.a = a;
        this.b = b;
    }

    public getL(): ECPoint[] {
        return this.L;
    }

    public getR(): ECPoint[] {
        return this.R;
    }

    public getA(): BigInteger {
        return this.a;
    }

    public getB(): BigInteger {
        return this.b;
    }

    public serialize(): Buffer {
        const L_ser = Buffer.concat(this.L.map((el) => el.serialize(true)))
        const R_ser = Buffer.concat(this.R.map((el) => el.serialize(true)))
        const a_ser = this.a.toArrayLike(Buffer, "be", 32)
        const b_ser = this.b.toArrayLike(Buffer, "be", 32)
        return Buffer.concat([L_ser, R_ser, a_ser, b_ser])
    }
}
