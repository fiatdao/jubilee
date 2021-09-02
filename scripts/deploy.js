const hre = require('hardhat')
const ethers = hre.ethers;
const BN = ethers.BigNumber

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
        await cv.setAllowance(deployedPoolAddress, BN.from(100000).mul(tenPow18))
    }

    const YieldFarmSushiLPToken = await ethers.getContractFactory('YieldFarmSushiLPToken')
    const yf = await YieldFarmSushiLPToken.deploy(_sushiSwapToken, entrTokenAddress, staking.address, communityVaultAddress)
    await yf.deployed()
    console.log(`YieldFarmSushiLPToken pool : `, yf.address)
    await cv.setAllowance(yf.address, BN.from(600000).mul(tenPow18))

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