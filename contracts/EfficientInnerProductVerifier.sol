pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./alt_bn128.sol";
import {PublicParameters} from "./PublicParameters.sol";

contract EfficientInnerProductVerifier {
    using alt_bn128 for uint256;
    using alt_bn128 for alt_bn128.G1Point;

    event DebugEvent(uint256 a, uint256 b, uint256 c);

    uint256 public constant m = 64;
    uint256 public constant n = 6;

    PublicParameters public publicParameters;

    function EfficientInnerProductVerifier(
        address _publicParameters
    ) public {
        require(_publicParameters != address(0));
        publicParameters = PublicParameters(_publicParameters);
        require(m == publicParameters.m());
        require(n == publicParameters.n());
    }

    struct Board {
        alt_bn128.G1Point[m] hs;
        alt_bn128.G1Point H;
        alt_bn128.G1Point c;
        alt_bn128.G1Point l;
        alt_bn128.G1Point r;
        uint256 x;
        uint256 xInv;
        uint256[n] challenges;
        uint256[m] otherExponents;
        alt_bn128.G1Point g;
        alt_bn128.G1Point h;
        uint256 prod;
        alt_bn128.G1Point cProof;
        bool[m] bitSet;
        uint256 z;
    }

    function verify(
        uint256 c_x,
        uint256 c_y,
        uint256[2*n] ls,
        // uint256[n] ls_y,
        uint256[2*n] rs,
        // uint256[n] rs_y,
        uint256 A,
        uint256 B
    ) public
    view 
    returns (bool) {
        return verifyWithCustomParams(alt_bn128.G1Point(c_x, c_y), ls, rs, A, B, publicParameters.gs(), publicParameters.hs(), publicParameters.H());
    }

    function verifyWithCustomParams(
        alt_bn128.G1Point c,
        uint256[2*n] ls,
        // uint256[n] ls_y,
        uint256[2*n] rs,
        // uint256[n] rs_y,
        uint256 A,
        uint256 B,
        alt_bn128.G1Point[m] gs,
        alt_bn128.G1Point[m] hs,
        alt_bn128.G1Point H
    ) public
    view 
    returns (bool) {
        emit DebugEvent(2, 0, gasleft());
        Board memory b;
        b.c = c;
        for (uint256 i = 0; i < n; i++) {
            b.l = alt_bn128.G1Point(ls[2*i], ls[2*i+1]);
            b.r = alt_bn128.G1Point(rs[2*i], rs[2*i+1]);
            b.x = uint256(keccak256(b.l.X, b.l.Y, b.c.X, b.c.Y, b.r.X, b.r.Y)).mod();
            b.xInv = b.x.inv();
            // b.c = b.l.mul(b.x.modExp(2))
            //     .add(b.r.mul(b.xInv.modExp(2)))
            //     .add(b.c);
            b.c = b.l.mul(b.x.mul(b.x))
                .add(b.r.mul(b.xInv.mul(b.xInv)))
                .add(b.c);
            b.challenges[i] = b.x;
        }
        emit DebugEvent(2, 1, gasleft());
        b.otherExponents[0] = b.challenges[0];
        for (i = 1; i < n; i++) {
            b.otherExponents[0] = b.otherExponents[0].mul(b.challenges[i]);
        }
        b.otherExponents[0] = b.otherExponents[0].inv();
        for (i = 0; i < m/2; ++i) {
            for (uint256 j = 0; (uint256(1) << j) + i < m; ++j) {
                uint256 i1 = i + (uint256(1) << j);
                if (!b.bitSet[i1]) {
                    b.z = b.challenges[n-1-j].mul(b.challenges[n-1-j]);
                    b.otherExponents[i1] = b.otherExponents[i].mul(b.z);
                    b.bitSet[i1] = true;
                }
            }
        }
        emit DebugEvent(2, 2, gasleft());
        b.g = multiExp(b.otherExponents, gs);
        b.h = multiExpInversed(b.otherExponents, hs);
        b.prod = A.mul(B);
        b.cProof = b.g.mul(A)
            .add(b.h.mul(B))
            .add(H.mul(b.prod));
        emit DebugEvent(2, 3, gasleft());
        return b.cProof.X == b.c.X && b.cProof.Y == b.c.Y;
    }

    function multiExp(uint256[m] ss, alt_bn128.G1Point[m] gs) internal view returns (alt_bn128.G1Point g) {
        g = gs[0].mul(ss[0]);
        for (uint256 i = 1; i < m; i++) {
            g = g.add(gs[i].mul(ss[i]));
        }
    }

    function multiExpInversed(uint256[m] ss, alt_bn128.G1Point[m] hs) internal view returns (alt_bn128.G1Point h) {
        h = hs[0].mul(ss[m-1]);
        for (uint256 i = 1; i < m; i++) {
            h = h.add(hs[i].mul(ss[m-1-i]));
        }
    }
}
