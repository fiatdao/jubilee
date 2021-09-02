const hre = require('hardhat')
const ethers = hre.ethers;
const BN = ethers.BigNumber

async function deployMainnet(entrTokenAddress, communityVaultAddress, startTime, daysPerEpoch) {
    const _sushiSwapToken = ''; // TODO

    const poolTokenAddresses = [
        { name: 'XYZ', address: '0x618679df9efcd19694bb1daa8d00718eacfa2883' },
        { name: 'MANA', address: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942' },
        { name: 'SAND', address: '0x3845badade8e6dff049820680d1f14bd3903a5d0' },
        { name: 'ILV', address: '0x767fe9edc9e0df98e07454847909b5e959d7ca0e' },
        { name: 'AXS', address: '0xbb0e17ef65f82ab018d8edd776e8dd940327b28b' },
        { name: 'BOND', address: '0x0391d2021f89dc339f60fff84546ea23e337750f' },
        { name: 'SNX', address: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f' },
        { name: 'SUSHI', address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2' }
    ];

    return deploy(entrTokenAddress, communityVaultAddress, startTime, daysPerEpoch, _sushiSwapToken, poolTokenAddresses)
}

async function deployRinkeby(entrTokenAddress, communityVaultAddress, startTime, daysPerEpoch) {
    const _sushiSwapToken = '0x43f0265F0A0E81365051220aa24E9CeC4796a741'

    const poolTokenAddresses = [
        { name: 'ENTER AAVE', address: '0xB81Ed1453Ab2db133A10a8c97888BEbe82cFac9C' },
        { name: 'ENTER XYZ', address: '0x5FfA3420213348a11b54063e3Dc0fda5e87891ab' },
        { name: 'ENTER ILV', address: '0x969e55dFA15396Da623769C0A0D651a187EbDc67' },
        { name: 'ENTER BOND', address: '0x038D06578Bb35EaE582EDfCc869fFa0E93761F2B' }
    ];

    return deploy(entrTokenAddress, communityVaultAddress, startTime, daysPerEpoch, _sushiSwapToken, poolTokenAddresses)
}

async function deploy(entrTokenAddress, communityVaultAddress, startTime, daysPerEpoch, _sushiSwapToken, poolTokenAddresses) {
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

    const YieldFarmSushiLPToken = await ethers.getContractFactory('YieldFarmSushiLPToken')
    const yf = await YieldFarmSushiLPToken.deploy(_sushiSwapToken, entrTokenAddress, staking.address, communityVaultAddress)
    await yf.deployed()
    console.log(`YieldFarmSushiLPToken pool : `, yf.address)
    await cv.setAllowance(yf.address, BN.from(6000000).mul(tenPow18))

    console.log("Manual initing epoch 0...");
    await staking.manualEpochInit([yf.address, ...deployedPoolAddresses], 0)

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

    console.log(`Verifying Sushi ...`);
    await hre.run("verify:verify", {
        address: yf.address,
        constructorArguments: [_sushiSwapToken, entrTokenAddress, staking.address, communityVaultAddress],
        contract: "contracts/YieldFarmSushiLPToken.sol:YieldFarmSushiLPToken",
    });

    console.log('Done!');
}

module.exports = { deployRinkeby }