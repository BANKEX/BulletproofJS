# BulletproofJS

## This set of tools is not ready for production and is listed for use only for projects of BANKEX Foundation "Proof-of-Skill" hackathon in Moscow on 19-20th of May, 2018

# Features

- Set of local provers and verifiers for BulletProof range proofs (almost 1 to 1 compatible (hashing algo now always pads)) with the original work from [Stanford](https://github.com/bbuenz/BulletProofLib)).
- Set of Ethereum smart-contracts for verification only, as well as libs for EC arithmetics and public parameters generation using "nothing up my sleeve" numbers.
- Prototype Confidential Transactions contract taking care of various tokens, deposits, key exchange.
- AES encryption for exchange of transaction values and blinding factors out of the box.

# TODO

- Add Ethereum smart-contracts for key derivation, although using it is HIGHLY DISCOURAGED on any non-user controlled node.
- Improve key exchange to have separate viewing and spending keys.
- Improve gas costs by may be adding shifts.

## Authors

- Alex Vlasov, [@shamatar](https://github.com/shamatar),  av@bankexfoundation.org
- Sergey Vasilyev, [@swasilyev](https://github.com/swasilyev),  swasilyev@gmail.com

## License

All source code and information in this repository is available under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License. See the [LICENSE](https://github.com/BANKEX/PlasmaParentContract/blob/master/LICENSE) file for more info.