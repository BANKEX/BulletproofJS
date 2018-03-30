import {BigInteger, toBI} from "../bigInteger/bigInteger";
import { ECCurve, ECPoint } from "../curve/curve";
import { ProofUtils } from "../util/proofUtil";
import { ECDHWitness } from "./ecdhWitness";

export class ECDHProtocol {
    public static getAgreedKey(witness: ECDHWitness, otherSideKey: ECPoint ): BigInteger {
        return otherSideKey.mul(witness.getRandomness()).getX();
    }
    public static getAgreedPoint(witness: ECDHWitness, otherSideKey: ECPoint ): ECPoint {
        return otherSideKey.mul(witness.getRandomness());
    }
}
