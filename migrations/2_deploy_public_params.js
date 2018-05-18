const fs = require("fs");
const PublicParameters = artifacts.require("PublicParameters.sol");
const EfficientInnerProductVerifier = artifacts.require("EfficientInnerProductVerifier.sol")
const RangeProofVerifier = artifacts.require("RangeProofVerifier.sol")
const M = 16;
const N = 4;

module.exports = async function(deployer, network, accounts) {
    return;
    const operator = accounts[0];
    (async () => {
        await deployer.deploy(PublicParameters, {from: operator})
        const publicParams = await PublicParameters.deployed();
        for (let i = 0; i < 1000; i++) {
            try{
                await publicParams.createGVector()
                await publicParams.createHVector()
            } catch(err) {
                break
            }
        }
        console.log('Complete. Public parameters address: ' + publicParams.address);

        await deployer.deploy(EfficientInnerProductVerifier, publicParams.address, {from: operator});
        const ipVerifier = await EfficientInnerProductVerifier.deployed();

        console.log('Complete. Inner product proof verifier address: ' + ipVerifier.address);

        await deployer.deploy(RangeProofVerifier, publicParams.address, ipVerifier.address, {from: operator});
        const rangeProofVerifier = await RangeProofVerifier.deployed();    
        for (let i = 0; i < 100; i++) {
            try{
                await rangeProofVerifier.producePowers()
            } catch(err) {
                break
            }
        }
        
        // due to async contract address is not saved in not saved in json by truffle
        // so we need to generate details file from within migration
	    let details = {error: false, address: rangeProofVerifier.address, abi: rangeProofVerifier.abi};
	    fs.writeFileSync("build/details", JSON.stringify(details));
	    console.log('Complete. Range proof verifier address: ' + rangeProofVerifier.address);
    })();
    
};
