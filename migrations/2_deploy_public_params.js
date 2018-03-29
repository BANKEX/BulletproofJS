const fs = require("fs");
const PublicParameters = artifacts.require("PublicParameters.sol");
const EfficientInnerProductVerifier = artifacts.require("EfficientInnerProductVerifier.sol")
const RangeProofVerifier = artifacts.require("RangeProofVerifier.sol")
const M = 64;
const N = 6;

module.exports = async function(deployer, network, accounts) {
    const operator = accounts[0];
    (async () => {
        await deployer.deploy(PublicParameters, {from: operator})
        const publicParams = await PublicParameters.deployed();
        for (let i = 0; i < M/8; i++) {
            try{
                const res = await publicParams.createGVector()
            } catch(err) {
                console.log("G")
                console.log("i = " + i);
                console.log(err)
            }
        }
        for (let i = 0; i < M/8; i++) {
            try{
                const res = await publicParams.createHVector()
            } catch(err) {
                console.log("H")
                console.log("i = " + i);
                console.log(err)
            }
        }
        console.log('Complete. Public parameters address: ' + publicParams.address);

        await deployer.deploy(EfficientInnerProductVerifier, publicParams.address, {from: operator});
        const ipVerifier = await EfficientInnerProductVerifier.deployed();

        console.log('Complete. Inner product proof verifier address: ' + ipVerifier.address);

        await deployer.deploy(RangeProofVerifier, publicParams.address, ipVerifier.address, {from: operator});
        const rangeProofVerifier = await RangeProofVerifier.deployed();    
        for (let i = 0; i < M/8; i++) {
            try{
                const res = await rangeProofVerifier.producePowers()
            } catch(err) {
                console.log("Error producing powers")
                console.log("i = " + i);
                console.log(err)
            }
        }
        
        // due to async contract address is not saved in not saved in json by truffle
        // so we need to generate details file from within migration
	    let details = {error: false, address: rangeProofVerifier.address, abi: rangeProofVerifier.abi};
	    fs.writeFileSync("build/details", JSON.stringify(details));
	    console.log('Complete. Range proof verifier address: ' + rangeProofVerifier.address);
    })();
    
};
