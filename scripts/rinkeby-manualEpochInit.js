const { ethers } = require('hardhat')

async function main () {
    const tokens = [
        '0x7bdf7a5ab7a18985d1b1cb09b69338ba0c78f416',
        '0x2b9781477b64e48a263854B778d548Fc9560CbB5',
        '0xfdf1a271f12148e11254dd63178ee1fbb8b4c75e',
        '0xdf695cf3118d504c33415cbc465dd469b7e4c881',
        '0x449ae80a139e724dd2506b8b312e898bf713fea9',
        '0xf3461cd59e3a3c25fd5f4c471df724a74cec4eeb',
        '0xff85fe0a2e8d66b9101305ab1522a37e0a50c4ef',
        '0xe0dddd62431f705325f8d1e0474a31589622f54a'
    ]

    const _staking = '0x831B60137F2f9F37846BEB61C8E0913eb4BeC41b'
    const s = await ethers.getContractAt('Staking', _staking)

    const currentEpoch = parseInt(await s.getCurrentEpoch())
    console.log(`Current epoch is: ${currentEpoch}`)

    const initializedEpochs = {}

    for (const token of tokens) {
        console.log(`Getting data for token ${token}`)
        for (let i = currentEpoch + 1; i >= 0; i--) {
            const ok = await s.epochIsInitialized(token, i)
            if (ok) {
                console.log(`${token} last initialized epoch: ${i}`)
                initializedEpochs[token] = i
                break
            }
        }

        if (initializedEpochs[token] === undefined) {
            initializedEpochs[token] = -1
        }
    }

    for (const token of tokens) {
        for (let i = initializedEpochs[token] + 1; i < currentEpoch; i++) {
            console.log(`${token}: trying to init epoch ${i}`)

            try {
                await s.manualEpochInit([token], i, {gasLimit: 100000})
                console.log(`${token}: trying to init epoch ${i} -- done`)
            } catch (e) {
                console.log(`${token}: trying to init epoch ${i} -- error`)
            }

            await sleep(1000)
        }
    }

    console.log('Done')
}

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
