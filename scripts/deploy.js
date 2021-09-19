const hre = require('hardhat')
const ethers = hre.ethers;
const BN = ethers.BigNumber

async function deployMainnet(entrTokenAddress, communityVaultAddress, startTime, daysPerEpoch) {

    const poolTokenAddresses = [
        { name: 'XYZ', address: '0x618679df9efcd19694bb1daa8d00718eacfa2883' },
        { name: 'MANA', address: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942' },
        { name: 'SAND', address: '0x3845badade8e6dff049820680d1f14bd3903a5d0' },
        { name: 'ILV', address: '0x767fe9edc9e0df98e07454847909b5e959d7ca0e' },
        { name: 'AXS', address: '0xbb0e17ef65f82ab018d8edd776e8dd940327b28b' },
        { name: 'BOND', address: '0x0391d2021f89dc339f60fff84546ea23e337750f' },
        { name: 'SNX', address: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f' },
        // { name: 'LEAG', address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2' }
    ];

    return deploy(entrTokenAddress, communityVaultAddress, startTime, daysPerEpoch, _sushiSwapToken, poolTokenAddresses)
}

async function deployRinkeby(entrTokenAddress, communityVaultAddress, startTime, daysPerEpoch) {

    const poolTokenAddresses = [
        { name: 'XYZ', address: '0xB9FB3ad09457e92c710682BE066bC7b8bA5E42D6' },
        { name: 'MANA', address: '0x6c18AcA9D282fa7077D27ecaa8FC45039e50C42d' },
        { name: 'SAND', address: '0x20e2e606F5e6b608A442Dd43EB3F29ce9aE9Eb08' },
        { name: 'ILV', address: '0xAffA6e1DC32A7ac6fa04Dc5D07dDEFD8AC1C3e48' },
        { name: 'AXS', address: '0x917cc2D7c43a1BdB907080b50b0F124b4e44984E' },
        { name: 'BOND', address: '0x6bBe0A4C0FD35ef717A7D9F0a4184529A1eB65c2' },
        { name: 'SNX', address: '0xA71f0e0FaC12e2c888858C4195B160411e3F9F45' },
        // { name: 'LEAG', address: '0x03561a7965372c2d71b8ba6aE3D84DAa91dA4fd4' }
    ];

    return deploy(entrTokenAddress, communityVaultAddress, startTime, daysPerEpoch, poolTokenAddresses)
}

async function deployGenericYF(communityVaultAddress, entrTokenAddress, stakingAddress, tokenAddress) {
    await hre.run('compile'); // We are compiling the contracts using subtask
    const [deployer] = await ethers.getSigners(); // We are getting the deployer

    console.log('Deploying contracts with the account:', deployer.address); // We are printing the address of the deployer
    console.log('Account balance:', (await deployer.getBalance()).toString()); // We are printing the account balance

    const tenPow18 = BN.from(10).pow(18)
    const cv = await ethers.getContractAt('CommunityVault', communityVaultAddress)
    const staking = await ethers.getContractAt('Staking', stakingAddress)

    const YieldFarmGenericToken = await ethers.getContractFactory('YieldFarmGenericToken')
    const yf = await YieldFarmGenericToken.deploy(tokenAddress, entrTokenAddress, staking.address, communityVaultAddress)
    await yf.deployTransaction.wait(5)
    console.log(`YieldFarmGenericToken pool : `, yf.address)
    await cv.setAllowance(yf.address, BN.from(1000000).mul(tenPow18))

    console.log("Manual initing epoch 0...");
    await staking.manualEpochInit([tokenAddress], 0)

    console.log(`Verifying Token ...`);
    await hre.run("verify:verify", {
        address: yf.address,
        constructorArguments: [tokenAddress, entrTokenAddress, staking.address, communityVaultAddress],
        contract: "contracts/YieldFarmGenericToken.sol:YieldFarmGenericToken",
    });

    console.log('Done!');
}

async function deploySushiLPYF(communityVaultAddress, entrTokenAddress, stakingAddress, _sushiSwapToken) {
    await hre.run('compile'); // We are compiling the contracts using subtask
    const [deployer] = await ethers.getSigners(); // We are getting the deployer

    console.log('Deploying contracts with the account:', deployer.address); // We are printing the address of the deployer
    console.log('Account balance:', (await deployer.getBalance()).toString()); // We are printing the account balance

    const tenPow18 = BN.from(10).pow(18)
    const cv = await ethers.getContractAt('CommunityVault', communityVaultAddress)
    const staking = await ethers.getContractAt('Staking', stakingAddress)

    const YieldFarmSushiLPToken = await ethers.getContractFactory('YieldFarmSushiLPToken')
    const yf = await YieldFarmSushiLPToken.deploy(_sushiSwapToken, entrTokenAddress, staking.address, communityVaultAddress)
    await yf.deployTransaction.wait(5)
    console.log(`YieldFarmSushiLPToken pool : `, yf.address)
    await cv.setAllowance(yf.address, BN.from(13000000).mul(tenPow18))

    console.log("Manual initing epoch 0...");
    await staking.manualEpochInit([_sushiSwapToken], 0)

    console.log(`Verifying Sushi ...`);
    await hre.run("verify:verify", {
        address: yf.address,
        constructorArguments: [_sushiSwapToken, entrTokenAddress, staking.address, communityVaultAddress],
        contract: "contracts/YieldFarmSushiLPToken.sol:YieldFarmSushiLPToken",
    });

    console.log('Done!');
}

async function deploy(entrTokenAddress, communityVaultAddress, startTime, daysPerEpoch, poolTokenAddresses) {
    await hre.run('compile'); // We are compiling the contracts using subtask
    const [deployer] = await ethers.getSigners(); // We are getting the deployer

    const deployedPoolAddresses = [];

    console.log('Deploying contracts with the account:', deployer.address); // We are printing the address of the deployer
    console.log('Account balance:', (await deployer.getBalance()).toString()); // We are printing the account balance

    const Staking = await ethers.getContractFactory('Staking')
    const epochTime = 60 * 60 * 24 * daysPerEpoch;
    const staking = await Staking.deploy(startTime, epochTime)
    await staking.deployed()

    console.log('Staking contract deployed to:', staking.address)

    const YieldFarmGenericToken = await ethers.getContractFactory('YieldFarmGenericToken')

    for (const poolTokenAddress of poolTokenAddresses) {
        console.log(`Deploy ${poolTokenAddress.name} farming`)
        const yf = await YieldFarmGenericToken.deploy(poolTokenAddress.address, entrTokenAddress, staking.address, communityVaultAddress)
        await yf.deployed()
        console.log(`YF pool, ${poolTokenAddress.name}: `, yf.address)
        deployedPoolAddresses.push(yf.address)
    }

    // initialize stuff
    const tenPow18 = BN.from(10).pow(18)
    const cv = await ethers.getContractAt('CommunityVault', communityVaultAddress)

    for (const deployedPoolAddress of deployedPoolAddresses) {
        console.log("Setting allowance...")
        await cv.setAllowance(deployedPoolAddress, BN.from(1000000).mul(tenPow18))
    }


    const poolTokens = poolTokenAddresses.map(x => x.address)

    console.log("Manual initing epoch 0...");
    await staking.manualEpochInit([...poolTokens], 0)

    console.log(`Verifying Staking ...`);
    await hre.run("verify:verify", {
        address: staking.address,
        constructorArguments: [startTime, epochTime],
        contract: "contracts/Staking.sol:Staking",
    });

    for (let i = 0; i < poolTokenAddresses.length; i++) {
        const poolTokenAddress = poolTokenAddresses[i];
        const deployedPoolAddress = deployedPoolAddresses[i];
        console.log(`Verifying ${poolTokenAddress.name} farming`);
        await hre.run("verify:verify", {
            address: deployedPoolAddress,
            constructorArguments: [poolTokenAddress.address, entrTokenAddress, staking.address, communityVaultAddress],
            contract: "contracts/YieldFarmGenericToken.sol:YieldFarmGenericToken",
        })
    }

    console.log('Done!');
}

module.exports = { deployRinkeby, deploySushiLPYF, deployGenericYF, deployMainnet }