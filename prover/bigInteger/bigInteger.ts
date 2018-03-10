import {BN} from "bn.js";
const ZERO = new BN(0);
const ONE = new BN(1);
const TWO = new BN(2);
export type BigInteger = typeof ZERO;
export const BNCLASS = BN;
export function toBI(num: any, radix: Number) : BigInteger {
    return new BN(num, radix);
}

