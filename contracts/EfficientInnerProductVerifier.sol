pragma solidity ^0.4.21;
pragma experimental ABIEncoderV2;

import "./alt_bn128.sol";
import {PublicParametersInterface} from "./PublicParameters.sol";

contract EfficientInnerProductVerifier {
    using alt_bn128 for uint256;
    using alt_bn128 for alt_bn128.G1Point;

    uint256 public constant m = 256;
    uint256 public constant n = 8;
    PublicParametersInterface public publicParameters;

    function EfficientInnerProductVerifier(
        address _publicParameters
        // uint256 H_x,
        // uint256 H_y,
        // uint256[2 * m] gs_coords,
        // uint256[2 * m] hs_coords
    ) public {
        require(_publicParameters != address(0));
        publicParameters = PublicParametersInterface(_publicParameters);
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
        uint256[n] ls_x,
        uint256[n] ls_y,
        uint256[n] rs_x,
        uint256[n] rs_y,
        uint256 A,
        uint256 B
    ) external view returns (bool) {
        alt_bn128.G1Point memory H = assemblePoint(publicParameters.peddersenBaseH());
        alt_bn128.G1Point[m] memory hs = assemblePointsFromEncodings(publicParameters.getHVector());
        return verifyWithCustomParams(alt_bn128.G1Point(c_x, c_y), ls_x, ls_y, rs_x, rs_y, A, B, hs, H);
    }

    function assemblePointsFromEncodings(uint256[m*2] _pointsEncoding) internal pure returns(alt_bn128.G1Point[m] memory points) {
        for (uint256 i = 0; i < m; i++) {
            points[i] = alt_bn128.G1Point(_pointsEncoding[2*i], _pointsEncoding[2*i + 1]);
        }
        return points;
    }

    function assemblePoint(uint256[2] _encoding) internal pure returns(alt_bn128.G1Point memory point) {
        return alt_bn128.G1Point(_encoding[0], _encoding[1]);
    }


    function verifyWithCustomParams(
        alt_bn128.G1Point c,
        uint256[n] ls_x,
        uint256[n] ls_y,
        uint256[n] rs_x,
        uint256[n] rs_y,
        uint256 A,
        uint256 B,
        alt_bn128.G1Point[m] hs,
        alt_bn128.G1Point H
    ) public view returns (bool) {
        Board memory b;
        b.c = c;
        for (uint8 i = 0; i < n; i++) {
            b.l = alt_bn128.G1Point(ls_x[i], ls_y[i]);
            b.r = alt_bn128.G1Point(rs_x[i], rs_y[i]);
            b.x = uint256(keccak256(b.l.X, b.l.Y, b.c.X, b.c.Y, b.r.X, b.r.Y)).mod();
            b.xInv = b.x.inv();
            b.c = b.l.mul(b.x.modExp(2))
                .add(b.r.mul(b.xInv.modExp(2)))
                .add(b.c);
            b.challenges[i] = b.x;
        }

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

        b.g = multiExpGs(b.otherExponents);
        b.h = multiExpHsInversed(b.otherExponents, hs);
        b.prod = A.mul(B);
        b.cProof = b.g.mul(A)
            .add(b.h.mul(B))
            .add(H.mul(b.prod));
        return b.cProof.X == b.c.X && b.cProof.Y == b.c.Y;
    }

    function multiExpGs(uint256[m] ss) internal view returns (alt_bn128.G1Point g) {
        alt_bn128.G1Point[m] memory gs = assemblePointsFromEncodings(publicParameters.getGVector());
        g = gs[0].mul(ss[0]);
        for (uint256 i = 1; i < m; i++) {
            g = g.add(gs[i].mul(ss[i]));
        }
    }

    function multiExpHsInversed(uint256[m] ss, alt_bn128.G1Point[m] hs) internal view returns (alt_bn128.G1Point h) {
        h = hs[0].mul(ss[m-1]);
        for (uint256 i = 1; i < m; i++) {
            h = h.add(hs[i].mul(ss[m-1-i]));
        }
    }
}
