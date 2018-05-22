const GasTester = artifacts.require("GasTester.sol");
const util = require("util");


contract('GasTester', async (accounts) => {
    return;
    const operator = accounts[0]

    it('check single signature', async () => {
        const gasTester = await GasTester.new({from: operator})
        await gasTester.testECADD();
        await gasTester.testECMUL();
        await gasTester.testMODINV();
        await gasTester.testPointGen();
        const addPrice = await gasTester.ECADDPrice();
        console.log("Add price is " + addPrice.toString(10));
        const mulPrice = await gasTester.ECMULPrice();
        console.log("Mul price is " + mulPrice.toString(10));
        const modInvPrice = await gasTester.MODINVPrice();
        console.log("Mod inv price is " + modInvPrice.toString(10));
        const pointGenPrice = await gasTester.pointGenPrice();
        console.log("Point gen price is " + pointGenPrice.toString(10));
    })
})
