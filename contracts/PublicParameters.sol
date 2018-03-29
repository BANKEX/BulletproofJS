pragma solidity ^0.4.21;
// pragma experimental ABIEncoderV2;

import {alt_bn128} from "./alt_bn128.sol";
import {Conversion} from "./Conversion.sol";

// m = 256 implied in interface

interface PublicParametersInterface {
    function m() external view returns (uint256 mValue);
    function n() external view returns (uint256 nValue);
    function signaturePublicGenerator() external pure returns (uint256[2] point);
    function peddersenBaseG() external view returns (uint256[2] point);
    function peddersenBaseH() external view returns (uint256[2] point);
    function getGVectorComponent(uint256 index) external view returns (uint256[2] point);
    function getHVectorComponent(uint256 index) external view returns (uint256[2] point); 
    function getGVector() external view returns (uint256[2*256] points);
    function getHVector() external view returns (uint256[2*256] points);
}

contract PublicParameters {
    using alt_bn128 for uint256;
    using alt_bn128 for alt_bn128.G1Point;
    using Conversion for uint256;
    uint256 public constant m = 256;
    uint256 public constant n = 8;


    // uint256 public constant PrimeOrder = alt_bn128.n;
    // uint256 public constant CurveOrder = alt_bn128.q;
    // uint256 public constant PrimeOrder = 21888242871839275222246405745257275088548364400416034343698204186575808495617; // curve order
    // uint256 constant public N = 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001;
    
    // uint256 public constant CurveOrder = 21888242871839275222246405745257275088696311157297823662689037894645226208583; // prime field order
    // uint256 constant public P = 0x30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47;
    
    // uint256 constant public ECSignMask = 0x8000000000000000000000000000000000000000000000000000000000000000;
    // uint256 constant public BigModExponent = (PrimeOrder + 1)/4;
    // uint256 constant public a = 5472060717959818805561601436314318772174077789324455915672259473661306552146;
    // uint256 constant public a = 0xc19139cb84c680a6e14116da060561765e05aa45a1c72a34f082305b61f3f52; // (p+1)/4
    
    uint256[2] public signatureGenerator;
    uint256[2] public baseG;
    uint256[2] public baseH;
    uint256[m*2] public gVector;
    uint256[m*2] public hVector;
    
    uint256 lastGcreated = 0;
    uint256 lastHcreated = 0;

    function PublicParameters() public {
        signatureGenerator = signaturePublicGenerator();
        baseG = peddersenBaseG();
        baseH = peddersenBaseH();
    }

    function createGVector() public returns (bool success) {
        require(lastGcreated < m);
        uint256 maxToCreate = m - lastGcreated;
        if (maxToCreate > n) {
            maxToCreate = n;
        }
        uint256[2] memory reusablePoints;
        for (uint256 i = lastGcreated; i < lastGcreated+maxToCreate; i++) {
            reusablePoints = getGVectorComponent(i);
            gVector[i*2] = reusablePoints[0];
            gVector[i*2 + 1] = reusablePoints[1];
        }
        lastGcreated = lastGcreated+maxToCreate;
        return true;
    }

    function createHVector() public returns (bool success) {
        require(lastHcreated < m);
        uint256 maxToCreate = m - lastHcreated;
        if (maxToCreate > n) {
            maxToCreate = n;
        }
        uint256[2] memory reusablePoints;
        for (uint256 i = lastHcreated; i < lastHcreated+maxToCreate; i++) {
            reusablePoints = getHVectorComponent(i);
            hVector[i*2] = reusablePoints[0];
            hVector[i*2 + 1] = reusablePoints[1];
        }
        lastHcreated = lastHcreated+maxToCreate;
        return true;
    }

    function signaturePublicGenerator() public pure returns (uint256[2] point) {
        return [uint256(1), uint256(2)];
    }

    function peddersenBaseG() public view returns (uint256[2] point) {
        bytes32 h = keccak256("G");
        alt_bn128.G1Point memory g1p = alt_bn128.uintToCurvePoint(uint256(h));
        return [g1p.X, g1p.Y];
    }
    
    function peddersenBaseH() public view returns (uint256[2] point) {
        bytes32 h = keccak256("H");
        alt_bn128.G1Point memory g1p = alt_bn128.uintToCurvePoint(uint256(h));
        return [g1p.X, g1p.Y];
    }

    function getGVectorComponent(uint256 index) public view returns (uint256[2] point) {
        require(index < m);
        bytes32 h = keccak256("G", index.uintToBytes());
        alt_bn128.G1Point memory g1p = alt_bn128.uintToCurvePoint(uint256(h));
        return [g1p.X, g1p.Y];
    }

    function getHVectorComponent(uint256 index) public view returns (uint256[2] point) {
        require(index < m);
        bytes32 h = keccak256("H", index.uintToBytes());
        alt_bn128.G1Point memory g1p = alt_bn128.uintToCurvePoint(uint256(h));
        return [g1p.X, g1p.Y];
    }
    
    function getGVector() public view returns (uint256[2*m] points) {
        uint256[2] memory reusablePoints;
        for (uint256 i = 0; i < m; i++) {
            reusablePoints = getGVectorComponent(i);
            points[i*2] = reusablePoints[0];
            points[i*2 + 1] = reusablePoints[1];
        }
        return points;
    }
    
    function getHVector() public view returns (uint256[2*m] points) {
        uint256[2] memory reusablePoints;
        for (uint256 i = 0; i < m; i++) {
            reusablePoints = getHVectorComponent(i);
            points[i*2] = reusablePoints[0];
            points[i*2 + 1] = reusablePoints[1];
        }
        return points;
    }

    // function uintToString(uint256 index) internal pure returns(bytes memory res) {
    //     res = index.uintToBytes();
    //     if (res.length == 0) {
    //         return "0";
    //     }
    //     return res;
    // }

    // function testToString(uint256 index) public view returns(bytes res) {
    //     require(index < m);
    //     return index.uintToBytes();
    // }

    // function testHash(uint256 index) public view returns(uint256 res) {
    //     require(index < m);
    //     bytes32 h = keccak256("G", index.uintToBytes());
    //     return uint256(h);
    // }

    // function testHashAsBytes(uint256 index) public view returns(bytes32 res) {
    //     require(index < m);
    //     bytes32 h = keccak256("G", index.uintToBytes());
    //     return h;
    // }
}