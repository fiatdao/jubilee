const { ethers } = require('hardhat')

const _xyz = '0x86dEddCFc3a7DBeE68cDADA65Eed3D3b70F4fe24'
async function main () {
    const communityVault = await ethers.getContractFactory('CommunityVault')
    const cv = await communityVault.deploy(_xyz)
    await cv.deployed()
    console.log('CommunityVault deployed to:', cv.address)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
