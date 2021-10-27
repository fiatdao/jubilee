const hre = require('hardhat')
const ethers = hre.ethers;
const BN = ethers.BigNumber

async function deployMainnet(fdtTokenAddress, communityVaultAddress, startTime, daysPerEpoch) {

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

    return deploy(fdtTokenAddress, communityVaultAddress, startTime, daysPerEpoch, _sushiSwapToken, poolTokenAddresses)
}

async function deployRinkeby(fdtTokenAddress, communityVaultAddress, startTime, daysPerEpoch) {
    const poolTokenAddresses = [
        // { name: 'BOND', address: '0x81Ea2B191bfD1C24bbFb5C9297d8a2f6352602cb' },
        { name: 'UMA', address: '0xdb8fBc92a9D53226980D2B0bAeDa42484B0ce562' },
        { name: 'MKR', address: '0xf6bA9907D08fE2589Cc41B9f1ae41EFBA8C5f273' },
        { name: 'YFI', address: '0xE8643102261D5c4E1e2E3A082fea7251f58A7feb' },
        { name: 'RGT', address: '0xefB37Add677c809075535Dc2CefA386b5B5A1F0f' },
        { name: 'wsOHM', address: '0xAccDB008350e163D33a98357EF86Bd3A4092df61' }
        // { name: 'LEAG', address: '0x03561a7965372c2d71b8ba6aE3D84DAa91dA4fd4' }
    ];

    return deploy(fdtTokenAddress, communityVaultAddress, startTime, daysPerEpoch, poolTokenAddresses)
}

async function deployGenericYF(communityVaultAddress, fdtTokenAddress, stakingAddress, tokenAddress) {
    await hre.run('compile'); // We are compiling the contracts using subtask
    const [deployer] = await ethers.getSigners(); // We are getting the deployer

    console.log('Deploying contracts with the account:', deployer.address); // We are printing the address of the deployer
    console.log('Account balance:', (await deployer.getBalance()).toString()); // We are printing the account balance

    const tenPow18 = BN.from(10).pow(18)
    const cv = await ethers.getContractAt('CommunityVault', communityVaultAddress)
    const staking = await ethers.getContractAt('Staking', stakingAddress)

    const YieldFarmGenericToken = await ethers.getContractFactory('YieldFarmGenericToken')
    const yf = await YieldFarmGenericToken.deploy(tokenAddress, fdtTokenAddress, staking.address, communityVaultAddress)
    await yf.deployTransaction.wait(5)
    console.log(`YieldFarmGenericToken pool : `, yf.address)
    await cv.setAllowance(yf.address, BN.from(1000000).mul(tenPow18))

    console.log("Manual initing epoch 0...");
    await staking.manualEpochInit([tokenAddress], 0)

    console.log(`Verifying Token ...`);
    await hre.run("verify:verify", {
        address: yf.address,
        constructorArguments: [tokenAddress, fdtTokenAddress, staking.address, communityVaultAddress],
        contract: "contracts/YieldFarmGenericToken.sol:YieldFarmGenericToken",
    });

    console.log('Done!');
}

async function deploySushiLPYF(communityVaultAddress, fdtTokenAddress, stakingAddress, _sushiSwapToken) {
    await hre.run('compile'); // We are compiling the contracts using subtask
    const [deployer] = await ethers.getSigners(); // We are getting the deployer

    console.log('Deploying contracts with the account:', deployer.address); // We are printing the address of the deployer
    console.log('Account balance:', (await deployer.getBalance()).toString()); // We are printing the account balance

    const tenPow18 = BN.from(10).pow(18)
    const cv = await ethers.getContractAt('CommunityVault', communityVaultAddress)
    const staking = await ethers.getContractAt('Staking', stakingAddress)

    const YieldFarmSushiLPToken = await ethers.getContractFactory('YieldFarmSushiLPToken')
    const yf = await YieldFarmSushiLPToken.deploy(_sushiSwapToken, fdtTokenAddress, staking.address, communityVaultAddress)
    await yf.deployTransaction.wait(5)
    console.log(`YieldFarmSushiLPToken pool : `, yf.address)
    // TODO Change with the correct amount
    await cv.setAllowance(yf.address, BN.from(200000).mul(tenPow18))

    console.log("Manual initing epoch 0...");
    await staking.manualEpochInit([_sushiSwapToken], 0)

    console.log(`Verifying Sushi ...`);
    await hre.run("verify:verify", {
        address: yf.address,
        constructorArguments: [_sushiSwapToken, fdtTokenAddress, staking.address, communityVaultAddress],
        contract: "contracts/YieldFarmSushiLPToken.sol:YieldFarmSushiLPToken",
    });

    console.log('Done!');
}

async function deploy(fdtTokenAddress, communityVaultAddress, startTime, daysPerEpoch, poolTokenAddresses) {
    await hre.run('compile'); // We are compiling the contracts using subtask
    const [deployer] = await ethers.getSigners(); // We are getting the deployer

    const deployedPoolAddresses = [];

    console.log('Deploying contracts with the account:', deployer.address); // We are printing the address of the deployer
    console.log('Account balance:', (await deployer.getBalance()).toString()); // We are printing the account balance

    const epochTime = 60 * 60 * 24 * daysPerEpoch;

    // TODO uncomment for already deployed staking
    // const staking = await ethers.getContractAt('Staking', "0x9E5b1200973d32DF419e5a3900A7065aaEcBd652")
    const Staking = await ethers.getContractFactory('Staking')
    const staking = await Staking.deploy(startTime, epochTime)
    await staking.deployTransaction.wait(5)

    console.log('Staking contract deployed to:', staking.address)

    const YieldFarmGenericToken = await ethers.getContractFactory('YieldFarmGenericToken')

    for (const poolTokenAddress of poolTokenAddresses) {
        console.log(`Deploy ${poolTokenAddress.name} farming`)
        const yf = await YieldFarmGenericToken.deploy(poolTokenAddress.address, fdtTokenAddress, staking.address, communityVaultAddress)
        await yf.deployTransaction.wait(5)

        console.log(`YF pool, ${poolTokenAddress.name}: `, yf.address)
        deployedPoolAddresses.push(yf.address)
    }

    // initialize stuff
    const tenPow18 = BN.from(10).pow(18)
    const cv = await ethers.getContractAt('CommunityVault', communityVaultAddress)

    for (const deployedPoolAddress of deployedPoolAddresses) {
        console.log("Setting allowance...")
        // TODO Change the allowance based on the token rewards
        await cv.setAllowance(deployedPoolAddress, BN.from(2000000).mul(tenPow18))
    }

    const poolTokens = poolTokenAddresses.map(x => x.address)

    console.log("Manual initing epoch 0...");
    await staking.manualEpochInit([...poolTokens], 0)

    // TODO comment out when Staking is already verified
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
            constructorArguments: [poolTokenAddress.address, fdtTokenAddress, staking.address, communityVaultAddress],
            contract: "contracts/YieldFarmGenericToken.sol:YieldFarmGenericToken",
        })
    }

    console.log('Done!');
}

module.exports = { deployRinkeby, deploySushiLPYF, deployGenericYF, deployMainnet }
