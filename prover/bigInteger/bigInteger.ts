import {BN} from "bn.js";
const ZERO = new BN(0);
const ONE = new BN(1);
const TWO = new BN(2);
export type BigInteger = typeof ZERO;

export function toBI(num: any) : BigInteger {
    return new BN(num);
}

