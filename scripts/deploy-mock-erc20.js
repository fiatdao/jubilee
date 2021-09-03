const hre = require('hardhat')
const ethers = hre.ethers;

async function deployERC20_18(name, symbol, supply) {
    await hre.run('compile'); // We are compiling the contracts using subtask
    const [deployer] = await ethers.getSigners(); // We are getting the deployer

    console.log('Deploying contracts with the account:', deployer.address); // We are printing the address of the deployer
    console.log('Account balance:', (await deployer.getBalance()).toString()); // We are printing the account balance

    const ERC20Mock = await ethers.getContractFactory("ERC20Mock"); // 
    const erc20MockContract = await ERC20Mock.deploy(name, symbol, supply);
    console.log(`Waiting for ${name} deployment...`);
    await erc20MockContract.deployTransaction.wait(5)

    console.log(`${name} Contract deployed. Address: `, erc20MockContract.address);

    console.log(`Verifying ${name} ...`);
    await hre.run("verify:verify", {
        address: erc20MockContract.address,
        constructorArguments: [name, symbol, supply],
        contract: "contracts/mocks/ERC20Mock.sol:ERC20Mock",
    });

    console.log('Done!');
}

async function deployERC20_6(name, symbol, supply) {
    await hre.run('compile'); // We are compiling the contracts using subtask
    const [deployer] = await ethers.getSigners(); // We are getting the deployer

    console.log('Deploying contracts with the account:', deployer.address); // We are printing the address of the deployer
    console.log('Account balance:', (await deployer.getBalance()).toString()); // We are printing the account balance

    const ERC20Mock6Decimals = await ethers.getContractFactory("ERC20Mock6Decimals"); // 
    const erc20MockContract = await ERC20Mock6Decimals.deploy(name, symbol, supply);
    console.log(`Waiting for ${name} deployment...`);
    await erc20MockContract.deployTransaction.wait(5)

    console.log(`${name} Contract deployed. Address: `, erc20MockContract.address);

    console.log(`Verifying ${name} ...`);
    await hre.run("verify:verify", {
        address: erc20MockContract.address,
        constructorArguments: [name, symbol, supply],
        contract: "contracts/mocks/ERC20Mock6Decimals.sol:ERC20Mock6Decimals",
    });

    console.log('Done!');
}

module.exports = { deployERC20_18, deployERC20_6 };
