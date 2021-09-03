const hre = require('hardhat')
const ethers = hre.ethers;

async function deployCommunityVault(entrTokenAddress) {
    await hre.run('compile'); // We are compiling the contracts using subtask
    const [deployer] = await ethers.getSigners(); // We are getting the deployer

    console.log('Deploying contracts with the account:', deployer.address); // We are printing the address of the deployer
    console.log('Account balance:', (await deployer.getBalance()).toString()); // We are printing the account balance

    const CommunityVault = await ethers.getContractFactory("CommunityVault"); // 
    const communityVault = await CommunityVault.deploy(entrTokenAddress);
    console.log(`Waiting for CommunityVault deployment...`);
    await communityVault.deployTransaction.wait(5);

    console.log(`Community Vault Contract deployed. Address: `, communityVault.address);

    console.log(`Verifying ...`);
    await hre.run("verify:verify", {
        address: communityVault.address,
        constructorArguments: [entrTokenAddress],
        contract: "contracts/CommunityVault.sol:CommunityVault",
    });

    console.log('Done!');
}

module.exports = deployCommunityVault;