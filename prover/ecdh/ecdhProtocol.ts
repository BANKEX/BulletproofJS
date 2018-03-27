import {BigInteger, toBI} from "../bigInteger/bigInteger";
import { ECCurve, ECPoint } from "../curve/curve";
import { ProofUtils } from "../util/proofUtil";
import { ECDHWitness } from "./ecdhWitness";

export class ECDHProtocol {
    public witness: ECDHWitness;
    public otherSideKey: ECPoint;
    constructor(witness: ECDHWitness, otherSideKey: ECPoint ) {
        this.witness = witness;
        this.otherSideKey = otherSideKey;
    }

    public getAgreedKey(): BigInteger {
        return this.otherSideKey.mul(this.witness.getRandomness()).getX();
    }
}
