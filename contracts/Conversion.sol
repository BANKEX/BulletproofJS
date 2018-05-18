pragma solidity ^0.4.24;

library Conversion {

    function uintToBytes(uint256 self) internal pure returns (bytes memory s) {
        if (self == 0) {
            return "0";
        }
        uint256 maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint256 i = 0;
        uint256 num = self;
        while (num != 0) {
            uint256 remainder = num % 10;
            num = num / 10;
            reversed[i++] = byte(48 + remainder);
        }
        s = new bytes(i);
        for (uint256 j = 0; j < i; j++) {
            s[j] = reversed[i - 1 - j];
        }
        return s;
    }
}