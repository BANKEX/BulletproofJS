pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import {alt_bn128} from "./alt_bn128.sol";
import {Conversion} from "./Conversion.sol";

contract PublicParameters {

    event VectorCreated(uint256 _i);

    using alt_bn128 for uint256;
    using alt_bn128 for alt_bn128.G1Point;
    using Conversion for uint256;

    uint256 public constant m = 64;
    uint256 public constant n = 6;

    uint256[2] public signatureGenerator;
    uint256[2] public baseG;
    uint256[2] public baseH;
    uint256[m*2] public gVector;
    uint256[m*2] public hVector;
    
    uint256 public lastGcreated = 0;
    uint256 public lastHcreated = 0;

    constructor() public {
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
        emit VectorCreated(lastGcreated);
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

    function generator() public view returns (alt_bn128.G1Point memory p) {
        return assemblePoint(signatureGenerator);
    }

    function G() public view returns (alt_bn128.G1Point memory p) {
        return assemblePoint(peddersenBaseG());
    }

    function H() public view returns (alt_bn128.G1Point memory p) {
        return assemblePoint(peddersenBaseH());
    }

    function gs() public view returns(alt_bn128.G1Point[m] memory points){
        return assemblePointsFromEncodings(getGVector());
    }

    function hs() public view returns(alt_bn128.G1Point[m] memory points){
        return assemblePointsFromEncodings(getHVector());
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