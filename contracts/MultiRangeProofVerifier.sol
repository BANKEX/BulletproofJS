pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./alt_bn128.sol";
import {EfficientInnerProductVerifier} from "./EfficientInnerProductVerifier.sol";
import {PublicParameters} from "./PublicParameters.sol";

contract MultiRangeProofVerifier {
    using alt_bn128 for uint256;
    using alt_bn128 for alt_bn128.G1Point;
    event DebugEvent(uint256 a, uint256 b, uint256 c);

    uint256 public constant m = 64;
    uint256 public constant n = 6;

    PublicParameters public publicParameters;
    EfficientInnerProductVerifier public ipVerifier;

    constructor (
        address _publicParameters,
        address _ipVerifier
    ) public {
        require(_publicParameters != address(0));
        require(_ipVerifier != address(0));
        publicParameters = PublicParameters(_publicParameters);
        ipVerifier = EfficientInnerProductVerifier(_ipVerifier);
        require(m == publicParameters.m());
        require(n == publicParameters.n());
        require(m == ipVerifier.m());
        require(n == ipVerifier.n());
    }

    function verify(
        uint256[] commitments, // multiple of 2 items of Peddersen commitments
        uint256[8] coords, // [A_x, A_y, S_x, S_y, commits[0]_x, commits[0]_y, commits[1]_x, commits[1]_y]
        uint256[5] scalars, // [tauX, mu, t, a, b]
        uint256[2*n] ls_coords, // 2 * n
        uint256[2*n] rs_coords  // 2 * n
    ) public 
    // view 
    returns (bool) {
        emit DebugEvent(0, 0, gasleft());
        require(commitments.length % 2 == 0);
        uint256 numOfCommitments = commitments.length/2;
        require(m % numOfCommitments == 0);
        MultiRangeProof memory multiRangeProof;
        alt_bn128.G1Point[] memory input = new alt_bn128.G1Point[](numOfCommitments);
        uint256 i = 0;
        for (i = 0; i < numOfCommitments; i++) {
            input[i] = alt_bn128.G1Point(commitments[2*i], commitments[2*i+1]);
        }
        multiRangeProof.aI = alt_bn128.G1Point(coords[0], coords[1]);
        multiRangeProof.s = alt_bn128.G1Point(coords[2], coords[3]);
        multiRangeProof.tCommits = [alt_bn128.G1Point(coords[4], coords[5]), alt_bn128.G1Point(coords[6], coords[7])];
        multiRangeProof.tauX = scalars[0];
        multiRangeProof.mu = scalars[1];
        multiRangeProof.t = scalars[2];
        InnerProductProof memory ipProof;
        multiRangeProof.ipProof = ipProof;
        ipProof.ls = ls_coords;
        ipProof.rs = rs_coords;
        ipProof.a = scalars[3];
        ipProof.b = scalars[4];
        uint256 yPrecomputed = uint256(keccak256(commitments, multiRangeProof.aI.X, multiRangeProof.aI.Y, multiRangeProof.s.X, multiRangeProof.s.Y)).mod();
        emit DebugEvent(0, 1, gasleft());
        return verifyInternal(yPrecomputed, input, multiRangeProof);
    }

    struct MultiRangeProof {
        alt_bn128.G1Point aI;
        alt_bn128.G1Point s;
        alt_bn128.G1Point[2] tCommits;
        uint256 tauX;
        uint256 mu;
        uint256 t;
        InnerProductProof ipProof;
    }

    struct InnerProductProof {
        uint256[2*n] ls;
        uint256[2*n] rs;
        uint256 a;
        uint256 b;
    }

    event Proof(uint256 x, uint256 y);

    struct Board {
        uint256 y;
        uint256[m] ys;
        uint256 z;
        uint256[] zs;
        uint256[] twos;
        uint256[m] twoTimesZSquared;
        uint256 zSum;
        uint256 x;
        alt_bn128.G1Point lhs;
        uint256 k;
        alt_bn128.G1Point rhs;
        uint256 uChallenge;
        alt_bn128.G1Point u;
        alt_bn128.G1Point P;
        uint256 bitsPerNumber;
    }

    function verifyInternal(
        uint256 yPrecomputed,
        alt_bn128.G1Point[] input,
        MultiRangeProof proof
    ) internal 
    view 
    returns (bool) {
        emit DebugEvent(1, 0, gasleft());

        alt_bn128.G1Point memory G = publicParameters.G();
        alt_bn128.G1Point memory H = publicParameters.H();
        alt_bn128.G1Point[m] memory gs = publicParameters.gs();
        alt_bn128.G1Point[m] memory hs = publicParameters.hs();

        Board memory b;
        b.bitsPerNumber = m / input.length;
        b.y = yPrecomputed;
        b.ys = powers(b.y);
        b.z = uint256(keccak256(b.y)).mod();
        b.zs = powers(b.z, 2, input.length);
        b.twos = powers(2, 0, b.bitsPerNumber);

        b.twoTimesZSquared = timesAndConcat(b.twos, b.zs);
        // const zSum = zs.sum().mul(z).umod(q);
        b.zSum = sumScalars(b.zs).mul(b.z);
        // const k = ys.sum().mul(z.sub(zs.get(0))).sub(zSum.shln(bitsPerNumber).sub(zSum)).umod(q);
        b.k = sumScalars(b.ys).mul(b.z.sub(b.zs[0])).sub(b.zSum.mul(2 ** b.bitsPerNumber).sub(b.zSum));

        b.x = uint256(keccak256(proof.tCommits[0].X, proof.tCommits[0].Y, proof.tCommits[1].X, proof.tCommits[1].Y)).mod();

        // const lhs = base.commit(t, tauX);
        b.lhs = G.mul(proof.t).add(H.mul(proof.tauX));

        // const rhs = tCommits.commit([x, x.pow(TWO)])
        b.rhs = proof.tCommits[0].mul(b.x).add(proof.tCommits[1].mul(b.x.mul(b.x)));
        // .add(commitments.commit(zs.getVector()))
        for (uint256 i = 0; i < input.length; i++) {
            b.rhs = b.rhs.add(input[i].mul(b.zs[i]));
        }
        // .add(base.commit(k, ZERO));
        b.rhs = b.rhs.add(G.mul(b.k));
        
        if (!b.rhs.eq(b.lhs)) {
            return false;
        }

        // const uChallenge = ProofUtils.computeChallengeForBigIntegers(q,[tauX, mu, t]);
        b.uChallenge = uint256(keccak256(proof.tauX, proof.mu, proof.t)).mod();

        // const u = base.g.mul(uChallenge);
        b.u = G.mul(b.uChallenge);

        // const hPrimes = hs.hadamard(ys.invert().getVector());
        alt_bn128.G1Point[m] memory hPrimes = haddamard(hs, powers(b.y.inv()));

        // const hExp = ys.times(z).addVector(twoTimesZSquared);
        uint256[m] memory hExp = addVectors(times(b.ys, b.z), b.twoTimesZSquared);

        // const P = a.add(s.mul(x))
        b.P = proof.aI.add(proof.s.mul(b.x));
        // .add(gs.sum().mul(z.neg()))
        b.P = b.P.add(sumPoints(gs).mul(b.z.neg()));
        // .add(hPrimes.commit(hExp.getVector()))
        b.P = b.P.add(commit(hPrimes, hExp));
        // .sub(base.h.mul(mu))
        b.P = b.P.add(H.mul(proof.mu).neg());
        // .add(u.mul(t));
        b.P = b.P.add(b.u.mul(proof.t));
        emit DebugEvent(1, 1, gasleft());
        return ipVerifier.verifyWithCustomParams(b.P, proof.ipProof.ls, proof.ipProof.rs, proof.ipProof.a, proof.ipProof.b, gs, hPrimes, b.u);
    }

    function addVectors(uint256[m] a, uint256[m] b) internal pure returns (uint256[m] result) {
        for (uint256 i = 0; i < m; i++) {
            result[i] = a[i].add(b[i]);
        }
    }

    function haddamard(alt_bn128.G1Point[m] ps, uint256[m] ss) internal view returns (alt_bn128.G1Point[m] result) {
        for (uint256 i = 0; i < m; i++) {
            result[i] = ps[i].mul(ss[i]);
        }
    }

    // function haddamard_inv(alt_bn128.G1Point[m] ps, uint256[m] ss) internal view returns (alt_bn128.G1Point[m] result) {
    //     for (uint256 i = 0; i < m; i++) {
    //         result[i] = ps[i].mul(ss[i].inv());
    //     }
    // }

    function sumScalars(uint256[m] ys) internal pure returns (uint256 result) {
        for (uint256 i = 0; i < m; i++) {
            result = result.add(ys[i]);
        }
    }

    function sumScalars(uint256[] ys) internal pure returns (uint256 result) {
        for (uint256 i = 0; i < ys.length; i++) {
            result = result.add(ys[i]);
        }
    }

    function sumPoints(alt_bn128.G1Point[m] ps) internal view returns (alt_bn128.G1Point sum) {
        sum = ps[0];
        for (uint256 i = 1; i < m; i++) {
            sum = sum.add(ps[i]);
        }
    }

    function commit(alt_bn128.G1Point[m] ps, uint256[m] ss) internal view returns (alt_bn128.G1Point commit) {
        commit = ps[0].mul(ss[0]);
        for (uint256 i = 1; i < m; i++) {
            commit = commit.add(ps[i].mul(ss[i]));
        }
    }

    // function toXs(alt_bn128.G1Point[n] ps) internal pure returns (uint256[n] xs) {
    //     for (uint256 i = 0; i < n; i++) {
    //         xs[i] = ps[i].X;
    //     }
    // }

    // function toYs(alt_bn128.G1Point[n] ps) internal pure returns (uint256[n] ys) {
    //     for (uint256 i = 0; i < n; i++) {
    //         ys[i] = ps[i].Y;
    //     }
    // }

    function powers(uint256 base) internal pure returns (uint256[m] powers) {
        powers[0] = 1;
        powers[1] = base;
        for (uint256 i = 2; i < m; i++) {
            powers[i] = powers[i-1].mul(base);
        }
    }

    function powers(uint256 base, uint256 firstPower, uint256 numberOfPowers) internal pure returns (uint256[] powers) {
        uint256[] memory pwrs = new uint256[](numberOfPowers);
        pwrs[0] = 1;
        uint256 i = 0;
        if (firstPower != 0) {
            for (i = 0; i < firstPower; i++) {
                pwrs[0] = pwrs[0].mul(base);
            }
        } 
        for (i = 1; i < numberOfPowers; i++) {
            pwrs[i] = pwrs[i-1].mul(base);
        }
        return pwrs;
    }

    function times(uint256[m] v, uint256 x) internal pure returns (uint256[m] result) {
        for (uint256 i = 0; i < m; i++) {
            result[i] = v[i].mul(x);
        }
    }

    function timesAndConcat(uint256[] v, uint256[] xs) internal pure returns(uint256[m] result) { //twos, zs. twos.times(z).reduce()
        uint256 vLength = v.length;
        for (uint256 i = 0; i < xs.length; i++) {
            for (uint256 j = 0; j < vLength; j++) {
                result[i*vLength + j] = v[j].mul(xs[i]);
            }
        }
    }
}
