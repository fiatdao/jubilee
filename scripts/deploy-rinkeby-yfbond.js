const { ethers } = require('@nomiclabs/buidler')
const BN = ethers.BigNumber

async function main () {
    const _kek = '0x64496f51779e400C5E955228E56fA41563Fb4dd8'
    const _staking = '0x470D6Cd82918B90AF0d961Eb2620f8a2efcE5ac7'
    const _cv = '0xbFc0d4c6c599552E992b4f599c52D8f4f75ee412'

    const YieldFarmKEK = await ethers.getContractFactory('YieldFarmKek')

    const yfkek = await YieldFarmKEK.deploy(_kek, _staking, _cv)
    await yfkek.deployed()
    console.log('YF_KEK deployed to:', yfkek.address)

    // initialize stuff
    const tenPow18 = BN.from(10).pow(18)
    const kek = await ethers.getContractAt('ERC20', _kek)
    await kek.transfer(_cv, BN.from(60000).mul(tenPow18))

    const communityVault = await ethers.getContractFactory('CommunityVault')
    const cv = await communityVault.attach(_cv)
    await cv.setAllowance(yfkek.address, BN.from(60000).mul(tenPow18))
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
