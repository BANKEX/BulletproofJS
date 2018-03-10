import {BigInteger, toBI} from "../bigInteger/bigInteger";
import {ECPoint} from "../curve/curve";
import {Buffer} from "buffer"
import {FieldVector} from "../linearAlgebra/fieldVector";

const emptyBuffer = Buffer.alloc(0);
type Buffer = typeof emptyBuffer;

export class InnerProductWitness {
    private a:FieldVector
    private b:FieldVector;

    constructor(a:FieldVector, b:FieldVector) {
        this.a = a;
        this.b = b;
    }

    public getA():FieldVector {
        return this.a;
    }

    public getB():FieldVector {
        return this.b;
    }
}
