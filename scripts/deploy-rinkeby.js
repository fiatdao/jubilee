const { ethers } = require('hardhat')
const BN = ethers.BigNumber

async function main() {
    const _xyz = '0x86dEddCFc3a7DBeE68cDADA65Eed3D3b70F4fe24'
    const _cv = '0x3317cc09ce0da6751b4E0b7c56114bA833D3d232'
    const _sushiSwapToken = '0xfade438388f1fc3b1030c58bafdc91bfad162d4f'

    const poolTokenAddresses = [
        { name: 'AAVE XYZ 1', address: '0x7bdf7a5ab7a18985d1b1cb09b69338ba0c78f416' },
        { name: 'COMP XYZ 1', address: '0xfdf1a271f12148e11254dd63178ee1fbb8b4c75e' },
        { name: 'BOND XYZ 1', address: '0xdf695cf3118d504c33415cbc465dd469b7e4c881' },
        { name: 'ILV XYZ 1', address: '0x449ae80a139e724dd2506b8b312e898bf713fea9' },
        { name: 'SUSHI XYZ 1', address: '0xf3461cd59e3a3c25fd5f4c471df724a74cec4eeb' },
        { name: 'SNX XYZ 1', address: '0xff85fe0a2e8d66b9101305ab1522a37e0a50c4ef' },
        { name: 'LINK XYZ 1', address: '0x2b9781477b64e48a263854B778d548Fc9560CbB5' },
    ];

    const deployedPoolAddresses = [];

    // We get the contract to deploy
    const Staking = await ethers.getContractFactory('Staking')
    // start at Fri May 07 2021 06:00:00 GMT+0000; epoch duration 7 days
    const staking = await Staking.deploy(1621418400, 4*3600)
    await staking.deployed()

    console.log('Staking contract deployed to:', staking.address)

    const YieldFarmGenericToken = await ethers.getContractFactory('YieldFarmGenericToken')

    for (const poolTokenAddress of poolTokenAddresses) {
        console.log(`Deploy ${poolTokenAddress.name}`)
        const yf = await YieldFarmGenericToken.deploy(poolTokenAddress.address, _xyz, staking.address, _cv)
        await yf.deployed()
        console.log(`YF pool, ${poolTokenAddress.name}: `, yf.address)
        deployedPoolAddresses.push(yf.address)
    }

     // initialize stuff
     const tenPow18 = BN.from(10).pow(18)
     const cv = await ethers.getContractAt('CommunityVault', _cv)

    for (const deployedPoolAddress of deployedPoolAddresses) {
        await cv.setAllowance(deployedPoolAddress, BN.from(10000).mul(tenPow18))
    }

    const YieldFarmSushiLPToken = await ethers.getContractFactory('YieldFarmSushiLPToken')
    const yf = await YieldFarmSushiLPToken.deploy(_sushiSwapToken, _xyz, staking.address, _cv)
    await yf.deployed()
    console.log(`YieldFarmSushiLPToken pool : `, yf.address)
    await cv.setAllowance(yf.address, BN.from(10000).mul(tenPow18))
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
