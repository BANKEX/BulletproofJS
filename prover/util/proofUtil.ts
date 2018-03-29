import {sha3} from "ethereumjs-util"
import {BigInteger, toBI, BNCLASS} from "../bigInteger/bigInteger"
import {ECPoint} from  "../curve/curve"
import * as SecureRandom from "secure-random"
import {Buffer} from "buffer"
const emptyBuffer = Buffer.alloc(0);
type Buffer = typeof emptyBuffer;

export class ProofUtils {
    static keccak256 = sha3;
    
    static computeChallenge = function(q: BigInteger, points:ECPoint[]) : BigInteger{
        let buffers = [] as Buffer[]
        for (const point of points) {
            const buff = point.serialize(true)
            buffers.push(buff)
        }
        const hashed = this.keccak256(Buffer.concat(buffers))
        const bn = new BNCLASS(hashed, 16, "be").umod(q)
        return bn
        }

    static computeChallengeForBigIntegersAndPoints(q:BigInteger, ints:BigInteger[], points:ECPoint[]) {
        let buffers = [] as Buffer[]
        for (const bi of ints) {
            const buff = bi.toArrayLike(Buffer, "be", 32) as Buffer
            buffers.push(buff)
        }
        for (const point of points) {
            const buff = point.serialize(true)
            buffers.push(buff)
        }
        const hashed = this.keccak256(Buffer.concat(buffers))
        const bn = new BNCLASS(hashed, 16, "be").umod(q)
        return bn
    }

    static computeChallengeForBigIntegers(q:BigInteger, ints:BigInteger[]) {
        let buffers = [] as Buffer[]
        for (const bi of ints) {
            const buff = bi.toArrayLike(Buffer, "be", 32) as Buffer
            buffers.push(buff)
        }
        const hashed = this.keccak256(Buffer.concat(buffers))
        const bn = new BNCLASS(hashed, 16, "be").umod(q)
        return bn
    }

    static randomNumber(): BigInteger {
        // return new BNCLASS(1);
        let buff = SecureRandom(32);
        return new BNCLASS(buff, 16, "be")
    }
}



    // public static <T extends GroupElement<T>> BigInteger computeChallenge(BigInteger q,T... points) {
    //     return computeChallenge(q, asList(points));
    // }



    // public static BigInteger challengeFromints(BigInteger q, BigInteger... ints){
    //     StringBuilder x = new StringBuilder();
    //     for (BigInteger anInt : ints) {
    //         x.append(encode(new Uint256(anInt)));
    //     }
    //     return new BigInteger(1, hexStringToByteArray(sha3(x.toString()))).mod(q);
    // }

    // public static BigInteger hash(String string) {
    //     KECCACK.get().update(string.getBytes());
    //     return new BigInteger(KECCACK.get().digest());
    // }

    // public static BigInteger hash(String id, BigInteger salt) {
    //     KECCACK.get().update(id.getBytes());
    //     KECCACK.get().update(salt.toByteArray());
    //     return new BigInteger(KECCACK.get().digest());
    // }

    // public static BigInteger randomNumber(int bits) {
    //     return new BigInteger(bits, RNG);
    // }

    // public static BigInteger randomNumber() {
    //     return ProofUtils.randomNumber(256);
    // }


    // static {
    //     RNG = new SecureRandom();
    //     KECCACK = ThreadLocal.withInitial(Keccak.Digest256::new);
    // }
// }

