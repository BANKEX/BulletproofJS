pragma solidity ^0.4.24;

library alt_bn128 {

    // uint256 public constant q = 21888242871839275222246405745257275088548364400416034343698204186575808495617; // curve order
    // uint256 public constant n = 21888242871839275222246405745257275088696311157297823662689037894645226208583; // prime field order
    // uint256 public constant b = 3;

    // uint256 constant public ECSignMask = 0x8000000000000000000000000000000000000000000000000000000000000000;
    // uint256 constant public BigModExponent = (n + 1)/4;

    struct G1Point {
        uint256 X;
        uint256 Y;
    }

    function add(G1Point p1, G1Point p2) internal view returns (G1Point r) {
        uint256[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        assembly {
            if iszero(staticcall(not(0), 6, input, 0x80, r, 0x40)) {
                revert(0, 0)
            }
        }
    }

    // function add(uint256[2] p1, uint256[2] p2) internal view returns (uint256[2] r) {
    //     uint256[4] memory input;
    //     input[0] = p1[0];
    //     input[1] = p1[1];
    //     input[2] = p2[0];
    //     input[3] = p2[1];
    //     assembly {
    //         if iszero(staticcall(not(0), 6, input, 0x80, r, 0x40)) {
    //             revert(0, 0)
    //         }
    //     }
    // }

    // function mul(uint256[2] P, uint256 s) internal view returns (uint256[2] R) {
    //     uint256[3] memory input;
    //     input[0] = P[0];
    //     input[1] = P[1];
    //     input[2] = s;
    //     assembly {
    //         if iszero(staticcall(not(0), 7, input, 0x60, R, 0x40)) {
    //             revert(0, 0)
    //         }
    //     }
    // }

    function mul(G1Point p, uint256 s) internal view returns (G1Point r) {
        uint256[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        assembly {
            if iszero(staticcall(not(0), 7, input, 0x60, r, 0x40)) {
                revert(0, 0)
            }
        }
    }

    function neg(G1Point p) internal pure returns (G1Point) {
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        uint256 n = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        return G1Point(p.X, n - p.Y);
        // return G1Point(p.X, n - (p.Y % n));
    }

    function eq(G1Point p1, G1Point p2) internal pure returns (bool) {
        return p1.X == p2.X && p1.Y == p2.Y;
    }

    function add(uint256 x, uint256 y) internal pure returns (uint256) {
        uint256 q = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        return addmod(x, y, q);
    }

    function mul(uint256 x, uint256 y) internal pure returns (uint256) {
        uint256 q = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        return mulmod(x, y, q);
    }

    // function inv2(uint256 x) internal view returns (uint256) {
    //     uint256 q = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    //     return modExp(x, q - 2, q);
    // }

    function inv(uint256 x) internal pure returns (uint) {
        uint256 p = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        uint256 a = x;
        if (a == 0)
            return 0;
        if (a > p)
            a = a % p;
        int t1;
        int t2 = 1;
        uint r1 = p;
        uint r2 = a;
        uint q;
        while (r2 != 0) {
            q = r1 / r2;
            (t1, t2, r1, r2) = (t2, t1 - int(q) * t2, r2, r1 - q * r2);
        }
        if (t1 < 0)
            return (p - uint(-t1));
        return uint(t1);
    }

    function mod(uint256 x) internal pure returns (uint256) {
        uint256 q = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        return x % q;
    }

    function sub(uint256 x, uint256 y) internal pure returns (uint256) {
        uint256 q = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        return x >= y ? x - y : q - y + x;
    }

    function neg(uint256 x) internal pure returns (uint256) {
        return 21888242871839275222246405745257275088548364400416034343698204186575808495617 - x;
    }

    function modExp(uint256 base, uint256 exponent, uint256 modulus) internal view returns (uint256) {
        uint256[6] memory input;
        uint256[1] memory output;
        input[0] = 0x20;  // length_of_BASE
        input[1] = 0x20;  // length_of_EXPONENT
        input[2] = 0x20;  // length_of_MODULUS
        input[3] = base;
        input[4] = exponent;
        input[5] = modulus;
        assembly {
            if iszero(staticcall(not(0), 5, input, 0xc0, output, 0x20)) {
                revert(0, 0)
            }
        }
        return output[0];
    }

    function modExp(uint256 base, uint256 exponent) internal view returns (uint256) {
        uint256 q = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        return modExp(base, exponent, q);
    }

    function hashToCurve(bytes input) internal view returns (G1Point p) {
        uint256 seed = uint256(keccak256(input));
        return uintToCurvePoint(seed);
    }

    function uintToCurvePoint(uint256 x) internal view returns(G1Point p) {
        uint256 n = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        uint256 seed = x % n;
        uint256 y;
        seed -= 1;
        bool onCurve = false;
        uint256 y2;
        uint256 b = uint256(3);
        while(!onCurve) {
            seed += 1;
            y2 = mulmod(seed, seed, n);
            y2 = mulmod(y2, seed, n);
            y2 = addmod(y2, b, n);
            // y2 += b;
            y = modExp(y2, (n + 1) / 4, n);
            onCurve = mulmod(y, y, n) == y2;
        }
        return G1Point(seed, y);
    }
}
