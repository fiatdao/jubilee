const { ethers } = require('@nomiclabs/buidler')

async function main () {
    const _kek = '0x0391D2021f89DC339F60Fff84546EA23E337750f'
    const _staking = '0xb0Fa2BeEe3Cf36a7Ac7E99B885b48538Ab364853'
    const _cv = '0xA3C299eEE1998F45c20010276684921EBE6423D9'

    const YieldFarmKEK = await ethers.getContractFactory('YieldFarmKek')

    const yfkek = await YieldFarmKEK.deploy(_kek, _staking, _cv)
    await yfkek.deployed()
    console.log('YF_KEK deployed to:', yfkek.address)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
