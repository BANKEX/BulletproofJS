pragma solidity ^0.4.21;
pragma experimental ABIEncoderV2;

import "./alt_bn128.sol";
import {PublicParameters} from "./PublicParameters.sol";

contract SchnorrVerifier {
    using alt_bn128 for uint256;
    using alt_bn128 for alt_bn128.G1Point;

    function SchnorrVerifier() public {

    }

    function verifySignature(
        bytes32 _hash,
        uint256 _s,
        uint256 _e,
        uint256[2] _generator,
        uint256[2] _publicKey
    ) public
    view 
    returns (bool) {
        alt_bn128.G1Point memory generator = alt_bn128.G1Point(_generator[0], _generator[1]);
        alt_bn128.G1Point memory publicKey = alt_bn128.G1Point(_publicKey[0], _publicKey[1]);
        return verifySignatureAsPoints(_hash, _s, _e, generator, publicKey);
    }


    function verifySignatureAsPoints(
        bytes32 _hash,
        uint256 _s,
        uint256 _e,
        alt_bn128.G1Point _generator,
        alt_bn128.G1Point _publicKey
    ) public
    view 
    returns (bool) {
        alt_bn128.G1Point memory r_V = _generator.mul(_s).add(_publicKey.mul(_e));
        uint256 e_V = uint256(keccak256(r_V.X, r_V.Y, _publicKey.X, _publicKey.Y, _hash));
        return e_V == _e;
    }
}